import { prisma } from '../config/prisma.js';
const buildColorVariantsCreateInput = (colors) => {
    if (!Array.isArray(colors))
        return [];
    return colors
        .map((color, colorIndex) => {
        const name = String(color?.name || '').trim();
        const images = Array.isArray(color?.images)
            ? color.images.map((url) => String(url || '').trim()).filter(Boolean)
            : [];
        if (!name)
            return null;
        return {
            name,
            sortOrder: colorIndex,
            media: {
                create: images.map((url, imageIndex) => ({
                    url,
                    isPrimary: imageIndex === 0,
                    sortOrder: imageIndex,
                })),
            },
        };
    })
        .filter(Boolean);
};
const toPositiveInt = (value, fallback = 5, max = 20) => {
    const parsed = Number.parseInt(String(value ?? ''), 10);
    if (Number.isNaN(parsed) || parsed <= 0)
        return fallback;
    return Math.min(parsed, max);
};
const decimalToNumber = (value) => Number(value || 0);
const slugifyText = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]+/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
const ensureBrandSlug = ({ slug, name }) => {
    const normalized = slugifyText(slug || name);
    return normalized || `brand-${Date.now()}`;
};
const ensureCategorySlug = ({ slug, name }) => {
    const normalized = slugifyText(slug || name);
    return normalized || `category-${Date.now()}`;
};
const ensureProductSku = ({ sku, slug, name, nameEn }) => {
    const normalized = slugifyText(sku || slug || nameEn || name).replace(/^-+|-+$/g, '');
    const prefix = normalized || 'product';
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
};
const normalizeInstagramImageUrl = (value) => {
    const raw = String(value || '').trim();
    if (!raw)
        return '';
    try {
        const parsed = new URL(raw);
        const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
        const pathParts = parsed.pathname.split('/').filter(Boolean);
        if (host === 'instagram.com' && (pathParts[0] === 'p' || pathParts[0] === 'reel') && pathParts[1]) {
            return `https://www.instagram.com/${pathParts[0]}/${pathParts[1]}/media/?size=l`;
        }
    }
    catch {
        // fall through and return the original value
    }
    return raw;
};
const SETTINGS_BOOLEAN_KEYS = [
    'enableShipping',
    'enableCOD',
    'enableInstapay',
    'enableWallet',
    'enablePaymob',
    'enableTax',
    'enableEmailNotifications',
    'notifyOnNewOrder',
    'notifyOnNewReview',
];
const SETTINGS_NUMBER_KEYS = ['shippingFee', 'freeShippingMinimum', 'taxRate'];
const SETTINGS_INTEGER_KEYS = ['deliveryDays'];
const SETTINGS_JSON_KEYS = ['shippingRates'];
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
const SETTINGS_STRING_KEYS = [
    'storeName',
    'storeEmail',
    'storePhone',
    'storeAddress',
    'city',
    'governorate',
    'postalCode',
    'metaTitle',
    'metaDescription',
    'facebook',
    'instagram',
    'tiktok',
    'whatsapp',
    'supportEmail',
    'supportPhone',
    'aboutUs',
    'walletNumber',
    'instapayNumber',
];
const normalizeSettingsPayload = (data) => {
    const input = data && typeof data === 'object' ? data : {};
    const normalized = {};
    for (const key of SETTINGS_STRING_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key))
            continue;
        const value = String(input[key] ?? '').trim();
        normalized[key] = value || null;
    }
    for (const key of SETTINGS_BOOLEAN_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key))
            continue;
        normalized[key] = Boolean(input[key]);
    }
    for (const key of SETTINGS_NUMBER_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key))
            continue;
        const parsed = Number(input[key]);
        normalized[key] = Number.isFinite(parsed) ? parsed : 0;
    }
    for (const key of SETTINGS_INTEGER_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key))
            continue;
        const parsed = Number.parseInt(String(input[key]), 10);
        normalized[key] = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    }
    for (const key of SETTINGS_JSON_KEYS) {
        if (!Object.prototype.hasOwnProperty.call(input, key))
            continue;
        const value = input[key];
        if (Array.isArray(value)) {
            normalized[key] = key === 'shippingRates' ? normalizeShippingRates(value) : value;
            continue;
        }
        if (typeof value === 'string' && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                normalized[key] = key === 'shippingRates' ? normalizeShippingRates(parsed) : parsed;
            }
            catch {
                normalized[key] = [];
            }
            continue;
        }
        normalized[key] = value ?? null;
    }
    return normalized;
};
export const adminService = {
    dashboardStats() {
        return Promise.all([
            prisma.order.count(),
            prisma.order.count({ where: { status: 'CANCELLED' } }),
            prisma.user.count({ where: { role: 'CUSTOMER' } }),
            prisma.product.count(),
            prisma.offer.count({ where: { isActive: true } }),
            prisma.order.aggregate({
                where: {
                    status: {
                        not: 'CANCELLED',
                    },
                },
                _sum: { total: true },
            }),
        ]).then(([orders, cancelledOrders, customers, products, activeOffers, revenue]) => ({
            orders,
            cancelledOrders,
            customers,
            products,
            activeOffers,
            revenue: Number(revenue._sum.total || 0),
        }));
    },
    async dashboardOverview({ topProductsLimit = 5, recentOrdersLimit = 5 } = {}) {
        const productsLimit = toPositiveInt(topProductsLimit, 5, 20);
        const ordersLimit = toPositiveInt(recentOrdersLimit, 5, 20);
        const [stats, topSales, recentOrders] = await Promise.all([
            this.dashboardStats(),
            prisma.orderItem.groupBy({
                by: ['productId'],
                where: {
                    order: {
                        status: {
                            not: 'CANCELLED',
                        },
                    },
                },
                _sum: {
                    quantity: true,
                    totalPrice: true,
                },
                orderBy: {
                    _sum: {
                        quantity: 'desc',
                    },
                },
                take: productsLimit,
            }),
            prisma.order.findMany({
                orderBy: {
                    createdAt: 'desc',
                },
                take: ordersLimit,
                select: {
                    id: true,
                    orderNumber: true,
                    status: true,
                    paymentMethod: true,
                    total: true,
                    currency: true,
                    placedAt: true,
                    createdAt: true,
                    customerName: true,
                    customerEmail: true,
                    customerPhone: true,
                    city: true,
                    governorate: true,
                    items: {
                        select: {
                            id: true,
                        },
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                        },
                    },
                },
            }),
        ]);
        const productIds = topSales.map((item) => item.productId);
        const products = productIds.length
            ? await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: {
                    id: true,
                    name: true,
                    nameEn: true,
                    image: true,
                    slug: true,
                },
            })
            : [];
        const productMap = new Map(products.map((product) => [product.id, product]));
        return {
            stats,
            topSellingProducts: topSales.map((item) => {
                const product = productMap.get(item.productId);
                return {
                    productId: item.productId,
                    productName: product?.name || 'منتج غير معروف',
                    productNameEn: product?.nameEn || null,
                    productImage: product?.image || null,
                    productSlug: product?.slug || null,
                    totalSales: item._sum.quantity || 0,
                    revenue: decimalToNumber(item._sum.totalPrice),
                };
            }),
            recentOrders: recentOrders.map((order) => ({
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentMethod: order.paymentMethod,
                total: decimalToNumber(order.total),
                currency: order.currency,
                placedAt: order.placedAt,
                createdAt: order.createdAt,
                customer: {
                    id: order.user?.id || null,
                    name: order.user?.name || order.customerName,
                    email: order.user?.email || order.customerEmail,
                    phone: order.user?.phone || order.customerPhone,
                    city: order.city,
                    governorate: order.governorate,
                },
                itemsCount: order.items.length,
            })),
            limits: {
                topProductsLimit: productsLimit,
                recentOrdersLimit: ordersLimit,
            },
        };
    },
    listNotifications(userId) {
        return prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    },
    markNotificationRead(id, userId) {
        return prisma.notification.updateMany({
            where: {
                id,
                userId,
            },
            data: {
                isRead: true,
                readAt: new Date(),
            },
        });
    },
    deleteNotification(id, userId) {
        return prisma.notification.deleteMany({
            where: {
                id,
                userId,
            },
        });
    },
    getSettings() {
        return prisma.storeSettings.findUnique({ where: { id: 'STORE' } }).then((settings) => {
            if (!settings)
                return settings;
            return {
                ...settings,
                shippingRates: normalizeShippingRates(settings.shippingRates),
            };
        });
    },
    async upsertSettings(data) {
        const normalized = normalizeSettingsPayload(data);
        const payload = {
            ...normalized,
            storeName: normalized.storeName || 'Rovalina Lenses',
            storeEmail: normalized.storeEmail || 'info@example.com',
        };
        try {
            return await prisma.storeSettings.upsert({
                where: { id: 'STORE' },
                update: payload,
                create: {
                    id: 'STORE',
                    ...payload,
                },
            });
        }
        catch (error) {
            // Backward compatibility: if Prisma client/database is not yet migrated for aboutUs, retry without it.
            if (String(error?.message || '').includes('Unknown argument `aboutUs`')) {
                const { aboutUs, ...fallbackPayload } = payload;
                return prisma.storeSettings.upsert({
                    where: { id: 'STORE' },
                    update: fallbackPayload,
                    create: {
                        id: 'STORE',
                        ...fallbackPayload,
                    },
                });
            }
            throw error;
        }
    },
    createCategory(data) {
        return prisma.category.create({
            data: {
                ...data,
                slug: ensureCategorySlug({ name: data?.name }),
            },
        });
    },
    updateCategory(id, data) {
        const payload = { ...data };
        delete payload.slug;
        return prisma.category.update({ where: { id }, data: payload });
    },
    deleteCategory(id) {
        return prisma.category.delete({ where: { id } });
    },
    createBrand(data) {
        return prisma.brand.create({
            data: {
                ...data,
                slug: ensureBrandSlug({ name: data?.name }),
            },
        });
    },
    updateBrand(id, data) {
        const payload = { ...data };
        delete payload.slug;
        return prisma.brand.update({ where: { id }, data: payload });
    },
    deleteBrand(id) {
        return prisma.brand.delete({ where: { id } });
    },
    createProduct(data) {
        const { colors, ...productData } = data;
        const colorVariants = buildColorVariantsCreateInput(colors);
        return prisma.product.create({
            data: {
                ...productData,
                sku: ensureProductSku(productData),
                ...(colorVariants.length
                    ? {
                        colorVariants: {
                            create: colorVariants,
                        },
                    }
                    : {}),
            },
            include: {
                category: true,
                brand: true,
                colorVariants: {
                    include: { media: true },
                },
            },
        });
    },
    updateProduct(id, data) {
        const { colors, ...productData } = data;
        const colorVariants = buildColorVariantsCreateInput(colors);
        return prisma.product.update({
            where: { id },
            data: {
                ...productData,
                ...(Array.isArray(colors)
                    ? {
                        colorVariants: {
                            deleteMany: {},
                            ...(colorVariants.length
                                ? {
                                    create: colorVariants,
                                }
                                : {}),
                        },
                    }
                    : {}),
            },
            include: {
                category: true,
                brand: true,
                colorVariants: {
                    include: { media: true },
                },
            },
        });
    },
    deleteProduct(id) {
        return prisma.product.delete({ where: { id } });
    },
    listProductReviews(productId) {
        return prisma.productReview.findMany({
            where: { productId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    updateProductReview(id, data) {
        const payload = {
            ...(Object.prototype.hasOwnProperty.call(data || {}, 'isApproved')
                ? { isApproved: Boolean(data.isApproved) }
                : {}),
        };
        return prisma.productReview.update({
            where: { id },
            data: payload,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    },
    deleteProductReview(id) {
        return prisma.productReview.delete({ where: { id } });
    },
    listOffers() {
        return prisma.offer.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
        });
    },
    createOffer(data) {
        const { applicableProductIds, ...offerData } = data;
        const uniqueProductIds = Array.isArray(applicableProductIds)
            ? [...new Set(applicableProductIds.map((id) => String(id || '').trim()).filter(Boolean))]
            : [];
        const normalizedOfferData = {
            ...offerData,
            ...(Object.prototype.hasOwnProperty.call(offerData, 'featured')
                ? { isFeatured: Boolean(offerData.featured) }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(offerData, 'image')
                ? { imageUrl: offerData.image || null }
                : {}),
        };
        delete normalizedOfferData.featured;
        delete normalizedOfferData.image;
        return prisma.offer.create({
            data: {
                ...normalizedOfferData,
                ...(uniqueProductIds.length
                    ? {
                        applicableProducts: {
                            create: uniqueProductIds.map((productId) => ({ productId })),
                        },
                    }
                    : {}),
            },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
        });
    },
    updateOffer(id, data) {
        const { applicableProductIds, ...offerData } = data;
        const uniqueProductIds = Array.isArray(applicableProductIds)
            ? [...new Set(applicableProductIds.map((value) => String(value || '').trim()).filter(Boolean))]
            : null;
        const normalizedOfferData = {
            ...offerData,
            ...(Object.prototype.hasOwnProperty.call(offerData, 'featured')
                ? { isFeatured: Boolean(offerData.featured) }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(offerData, 'image')
                ? { imageUrl: offerData.image || null }
                : {}),
        };
        delete normalizedOfferData.featured;
        delete normalizedOfferData.image;
        return prisma.offer.update({
            where: { id },
            data: {
                ...normalizedOfferData,
                ...(Array.isArray(uniqueProductIds)
                    ? {
                        applicableProducts: {
                            deleteMany: {},
                            ...(uniqueProductIds.length
                                ? {
                                    create: uniqueProductIds.map((productId) => ({ productId })),
                                }
                                : {}),
                        },
                    }
                    : {}),
            },
            include: {
                applicableProducts: {
                    include: { product: true },
                },
            },
        });
    },
    deleteOffer(id) {
        return prisma.offer.delete({ where: { id } });
    },
    createTestimonial(data) {
        const { nameEn, text, approved, featured, ...payload } = data || {};
        return prisma.siteReview.create({
            data: {
                ...payload,
                quote: String(payload.quote || text || '').trim(),
                rating: Math.min(Number(payload.rating || 0), 5),
                isApproved: typeof payload.isApproved === 'boolean' ? payload.isApproved : typeof approved === 'boolean' ? approved : true,
                isFeatured: typeof payload.isFeatured === 'boolean' ? payload.isFeatured : typeof featured === 'boolean' ? featured : false,
                imageUrl: payload.imageUrl || null,
                name: payload.name || null,
                email: payload.email || null,
            },
        });
    },
    updateTestimonial(id, data) {
        const { nameEn, text, approved, featured, ...payload } = data || {};
        const updateData = {
            ...payload,
            ...(Object.prototype.hasOwnProperty.call(payload, 'quote') || text !== undefined
                ? { quote: String(payload.quote || text || '').trim() }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'rating') ? { rating: Math.min(Number(payload.rating || 0), 5) } : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'isApproved')
                ? { isApproved: Boolean(payload.isApproved) }
                : typeof approved === 'boolean'
                    ? { isApproved: approved }
                    : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'isFeatured')
                ? { isFeatured: Boolean(payload.isFeatured) }
                : typeof featured === 'boolean'
                    ? { isFeatured: featured }
                    : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'imageUrl')
                ? { imageUrl: payload.imageUrl || null }
                : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'name') ? { name: payload.name || null } : {}),
            ...(Object.prototype.hasOwnProperty.call(payload, 'email') ? { email: payload.email || null } : {}),
        };
        return prisma.siteReview.update({ where: { id }, data: updateData });
    },
    deleteTestimonial(id) {
        return prisma.siteReview.delete({ where: { id } });
    },
    listTestimonials() {
        return prisma.siteReview.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
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
                    include: {
                        category: true,
                        brand: true,
                    },
                },
            },
        });
    },
    createDuration(data) {
        return prisma.duration.create({
            data: {
                ...data,
                slug: ensureCategorySlug({ slug: data?.slug, name: data?.name }),
            },
        });
    },
    updateDuration(id, data) {
        const payload = { ...data };
        if (Object.prototype.hasOwnProperty.call(payload, 'slug') && !String(payload.slug || '').trim()) {
            payload.slug = ensureCategorySlug({ slug: payload.slug, name: payload.name });
        }
        if (!Object.prototype.hasOwnProperty.call(payload, 'slug') && payload.name) {
            payload.slug = ensureCategorySlug({ name: payload.name });
        }
        return prisma.duration.update({ where: { id }, data: payload });
    },
    deleteDuration(id) {
        return prisma.duration.delete({ where: { id } });
    },
    listFAQs() {
        return prisma.fAQ.findMany({
            orderBy: [{ category: 'asc' }, { order: 'asc' }],
        });
    },
    listInstagramGalleryItems() {
        return prisma.instagramGalleryItem.findMany({
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    },
    createInstagramGalleryItem(data) {
        const username = String(data?.username || '').trim();
        const image = normalizeInstagramImageUrl(data?.image);
        if (!image) {
            throw new Error('رابط الصورة مطلوب.');
        }
        return prisma.instagramGalleryItem.create({
            data: {
                username: username || '@rovalina_lenses',
                image,
                sortOrder: Number.isFinite(Number(data?.sortOrder)) ? Number(data.sortOrder) : 0,
                isActive: data?.isActive !== false,
            },
        });
    },
    updateInstagramGalleryItem(id, data) {
        const payload = {};
        if (Object.prototype.hasOwnProperty.call(data, 'username')) {
            payload.username = String(data.username || '').trim() || '@rovalina_lenses';
        }
        if (Object.prototype.hasOwnProperty.call(data, 'image')) {
            payload.image = normalizeInstagramImageUrl(data.image);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'sortOrder')) {
            payload.sortOrder = Number.isFinite(Number(data.sortOrder)) ? Number(data.sortOrder) : 0;
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isActive')) {
            payload.isActive = Boolean(data.isActive);
        }
        return prisma.instagramGalleryItem.update({
            where: { id },
            data: payload,
        });
    },
    deleteInstagramGalleryItem(id) {
        return prisma.instagramGalleryItem.delete({ where: { id } });
    },
    createFAQ(data) {
        const { question, answer, category } = data || {};
        if (!question || !answer || !category) {
            throw new Error('السؤال والإجابة والفئة مطلوبة.');
        }
        return prisma.fAQ.create({
            data: {
                question: String(question).trim(),
                answer: String(answer).trim(),
                category: String(category).trim(),
                order: Number(data.order) || 0,
                isActive: data.isActive !== false,
            },
        });
    },
    updateFAQ(id, data) {
        const updateData = {};
        if (Object.prototype.hasOwnProperty.call(data, 'question')) {
            updateData.question = String(data.question).trim();
        }
        if (Object.prototype.hasOwnProperty.call(data, 'answer')) {
            updateData.answer = String(data.answer).trim();
        }
        if (Object.prototype.hasOwnProperty.call(data, 'category')) {
            updateData.category = String(data.category).trim();
        }
        if (Object.prototype.hasOwnProperty.call(data, 'order')) {
            updateData.order = Number(data.order);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'isActive')) {
            updateData.isActive = Boolean(data.isActive);
        }
        return prisma.fAQ.update({ where: { id }, data: updateData });
    },
    deleteFAQ(id) {
        return prisma.fAQ.delete({ where: { id } });
    },
};
