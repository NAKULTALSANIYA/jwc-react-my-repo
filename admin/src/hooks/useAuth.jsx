import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { adminApi } from '../api/admin';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (err) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(user && token);

  const persistSession = useCallback((nextUser, nextToken) => {
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    localStorage.setItem('token', nextToken);
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const data = await adminApi.login({ email, password });
      const nextUser = data?.user;
      const accessToken = data?.accessToken;

      if (!nextUser || !accessToken) {
        throw new Error('Login response missing user or token');
      }

      // Check if user is a customer account
      if (nextUser.role === 'customer') {
        throw new Error('Customer accounts cannot access the admin panel. Please use your customer account on the main website.');
      }

      if (!['admin', 'manager'].includes(nextUser.role)) {
        throw new Error('You do not have permission to access the admin panel');
      }

      persistSession(nextUser, accessToken);
      return nextUser;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken('');
  }, []);

  const value = useMemo(() => ({
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }), [isAuthenticated, isLoading, login, logout, token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
