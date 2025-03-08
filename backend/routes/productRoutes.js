import express from 'express';
import {createProduct, approveProduct, deleteProduct, updateProduct, getProducts, getProductById} from '../controller/productController.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';
import Product from '../models/product.model.js';

const router = express.Router();

// Create a product (Seller)
router.post('/addProduct', authenticateToken, authorizeRoles('seller'), createProduct);

// Approve a product (Admin)
router.patch('/approveProduct/:id', authenticateToken, authorizeRoles('admin'), approveProduct);

// Reject a product (Admin)
router.patch('/rejectProduct/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.json({ message: 'Product rejected successfully', product });
    } catch (error) {
        console.error('Error rejecting product:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete a product (Admin or Seller)
router.delete('/deleteProduct/:id', authenticateToken, authorizeRoles('admin', 'seller'), deleteProduct);

// Update a product (Seller)
router.put('/updateProduct/:id', authenticateToken, authorizeRoles('seller'), updateProduct);

// Get all products
router.get('/getProduct', getProducts);

// Get product by ID
router.get('/getProduct/:id', getProductById);

// Get seller's products
router.get('/getSellerProducts', authenticateToken, authorizeRoles('seller'), async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user.id });
        res.json(products);
    } catch (error) {
        console.error('Error fetching seller products:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

export default router;
