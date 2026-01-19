import dotenv from 'dotenv';

dotenv.config();

// Preserve tri-state for cookie secure so "not provided" can default to NODE_ENV
const rawCookieSecure = process.env.COOKIE_SECURE;
const cookieSecure = rawCookieSecure === undefined ? undefined : rawCookieSecure === 'true';

const env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_URLS: process.env.FRONTEND_URLS, // comma-separated list of allowed origins
  BACKEND_URL: process.env.BACKEND_URL,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  COOKIE_SECURE: cookieSecure,
  COOKIE_SAMESITE: process.env.COOKIE_SAMESITE, // 'lax' | 'strict' | 'none'
};

export default env;
