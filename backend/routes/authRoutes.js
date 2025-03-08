import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controller/authController.js';
import User from '../models/user.model.js';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working' });
});

// Get user count (for admin dashboard)
router.get('/users/count', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ count });
    } catch (error) {
        console.error('Error counting users:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

export default router;
