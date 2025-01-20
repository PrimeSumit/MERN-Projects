import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    amount: { type: Number, required: true },
    adminMargin: { type: Number, required: true }, // Store admin margin
    paymentStatus: { type: String, enum: ['pending', 'paid', 'canceled', 'returned'], default: 'pending' },
    razorpay_order_id: { type: String },
    razorpay_payment_id: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

