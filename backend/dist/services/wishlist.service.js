import { prisma } from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
const getOrCreateWishlist = async (userId) => {
    const existing = await prisma.wishlist.findUnique({
        where: { userId },
    });
    if (existing)
        return existing;
    return prisma.wishlist.create({
        data: { userId },
    });
};
export const wishlistService = {
    async getUserWishlist(userId) {
        const wishlist = await getOrCreateWishlist(userId);
        return prisma.wishlist.findUnique({
            where: { id: wishlist.id },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                                brand: true,
                                duration: true,
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
    async addItem(userId, productId) {
        if (!productId) {
            throw new ApiError(400, 'productId is required');
        }
        const product = await prisma.product.findUnique({
            where: { id: productId },
            select: { id: true, status: true },
        });
        if (!product) {
            throw new ApiError(404, 'Product not found');
        }
        if (product.status !== 'ACTIVE') {
            throw new ApiError(400, 'Product is not active');
        }
        const wishlist = await getOrCreateWishlist(userId);
        await prisma.wishlistItem.upsert({
            where: {
                wishlistId_productId: {
                    wishlistId: wishlist.id,
                    productId,
                },
            },
            update: {},
            create: {
                wishlistId: wishlist.id,
                productId,
            },
        });
        return this.getUserWishlist(userId);
    },
    async removeItem(userId, itemId) {
        const item = await prisma.wishlistItem.findUnique({
            where: { id: itemId },
            include: { wishlist: true },
        });
        if (!item || item.wishlist.userId !== userId) {
            throw new ApiError(404, 'Wishlist item not found');
        }
        await prisma.wishlistItem.delete({
            where: { id: itemId },
        });
        return this.getUserWishlist(userId);
    },
    async removeByProductId(userId, productId) {
        const wishlist = await getOrCreateWishlist(userId);
        await prisma.wishlistItem.deleteMany({
            where: {
                wishlistId: wishlist.id,
                productId,
            },
        });
        return this.getUserWishlist(userId);
    },
};
