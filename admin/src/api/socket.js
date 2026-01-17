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
      autoConnect: false,
      transports: ['websocket'],
      withCredentials: true,
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
