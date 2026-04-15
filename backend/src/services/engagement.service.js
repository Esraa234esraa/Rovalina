import { prisma } from '../config/prisma.js';
import { emailService } from './email.service.js';

const DEFAULT_REVIEW_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&auto=format&fit=crop';

const DEFAULT_INSTAGRAM_GALLERY = [
  {
    id: 'insta-1',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1583001931096-959e9a1a6223?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'insta-2',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1517940310602-26535839fe84?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'insta-3',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1516096995739-52a3a3d23b48?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'insta-4',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'insta-5',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'insta-6',
    username: '@rovalina_lenses',
    image:
      'https://images.unsplash.com/photo-1574634534894-89d7576c8259?q=80&w=1200&auto=format&fit=crop',
  },
];

const normalizeInstagramImageUrl = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const pathParts = parsed.pathname.split('/').filter(Boolean);

    if (host === 'instagram.com' && (pathParts[0] === 'p' || pathParts[0] === 'reel') && pathParts[1]) {
      return `https://www.instagram.com/${pathParts[0]}/${pathParts[1]}/media/?size=l`;
    }
  } catch {
    // keep original value
  }

  return raw;
};

export const engagementService = {
  async listInstagramGallery() {
    const items = await prisma.instagramGalleryItem.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        username: true,
        image: true,
      },
    });

    if (items.length > 0) {
      return items.map((item) => ({
        ...item,
        image: normalizeInstagramImageUrl(item.image),
      }));
    }

    return DEFAULT_INSTAGRAM_GALLERY;
  },

  listProductReviews(productId) {
    return prisma.productReview.findMany({
      where: { productId, isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  createProductReview({ productId, userId, name, rating, comment }) {
    return prisma.productReview.create({
      data: {
        productId,
        userId,
        name,
        rating: Number(rating),
        comment,
      },
    });
  },

  createSiteReview({ userId, name, email, quote, rating }) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.siteReview.create({
        data: {
          userId,
          name,
          email,
          quote,
          rating: Number(rating),
          imageUrl: DEFAULT_REVIEW_AVATAR,
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
            type: 'SITE_REVIEW_CREATED',
            title: 'تقييم جديد للموقع',
            message: `تم إرسال تقييم جديد من ${name || 'عميل'} بدرجة ${Number(rating)}/5`,
            data: {
              reviewId: review.id,
              rating: Number(review.rating || 0),
              isApproved: review.isApproved,
            },
          })),
        });
      }

      return review;
    });
  },

  listTestimonials() {
    return prisma.siteReview.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createContactMessage(payload, userId = null) {
    const createdMessage = await prisma.contactMessage.create({
      data: {
        userId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
      },
    });

    void emailService
      .sendContactMessageNotification({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        message: payload.message,
      })
      .catch((error) => {
        console.error('Failed to send contact message notification:', error);
      });

    return createdMessage;
  },

  async subscribeNewsletter({ email, userId = null }) {
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { email },
      update: {
        isActive: true,
        unsubscribedAt: null,
        userId,
      },
      create: {
        email,
        userId,
      },
    });

    void emailService
      .sendNewsletterNotification({ email })
      .catch((error) => {
        console.error('Failed to send newsletter notification:', error);
      });

    return subscription;
  },

  listFAQs() {
    return prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { order: 'asc' }],
    });
  },

  getFAQsByCategory(category) {
    return prisma.fAQ.findMany({
      where: {
        category,
        isActive: true,
      },
      orderBy: { order: 'asc' },
    });
  },
};
