import { Router } from 'express';
import {
  createContactMessage,
  listInstagramGallery,
  createProductReview,
  createSiteReview,
  getFAQsByCategory,
  listFAQs,
  listProductReviews,
  listTestimonials,
  subscribeNewsletter,
} from '../controllers/engagement.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.get('/products/:productId/reviews', listProductReviews);
router.post('/products/:productId/reviews', createProductReview);
router.get('/instagram/gallery', listInstagramGallery);

router.get('/testimonials', listTestimonials);
router.post('/site-reviews', createSiteReview);

router.get('/faqs', listFAQs);
router.get('/faqs/:category', getFAQsByCategory);

router.post('/contact/messages', createContactMessage);
router.post('/newsletter/subscribe', subscribeNewsletter);

router.post('/protected/site-reviews', authenticate, createSiteReview);

export default router;
