const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

// Load environment variables (reads root unified .env or fallback)
const rootEnvPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
} else {
    dotenv.config();
}

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

// High-speed HTTP Gzip/Brotli response compression
app.use(compression());

// Security & Helmet (allow botanical external images & font assets)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4000',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static files for uploads (if local)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const aiRoutes = require('./routes/aiRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

// Serve Frontend (Client Build) when available - Allows single-service Render deployment
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
    // Aggressive immutable caching for fingerprinted assets; no-cache for index.html
    app.use(express.static(clientDistPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
        }
    }));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({
            status: 'online',
            store: 'Green Petals',
            owner: 'Munnar Khanam',
            message: 'Green Petals API is running smoothly'
        });
    });
}

// Error Handling Middleware
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

app.use(notFound);
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`🌿 Green Petals Server running on port ${PORT}`);
});

// Graceful Custom Shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
