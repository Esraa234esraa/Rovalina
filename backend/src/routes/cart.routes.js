import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addToCart,
  getUserCart,
  removeCartItem,
  updateCartItemQuantity,
} from '../controllers/cart.controller.js';

const router = Router();

router.use(authenticate);

router.get('/cart', getUserCart);
router.post('/cart/items', addToCart);
router.patch('/cart/items/:itemId', updateCartItemQuantity);
router.delete('/cart/items/:itemId', removeCartItem);

export default router;
