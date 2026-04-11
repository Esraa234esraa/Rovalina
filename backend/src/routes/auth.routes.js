import { Router } from 'express';
import { adminLogin, changePassword, login, logout, me, register } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.patch('/change-password', authenticate, changePassword);

router.post('/admin/login', adminLogin);

export default router;
