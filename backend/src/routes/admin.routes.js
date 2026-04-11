import { Router } from 'express';
import {
  createBrand,
  createCategory,
  createDuration,
  createFAQ,
  createOffer,
  createProduct,
  createTestimonial,
  createInstagramGalleryItem,
  deleteNotification,
  deleteProductReview,
  deleteInstagramGalleryItem,
  deleteBrand,
  deleteCategory,
  deleteDuration,
  deleteFAQ,
  deleteOffer,
  deleteProduct,
  deleteTestimonial,
  getDurationById,
  getDashboardOverview,
  getDashboardStats,
  getSettings,
  listProductReviews,
  listDurations,
  listFAQs,
  listInstagramGalleryItems,
  listOffers,
  listTestimonials,
  listNotifications,
  markNotificationRead,
  updateBrand,
  updateCategory,
  updateDuration,
  updateFAQ,
  updateInstagramGalleryItem,
  updateOffer,
  updateProduct,
  updateProductReview,
  updateTestimonial,
  upsertSettings,
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/overview', getDashboardOverview);

router.get('/settings', getSettings);
router.put('/settings', upsertSettings);

router.get('/notifications', listNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.delete('/notifications/:id', deleteNotification);

router.post('/categories', createCategory);
router.patch('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

router.post('/brands', createBrand);
router.patch('/brands/:id', updateBrand);
router.delete('/brands/:id', deleteBrand);

router.get('/durations', listDurations);
router.get('/durations/:id', getDurationById);
router.post('/durations', createDuration);
router.patch('/durations/:id', updateDuration);
router.delete('/durations/:id', deleteDuration);

router.post('/products', createProduct);
router.patch('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/products/:productId/reviews', listProductReviews);
router.patch('/product-reviews/:id', updateProductReview);
router.delete('/product-reviews/:id', deleteProductReview);

router.get('/offers', listOffers);
router.post('/offers', createOffer);
router.patch('/offers/:id', updateOffer);
router.put('/offers/:id', updateOffer);
router.delete('/offers/:id', deleteOffer);

router.get('/testimonials', listTestimonials);
router.post('/testimonials', createTestimonial);
router.patch('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

router.get('/faqs', listFAQs);
router.post('/faqs', createFAQ);
router.patch('/faqs/:id', updateFAQ);
router.delete('/faqs/:id', deleteFAQ);

router.get('/instagram-gallery', listInstagramGalleryItems);
router.post('/instagram-gallery', createInstagramGalleryItem);
router.patch('/instagram-gallery/:id', updateInstagramGalleryItem);
router.delete('/instagram-gallery/:id', deleteInstagramGalleryItem);

export default router;
