import { prisma } from '../config/prisma.js';
const DEFAULT_PUBLIC_SETTINGS = {
    id: 'STORE',
    storeName: 'Rovalina Lenses',
    storeEmail: 'info@example.com',
    storePhone: '',
    storeAddress: '',
    city: '',
    governorate: '',
    postalCode: '',
    shippingFee: 0,
    freeShippingMinimum: 0,
    enableFreeShipping: false,
    deliveryDays: 3,
    shippingRates: [],
    enableShipping: true,
    enableCOD: true,
    enableInstapay: false,
    enableWallet: false,
    enablePaymob: false,
    enableTax: false,
    taxRate: 0,
    walletNumber: '',
    instapayNumber: '',
    metaTitle: '',
    metaDescription: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    supportEmail: '',
    supportPhone: '',
    aboutUs: '',
    enableEmailNotifications: true,
    notifyOnNewOrder: true,
    notifyOnNewReview: true,
};
const normalizeShippingRates = (value) => {
    const source = Array.isArray(value) ? value : [];
    const map = new Map();
    source.forEach((rate) => {
        const governorate = String(rate?.governorate || rate?.name || '').trim();
        if (!governorate)
            return;
        map.set(governorate, {
            governorate,
            fee: Number(rate?.fee ?? rate?.shippingFee ?? rate?.price ?? 0),
        });
    });
    return Array.from(map.values());
};
const normalizePublicSettings = (raw) => {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
        ...DEFAULT_PUBLIC_SETTINGS,
        ...source,
        shippingFee: Number(source.shippingFee ?? DEFAULT_PUBLIC_SETTINGS.shippingFee),
        freeShippingMinimum: Number(source.freeShippingMinimum ?? DEFAULT_PUBLIC_SETTINGS.freeShippingMinimum),
        deliveryDays: Number(source.deliveryDays ?? DEFAULT_PUBLIC_SETTINGS.deliveryDays),
        taxRate: Number(source.taxRate ?? DEFAULT_PUBLIC_SETTINGS.taxRate),
        enableShipping: Boolean(source.enableShipping ?? DEFAULT_PUBLIC_SETTINGS.enableShipping),
        enableFreeShipping: Boolean(source.enableFreeShipping ?? DEFAULT_PUBLIC_SETTINGS.enableFreeShipping),
        enableCOD: Boolean(source.enableCOD ?? DEFAULT_PUBLIC_SETTINGS.enableCOD),
        enableInstapay: Boolean(source.enableInstapay ?? DEFAULT_PUBLIC_SETTINGS.enableInstapay),
        enableWallet: Boolean(source.enableWallet ?? DEFAULT_PUBLIC_SETTINGS.enableWallet),
        enablePaymob: Boolean(source.enablePaymob ?? DEFAULT_PUBLIC_SETTINGS.enablePaymob),
        enableTax: Boolean(source.enableTax ?? DEFAULT_PUBLIC_SETTINGS.enableTax),
        walletNumber: String(source.walletNumber || '').trim(),
        instapayNumber: String(source.instapayNumber || '').trim(),
        shippingRates: normalizeShippingRates(source.shippingRates),
    };
};
export const catalogService = {
    async listProducts(query) {
        const { search, category, categoryId, color, brandId, status, featured, minPrice, maxPrice, page = 1, limit = 20, } = query;
        const colorList = String(color || '')
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
        const categoryFilter = categoryId
            ? { categoryId }
            : category
                ? {
                    category: {
                        OR: [
                            { slug: { equals: String(category), mode: 'insensitive' } },
                            { name: { equals: String(category), mode: 'insensitive' } },
                            { nameEn: { equals: String(category), mode: 'insensitive' } },
                        ],
                    },
                }
                : {};
        const colorFilter = colorList.length
            ? {
                colorVariants: {
                    some: {
                        OR: colorList.map((c) => ({
                            name: { equals: c, mode: 'insensitive' },
                        })),
                    },
                },
            }
            : {};
        const where = {
            ...(status ? { status } : {}),
            ...categoryFilter,
            ...colorFilter,
            ...(brandId ? { brandId } : {}),
            ...(typeof featured !== 'undefined' ? { featured: featured === 'true' } : {}),
            ...(search
                ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { nameEn: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(minPrice || maxPrice
                ? {
                    price: {
                        ...(minPrice ? { gte: Number(minPrice) } : {}),
                        ...(maxPrice ? { lte: Number(maxPrice) } : {}),
                    },
                }
                : {}),
        };
        const skip = (Number(page) - 1) * Number(limit);
        const [items, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    category: true,
                    brand: true,
                    duration: true,
                    colorVariants: {
                        include: { media: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: Number(limit),
            }),
            prisma.product.count({ where }),
        ]);
        return {
            items,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        };
    },
    getProductById(id) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                duration: true,
                colorVariants: {
                    include: { media: true },
                },
                reviews: {
                    where: { isApproved: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
    },
    listCategories() {
        return prisma.category.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    listBrands() {
        return prisma.brand.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    listDurations() {
        return prisma.duration.findMany({
            orderBy: { createdAt: 'desc' },
        });
    },
    getDurationById(id) {
        return prisma.duration.findUnique({
            where: { id },
            include: {
                products: {
                    where: { status: 'ACTIVE' },
                    include: {
                        category: true,
                        brand: true,
                        colorVariants: {
                            include: { media: true },
                        },
                    },
                },
            },
        });
    },
    listOffers() {
        return prisma.offer.findMany({
            where: { isActive: true },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    listFeaturedOffers() {
        return prisma.offer.findMany({
            where: { isActive: true, isFeatured: true },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    getStoreSettings() {
        return prisma.storeSettings.findUnique({ where: { id: 'STORE' } }).then((settings) => normalizePublicSettings(settings));
    },
    getOfferById(id) {
        return prisma.offer.findUnique({
            where: { id },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
        });
    },
};
