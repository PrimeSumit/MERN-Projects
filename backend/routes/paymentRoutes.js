// import express from 'express';
// import { createOrder, verifyPayment,cancelOrder } from '../controller/paymentController.js';
// import { authenticateToken } from '../middleware/authMiddleware.js';

// const router = express.Router();

// // Create Razorpay order
// router.post('/create-order', authenticateToken, createOrder);

// // Verify Razorpay payment
// router.post('/verify-payment', authenticateToken, verifyPayment);

// router.patch('/cancel/:id', authenticateToken, cancelOrder);

// export default router;

import express from 'express';
import { createRazorpayOrder, verifyPayment } from '../controller/paymentController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-order', authenticateToken, createRazorpayOrder);
router.post('/verify-payment', authenticateToken, verifyPayment);

export default router;
