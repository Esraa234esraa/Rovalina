import { Router } from 'express';
import {
  getOfferById,
  getDurationById,
  getStoreSettings,
  getProductById,
  listBrands,
  listCategories,
  listDurations,
  listFeaturedOffers,
  listOffers,
  listProducts,
} from '../controllers/catalog.controller.js';

const router = Router();

router.get('/products', listProducts);
router.get('/products/:id', getProductById);
router.get('/categories', listCategories);
router.get('/brands', listBrands);
router.get('/durations', listDurations);
router.get('/durations/:id', getDurationById);
router.get('/offers', listOffers);
router.get('/offers/featured', listFeaturedOffers);
router.get('/settings', getStoreSettings);
router.get('/offers/:id', getOfferById);

export default router;
