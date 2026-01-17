import { createServer } from 'http';
import env from './src/config/env.js';
import { logger } from './src/utils/logger.js';
import app from './src/app.js';
import { initSocketServer } from './src/utils/socket.js';

const PORT = env.PORT || 5000;
const httpServer = createServer(app);
export const io = initSocketServer(httpServer);

const server = httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

export default server;