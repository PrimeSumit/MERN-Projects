import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { calculateAdminMargin } from '../utils/calculateAdminMargin.js';


export const createOrder = async (req, res) => {
    const { productId, amount } = req.body;

    try {
        const product = await Product.findById(productId);
        if (!product || product.stock <= 0) {
            return res.status(400).json({ message: 'Product is out of stock or unavailable' });
        }

        // Fetch or calculate the admin margin if required here (optional)
        const adminMargin = calculateAdminMargin(amount);

        const newOrder = new Order({
            buyer: req.user.id,
            product: productId,
            amount,
            adminMargin,
            paymentStatus: 'pending',
        });

        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
};



// Get Orders (Role-Based Access)
export const getOrders = async (req, res) => {
    try {
        let orders;

        if (req.user.role === 'buyer') {
            orders = await Order.find({ buyer: req.user.id }).populate('product');
        } else if (req.user.role === 'seller') {
            const sellerProducts = await Product.find({ seller: req.user.id });
            const productIds = sellerProducts.map((product) => product._id);
            orders = await Order.find({ product: { $in: productIds } }).populate('product');
        } else if (req.user.role === 'admin') {
            orders = await Order.find().populate('product');
        } else {
            return res.status(403).json({ message: 'Access Denied' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
    }
};

// Cancel an Order (Buyer Only)
export const cancelOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Restore stock for the product
        const product = await Product.findById(order.product);
        if (product) {
            product.stock += 1;
            await product.save();
        }

        // Update order status
        order.paymentStatus = 'canceled';
        await order.save();

        res.status(200).json({ message: 'Order canceled successfully', order });
    } catch (error) {
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
};
