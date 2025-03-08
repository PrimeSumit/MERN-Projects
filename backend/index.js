import express from "express"
const app = express()
import dotenv from "dotenv"
import { connectdb } from "./config/db.js";
import cors from 'cors'
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import authRoutes from "./routes/authRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import paymentRoutes from "./routes/paymentRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"

dotenv.config();
connectdb();

// Middleware
app.use(express.json())
app.use(bodyParser.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    exposedHeaders: ['set-cookie']
}));

const port = process.env.PORT || 3000;

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/order', orderRoutes);

// Test route
app.get('/', (req, res) => {
    res.json({ message: "Backend server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received. Closing MongoDB connection...');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        server.close(() => {
            console.log('Server shut down.');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});