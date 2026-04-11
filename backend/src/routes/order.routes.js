import { Router } from 'express';
import {
  calculateOrderTotalFromCart,
  createOrder,
  createOrderFromCart,
  getOrderById,
  listMyOrders,
  listOrders,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/orders', createOrder);
router.get('/orders/calculate-total', authenticate, calculateOrderTotalFromCart);
router.post('/orders/from-cart', authenticate, createOrderFromCart);
router.get('/orders/my', authenticate, listMyOrders);
router.get('/orders/:id', authenticate, getOrderById);

router.get('/admin/orders', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), listOrders);
router.patch('/admin/orders/:id/status', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), updateOrderStatus);

export default router;
