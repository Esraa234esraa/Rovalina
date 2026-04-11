import { prisma } from '../config/prisma.js';

export const catalogService = {
  async listProducts(query) {
    const {
      search,
      category,
      categoryId,
      color,
      brandId,
      status,
      featured,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = query;

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
              { sku: { contains: search, mode: 'insensitive' } },
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
    return prisma.storeSettings.findUnique({ where: { id: 'STORE' } });
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
