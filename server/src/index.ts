import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import otpRoutes from './routes/otp';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import categoryRoutes from './routes/categories';
import subcategoryRoutes from './routes/subcategories';
import settingsRoutes from './routes/settings';
import paymentRoutes from './routes/payment';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import couponRoutes from './routes/coupons';
import deliveryOptionsRoutes from './routes/deliveryOptions';
import uploadRoutes from './routes/upload';
import bannerRoutes from './routes/banners';
import userRoutes from './routes/users';
import dashboardRoutes from './routes/dashboard';
import testimonialRoutes from './routes/testimonials';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/otp',          otpRoutes);
app.use('/api/products',     productRoutes);
app.use('/api/orders',       orderRoutes);
app.use('/api/categories',   categoryRoutes);
app.use('/api/subcategories',subcategoryRoutes);
app.use('/api/settings',     settingsRoutes);
app.use('/api/payment',      paymentRoutes);
app.use('/api/cart',         cartRoutes);
app.use('/api/wishlist',     wishlistRoutes);
app.use('/api/coupons',      couponRoutes);
app.use('/api/delivery-options', deliveryOptionsRoutes);
app.use('/api/upload',        uploadRoutes);
app.use('/api/banners',      bannerRoutes);
app.use('/api/users',        userRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/testimonials', testimonialRoutes);

app.get('/', (_req, res) => {
  res.json({ message: '🌸 Adaah Jewels API is running', version: '1.0.0' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
void connectDB();

app.listen(PORT, () => {
  console.log(`✨ Server running on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`);
});
