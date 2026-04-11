import { Router } from 'express';
import authRoutes from './auth.routes.js';
import catalogRoutes from './catalog.routes.js';
import orderRoutes from './order.routes.js';
import engagementRoutes from './engagement.routes.js';
import adminRoutes from './admin.routes.js';
import cartRoutes from './cart.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import paymentsRoutes from './payments.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use(catalogRoutes);
router.use(orderRoutes);
router.use(engagementRoutes);
router.use(cartRoutes);
router.use(wishlistRoutes);
router.use(paymentsRoutes);
router.use('/admin', adminRoutes);

export default router;
