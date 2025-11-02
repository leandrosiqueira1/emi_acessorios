// backend/routers/picpay.js

import express from 'express';
import { handlePicPayCallback } from '../controllers/picpayController.ts';

const router = express.Router();

// Rota POST para receber notificações do PicPay.
// O PicPay enviará dados JSON para /api/picpay/callback
router.post('/callback', handlePicPayCallback);

export default router;