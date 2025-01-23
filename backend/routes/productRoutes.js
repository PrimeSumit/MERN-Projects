import express from 'express';
import {createProduct, approveProduct, deleteProduct, updateProduct,getProducts,getProductById} from '../controller/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a product (Seller)
router.post('/addProduct', authenticateToken, authorizeRoles('seller'), createProduct);

// Approve a product (Admin)
router.patch('/approveProduct/:id', authenticateToken, authorizeRoles('admin'), approveProduct);

// Delete a product (Admin or Seller)
router.delete('/deleteProduct/:id', authenticateToken, authorizeRoles('admin', 'seller'), deleteProduct);

// Update a product (Seller)
router.put('/updateProduct/:id', authenticateToken, authorizeRoles('seller'), updateProduct);

router.get('/getProduct', getProducts);
router.get('/getProduct/:id', getProductById);

export default router;
