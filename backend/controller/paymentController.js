import razorpayInstance from '../config/razorpay.js';
import crypto from 'crypto';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { calculateAdminMargin } from '../utils/calculateAdminMargin.js';


export const createRazorpayOrder = async (req, res) => {
    const { amount, currency = 'INR', receipt, productId } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product || product.stock <= 0) {
            return res.status(400).json({ message: 'Product is out of stock or unavailable' });
        }

        // Calculate admin margin
        const adminMargin = calculateAdminMargin(amount);

        const options = {
            amount: Math.round((amount + adminMargin) * 100), // Add admin margin and convert to paise
            currency,
            receipt,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Save order in the database
        const newOrder = new Order({
            buyer: req.user.id,
            product: productId,
            amount,
            adminMargin,
            paymentStatus: 'pending',
            razorpay_order_id: razorpayOrder.id,
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            order: razorpayOrder,
            adminMargin,
            totalAmount: amount + adminMargin,
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
    }
};


// Verify Razorpay Payment
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update order payment status
        const order = await Order.findOneAndUpdate(
            { razorpay_order_id },
            { paymentStatus: 'paid', razorpay_payment_id },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ success: true, order });
    } catch (error) {
        res.status(500).json({ message: 'Payment verification failed', error: error.message });
    }
};
