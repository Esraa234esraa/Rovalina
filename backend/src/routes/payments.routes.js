import { Router } from 'express';
import { createPayment, handleWebhook } from '../controllers/payments.controller.js';

const router = Router();

router.post('/payments/create', createPayment);
router.post('/payments/webhook', handleWebhook);

export default router;
