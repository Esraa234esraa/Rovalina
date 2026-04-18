import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
const ensurePositiveQuantity = (quantity) => {
    const parsed = Number(quantity);
    if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new ApiError(400, 'quantity must be a positive number');
    }
    return Math.floor(parsed);
};
const getOrCreateCart = async (userId) => {
    const existing = await prisma.cart.findUnique({
        where: { userId },
    });
    if (existing)
        return existing;
    return prisma.cart.create({
        data: { userId },
    });
};
export const cartService = {
    async getUserCart(userId) {
        const cart = await getOrCreateCart(userId);
        return prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                brand: true,
                                colorVariants: {
                                    include: { media: true },
                                },
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    },
    async addToCart(userId, payload) {
        const { productId, quantity = 1 } = payload;
        if (!productId) {
            throw new ApiError(400, 'productId is required');
        }
        const safeQuantity = ensurePositiveQuantity(quantity);
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, stock: true, status: true },
        });
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        if (product.status !== 'ACTIVE') {
            throw new ApiError(400, 'Product is not active');
        }
        const cart = await getOrCreateCart(userId);
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
            select: { id: true, quantity: true },
        });
        const nextQuantity = (existingItem?.quantity || 0) + safeQuantity;
        if (nextQuantity > product.stock) {
            throw new ApiError(400, 'Insufficient stock for requested quantity');
        }
        await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId,
                },
            },
            update: {
                quantity: nextQuantity,
            },
            create: {
                cartId: cart.id,
                productId,
                quantity: safeQuantity,
            },
        });
        return this.getUserCart(userId);
    },
    async updateQuantity(userId, itemId, quantity) {
        const safeQuantity = ensurePositiveQuantity(quantity);
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: {
                cart: true,
                product: {
                    select: {
                        id: true,
                        stock: true,
                        status: true,
                    },
                },
            },
        });
        if (!item || item.cart.userId !== userId) {
            throw new ApiError(404, 'Cart item not found');
        }
        if (item.product.status !== 'ACTIVE') {
            throw new ApiError(400, 'Product is not active');
        }
        if (safeQuantity > item.product.stock) {
            throw new ApiError(400, 'Insufficient stock for requested quantity');
        }
        await prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity: safeQuantity },
        });
        return this.getUserCart(userId);
    },
    async removeItem(userId, itemId) {
        const item = await prisma.cartItem.findUnique({
            where: { id: itemId },
            include: { cart: true },
        });
        if (!item || item.cart.userId !== userId) {
            throw new ApiError(404, 'Cart item not found');
        }
        await prisma.cartItem.delete({
            where: { id: itemId },
        });
        return this.getUserCart(userId);
    },
};
