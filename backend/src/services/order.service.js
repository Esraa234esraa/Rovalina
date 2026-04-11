import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { sendOrderNotification } from './whatsapp.service.js';

const buildOrderNumber = () => `ORD-${Date.now()}`;

const createAdminOrderNotifications = async (tx, { order, title, message, type }) => {
  const adminUsers = await tx.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    select: { id: true },
  });

  if (!adminUsers.length) return;

  await tx.notification.createMany({
    data: adminUsers.map((adminUser) => ({
      userId: adminUser.id,
      type,
      title,
      message,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total || 0),
        status: order.status,
      },
    })),
  });
};

const calculateTotals = async (subtotal) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'STORE' } });

  const shippingFeeRaw = settings?.enableShipping
    ? subtotal >= Number(settings?.freeShippingMinimum || 0)
      ? 0
      : Number(settings?.shippingFee || 0)
    : 0;

  const taxAmountRaw = settings?.enableTax
    ? (subtotal * Number(settings?.taxRate || 0)) / 100
    : 0;

  const shippingFee = Number(shippingFeeRaw.toFixed(2));
  const taxAmount = Number(taxAmountRaw.toFixed(2));
  const discountAmount = 0;
  const total = Number((subtotal + shippingFee + taxAmount - discountAmount).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shippingFee,
    taxAmount,
    discountAmount,
    total,
    currency: 'EGP',
  };
};

export const orderService = {
  async calculateTotalFromCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                stock: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    for (const item of cart.items) {
      if (!item.product || item.product.status !== 'ACTIVE') {
        throw new ApiError(400, `Product is unavailable: ${item.product?.name || item.productId}`);
      }
      if (item.quantity > item.product.stock) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.price) * item.quantity,
      0
    );

    return calculateTotals(subtotal);
  },

  async createOrderFromCart(userId, payload) {
    const {
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      city,
      governorate,
      postalCode,
      addressLine,
      notes,
      shippingAddressId,
    } = payload;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                price: true,
                stock: true,
                name: true,
                sku: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    const orderItemsData = cart.items.map((item) => {
      const product = item.product;
      if (!product || product.status !== 'ACTIVE') {
        throw new ApiError(400, `Product is unavailable: ${product?.name || item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      const unitPrice = Number(product.price);
      const quantity = Number(item.quantity);

      return {
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice: Number((unitPrice * quantity).toFixed(2)),
        selectedColor: null,
        productName: product.name,
        productSku: product.sku,
      };
    });

    const subtotal = orderItemsData.reduce((sum, it) => sum + it.totalPrice, 0);
    const totals = await calculateTotals(subtotal);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: buildOrderNumber(),
          userId,
          shippingAddressId: shippingAddressId || null,
          paymentMethod: paymentMethod || 'COD',
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          taxAmount: totals.taxAmount,
          discountAmount: totals.discountAmount,
          total: totals.total,
          currency: totals.currency,
          customerName,
          customerEmail,
          customerPhone,
          city,
          governorate,
          postalCode,
          addressLine,
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await createAdminOrderNotifications(tx, {
        order: createdOrder,
        title: 'طلب جديد',
        message: `تم إنشاء الطلب ${createdOrder.orderNumber} بإجمالي ${Number(createdOrder.total || 0)} ج.م`,
        type: 'ORDER_CREATED',
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return createdOrder;
    });

    void sendOrderNotification(order).catch((error) => {
      console.error('Failed to send WhatsApp order notification:', error);
    });

    return order;
  },

  async createOrder(payload, userId = null) {
    const {
      items,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      city,
      governorate,
      postalCode,
      addressLine,
      notes,
      shippingFee = 0,
      taxAmount = 0,
      discountAmount = 0,
      shippingAddressId,
    } = payload;

    if (!Array.isArray(items) || items.length === 0) {
      throw new ApiError(400, 'Order items are required');
    }

    const productIds = items.map((it) => it.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, price: true, stock: true, name: true, sku: true },
    });

    const map = new Map(products.map((p) => [p.id, p]));

    const orderItemsData = items.map((it) => {
      const product = map.get(it.productId);
      if (!product) {
        throw new ApiError(404, `Product not found: ${it.productId}`);
      }
      if (product.stock < it.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}`);
      }

      const unitPrice = Number(product.price);
      const quantity = Number(it.quantity);
      return {
        productId: product.id,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        selectedColor: it.selectedColor || null,
        productName: product.name,
        productSku: product.sku,
      };
    });

    const subtotal = orderItemsData.reduce((sum, it) => sum + it.totalPrice, 0);
    const total = subtotal + Number(shippingFee) + Number(taxAmount) - Number(discountAmount);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: buildOrderNumber(),
          userId,
          shippingAddressId: shippingAddressId || null,
          paymentMethod: paymentMethod || 'COD',
          subtotal,
          shippingFee: Number(shippingFee),
          taxAmount: Number(taxAmount),
          discountAmount: Number(discountAmount),
          total,
          customerName,
          customerEmail,
          customerPhone,
          city,
          governorate,
          postalCode,
          addressLine,
          notes,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      });

      for (const item of orderItemsData) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await createAdminOrderNotifications(tx, {
        order: createdOrder,
        title: 'طلب جديد',
        message: `تم إنشاء الطلب ${createdOrder.orderNumber} بإجمالي ${Number(createdOrder.total || 0)} ج.م`,
        type: 'ORDER_CREATED',
      });

      return createdOrder;
    });

    void sendOrderNotification(order).catch((error) => {
      console.error('Failed to send WhatsApp order notification:', error);
    });

    return order;
  },

  listMyOrders(userId) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  getOrderById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  },

  listOrders(query) {
    const { status, search, page = 1, limit = 20 } = query;
    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerEmail: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const skip = (Number(page) - 1) * Number(limit);

    return Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.order.count({ where }),
    ]).then(([items, total]) => ({
      items,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    }));
  },

  updateOrderStatus(id, status) {
    return prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status,
          ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
        },
      });

      const adminUsers = await tx.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { id: true },
      });

      if (adminUsers.length) {
        await tx.notification.createMany({
          data: adminUsers.map((adminUser) => ({
            userId: adminUser.id,
            type: 'ORDER_STATUS_UPDATED',
            title: 'تحديث حالة الطلب',
            message: `تم تحديث حالة الطلب ${updatedOrder.orderNumber} إلى ${status}`,
            data: {
              orderId: updatedOrder.id,
              orderNumber: updatedOrder.orderNumber,
              status: updatedOrder.status,
            },
          })),
        });
      }

      return updatedOrder;
    });
  },
};
