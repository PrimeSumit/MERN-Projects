import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        match: /.+\@.+\..+/ // Basic email validation
    },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'buyer', 'seller'], default: 'buyer' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
