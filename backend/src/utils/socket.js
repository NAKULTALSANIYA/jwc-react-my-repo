import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import User from '../models/user.model.js';
import { logger } from './logger.js';

let ioInstance;

const ADMIN_ROOM = 'admins';

const buildAllowedOrigins = () => [
  env.FRONTEND_URL,
  ...(env.FRONTEND_URLS ? env.FRONTEND_URLS.split(',') : []),
]
  .filter(Boolean)
  .map((origin) => origin.trim());

const extractToken = (handshake) => {
  if (handshake.auth?.token) return handshake.auth.token;
  if (handshake.headers?.authorization?.startsWith('Bearer ')) {
    return handshake.headers.authorization.split(' ')[1];
  }
  return handshake.query?.token;
};

export const initSocketServer = (httpServer) => {
  if (ioInstance) return ioInstance;

  const allowedOrigins = buildAllowedOrigins();

  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        logger.warn('Socket origin rejected', { origin });
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    },
    transports: ['websocket', 'polling'],
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = extractToken(socket.handshake);
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('role isActive');

      if (!user || !user.isActive) {
        return next(new Error('Unauthorized'));
      }

      socket.data.user = {
        id: user._id.toString(),
        role: user.role,
      };

      return next();
    } catch (err) {
      logger.warn('Socket authentication failed', { message: err.message });
      return next(new Error('Authentication failed'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const { user } = socket.data;

    if (user?.role === 'admin' || user?.role === 'manager') {
      // Keep admin-only events scoped to their room
      socket.join(ADMIN_ROOM);
      logger.info('Admin socket connected', { userId: user.id });
    } else {
      logger.info('Socket connected', { userId: user?.id, role: user?.role });
    }

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { userId: user?.id, reason });
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.io has not been initialized. Call initSocketServer first.');
  }
  return ioInstance;
};

export const emitOrderCreated = (order) => {
  try {
    getIO().to(ADMIN_ROOM).emit('order:created', { order });
  } catch (err) {
    logger.error('Failed to emit order:created', err);
  }
};

export const emitOrderUpdated = (order) => {
  try {
    getIO().to(ADMIN_ROOM).emit('order:updated', { order });
  } catch (err) {
    logger.error('Failed to emit order:updated', err);
  }
};

export const adminRoom = ADMIN_ROOM;
