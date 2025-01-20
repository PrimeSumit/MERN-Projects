import express from 'express';
import { createOrder, getOrders, cancelOrder } from '../controller/orderController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/createOrder', authenticateToken, authorizeRoles('buyer'), createOrder);
router.get('/getOrder', authenticateToken, getOrders);
router.patch('/cancelOrder/:id', authenticateToken, authorizeRoles('buyer'), cancelOrder);

export default router;
