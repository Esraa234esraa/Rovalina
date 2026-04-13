import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { sendOrderNotification } from './whatsapp.service.js';

const buildOrderNumber = () => `ORD-${Date.now()}`;

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase();

const normalizeShippingRates = (settings) => {
  const rates = settings?.shippingRates;
  if (Array.isArray(rates)) {
    return rates
      .map((rate) => ({
        governorate: String(rate?.governorate || rate?.name || '').trim(),
        city: String(rate?.city || rate?.center || rate?.district || '').trim(),
        fee: Number(rate?.fee ?? rate?.shippingFee ?? rate?.price ?? 0),
      }))
      .filter((rate) => rate.governorate && rate.city);
  }

  if (rates && typeof rates === 'object') {
    return Object.entries(rates)
      .map(([governorate, fee]) => ({
        governorate: String(governorate || '').trim(),
        city: '',
        fee: Number(fee || 0),
      }))
      .filter((rate) => rate.governorate);
  }

  return [];
};

const resolveShippingFee = (settings, subtotal, governorate, city, fallbackShippingFee = 0) => {
  if (!settings?.enableShipping) return 0;

  const freeShippingMinimum = Number(settings?.freeShippingMinimum || 0);
  if (subtotal >= freeShippingMinimum) {
    return 0;
  }

  const normalizedGovernorate = normalizeText(governorate);
  const normalizedCity = normalizeText(city);
  const shippingRates = normalizeShippingRates(settings);
  const matchedRate = shippingRates.find(
    (rate) =>
      normalizeText(rate.governorate) === normalizedGovernorate &&
      normalizeText(rate.city) === normalizedCity
  );

  if (matchedRate) {
    return Number(matchedRate.fee || 0);
  }

  return Number(settings?.shippingFee ?? fallbackShippingFee ?? 0);
};

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

const calculateTotals = async (subtotal, governorate, city, fallbackShippingFee = 0) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 'STORE' } });

  const shippingFeeRaw = resolveShippingFee(settings, subtotal, governorate, city, fallbackShippingFee);

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

    return calculateTotals(subtotal, null, null);
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
      paymentProofImage = null,
    } = payload;

    const normalizedPaymentMethod = String(paymentMethod || 'COD').toUpperCase();
    const requiresPaymentProof = normalizedPaymentMethod === 'INSTAPAY' || normalizedPaymentMethod === 'WALLET';

    if (requiresPaymentProof && !String(paymentProofImage || '').trim()) {
      throw new ApiError(400, 'يجب إرفاق صورة إيصال التحويل قبل تأكيد الطلب.');
    }

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
    const totals = await calculateTotals(subtotal, governorate, city);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: buildOrderNumber(),
          userId,
          shippingAddressId: shippingAddressId || null,
          paymentMethod: normalizedPaymentMethod,
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
          paymentProofImage: requiresPaymentProof ? paymentProofImage : null,
          paymentResponse: requiresPaymentProof && paymentProofImage
            ? {
                paymentProofImage,
                paymentProofSubmittedAt: new Date().toISOString(),
              }
            : undefined,
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
      paymentProofImage = null,
      shippingAddressId,
    } = payload;

    const normalizedPaymentMethod = String(paymentMethod || 'COD').toUpperCase();
    const requiresPaymentProof = normalizedPaymentMethod === 'INSTAPAY' || normalizedPaymentMethod === 'WALLET';

    if (requiresPaymentProof && !String(paymentProofImage || '').trim()) {
      throw new ApiError(400, 'يجب إرفاق صورة إيصال التحويل قبل تأكيد الطلب.');
    }

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
    const totals = await calculateTotals(subtotal, governorate, city, shippingFee);

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          orderNumber: buildOrderNumber(),
          userId,
          shippingAddressId: shippingAddressId || null,
          paymentMethod: normalizedPaymentMethod,
          subtotal: totals.subtotal,
          shippingFee: totals.shippingFee,
          taxAmount: totals.taxAmount,
          discountAmount: Number(discountAmount) || totals.discountAmount,
          total: Number((totals.total - Number(discountAmount || 0)).toFixed(2)),
          customerName,
          customerEmail,
          customerPhone,
          city,
          governorate,
          postalCode,
          addressLine,
          notes,
          paymentProofImage: requiresPaymentProof ? paymentProofImage : null,
          paymentResponse: requiresPaymentProof && paymentProofImage
            ? {
                paymentProofImage,
                paymentProofSubmittedAt: new Date().toISOString(),
              }
            : undefined,
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
