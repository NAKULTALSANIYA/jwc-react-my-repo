import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import connectDB from './config/database.js';
import './config/passport.js'; // Import passport configuration

import { errorHandler } from './middlewares/error.js';
// Import route files
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import cartRoutes from './routes/cart.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import reviewRoutes from './routes/review.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import contactRoutes from './routes/contact.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Behind a proxy/load balancer (e.g., Nginx) we need to trust X-Forwarded-* headers
app.set('trust proxy', 1)

// Rate limiting with proper trust proxy handling
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    return req.ip;
  },

  skip: (req) => {
    // ✅ Skip socket.io handshake
    if (req.path.startsWith('/socket.io')) return true;

    // Skip rate limiting for authenticated dashboard users
    return req.path.startsWith('/api/dashboard') && req.user;
  }
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow cross-origin resource loading
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:", "http:"],
    },
  },
}));
app.use(limiter);

// CORS configuration (support multiple origins)
const allowedOrigins = [env.FRONTEND_URL, ...(env.FRONTEND_URLS ? env.FRONTEND_URLS.split(',') : [])]
  .filter(Boolean)
  .map((origin) => origin.trim());

console.log('Allowed CORS origins:', allowedOrigins);

const corsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // Fail closed with a clear message for unexpected origins
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads folder with explicit CORS headers
app.use('/uploads', (req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0] || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Cookie parser (needed for reading cookies in auth middleware)
app.use(cookieParser());

// Session configuration
const mongoUrl = env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
app.use(session({
  secret: env.SESSION_SECRET || 'your-secret-key-change-this-in-production',
  resave: false,
  saveUninitialized: false,
  store: env.NODE_ENV === 'production' ? new MongoStore({
    mongoUrl: mongoUrl,
    touchAfter: 24 * 3600 // lazy session update interval (in seconds)
  }) : undefined,
  cookie: {
    secure: env.COOKIE_SECURE !== undefined ? env.COOKIE_SECURE : env.NODE_ENV === 'production',
    sameSite: env.COOKIE_SAMESITE || (env.NODE_ENV === 'production' ? 'none' : 'lax'),
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {}),
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'shdouqgljehrjewrupewrg',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);


// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handling middleware
app.use(errorHandler);

export default app;