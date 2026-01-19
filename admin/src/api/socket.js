import { io } from 'socket.io-client';

// Singleton Socket.IO client for the admin panel to avoid duplicate connections
let adminSocket;

const SOCKET_URL = (() => {
  const fromEnv = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin;
  return '';
})();

export const getAdminSocket = (token) => {
  if (!SOCKET_URL) {
    throw new Error('Socket URL is not configured');
  }
  if (!token) {
    throw new Error('Admin socket requires an auth token');
  }

  if (!adminSocket) {
    adminSocket = io(SOCKET_URL, {
      path: '/socket.io/', // Explicit path for Nginx compatibility
      autoConnect: false,
      // Order matters: websocket first, fallback to polling
      transports: ['websocket', 'polling'],
      withCredentials: true,
      auth: { token },
      // Connection settings for production
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      // Ping/Pong settings
      pingInterval: 25000,
      pingTimeout: 20000,
      // Timeouts
      upgradeTimeout: 10000,
      // Enable for production debugging
      debug: false,
    });

    // Error handling
    adminSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    adminSocket.on('disconnect', (reason) => {
      console.info('Socket disconnected:', reason);
    });
  }

  const tokenChanged = adminSocket.auth?.token !== token;
  adminSocket.auth = { token };

  if (tokenChanged && adminSocket.connected) {
    adminSocket.disconnect();
  }

  if (!adminSocket.connected) {
    adminSocket.connect();
  }

  return adminSocket;
};

export const teardownAdminSocket = () => {
  if (!adminSocket) return;
  adminSocket.removeAllListeners();
  adminSocket.disconnect();
  adminSocket = null;
};
