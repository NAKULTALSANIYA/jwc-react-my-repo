import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import env from './env.js';

const connectDB = async () => {
  try {
    if (!env.MONGODB_URI) {
      logger.error('MongoDB connection error: MONGODB_URI is not set.');
      throw new Error('MONGODB_URI missing in environment');
    }
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;