/* eslint-disable react-refresh/only-export-components */
import React, { useEffect, useState } from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

const toastContainer = {
  notifications: [],
  listeners: [],
  
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  notify(message, type = 'success', duration = 3000) {
    const id = Math.random();
    this.notifications.push({ id, message, type, duration });
    this.listeners.forEach(listener => listener(this.notifications));
    
    if (duration > 0) {
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.listeners.forEach(listener => listener(this.notifications));
      }, duration);
    }
    
    return id;
  }
};

export const useToast = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    return toastContainer.subscribe(setNotifications);
  }, []);
  
  return {
    notifications,
    success: (message, duration) => toastContainer.notify(message, 'success', duration),
    error: (message, duration) => toastContainer.notify(message, 'error', duration),
    info: (message, duration) => toastContainer.notify(message, 'info', duration),
    warning: (message, duration) => toastContainer.notify(message, 'warning', duration),
  };
};

const ToastItem = ({ notification, onRemove }) => {
  const baseStyles = 'w-full flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm';
  
  const typeStyles = {
    success: 'bg-green-500/20 border-green-500/50 text-green-100',
    error: 'bg-red-500/20 border-red-500/50 text-red-100',
    info: 'bg-blue-500/20 border-blue-500/50 text-blue-100',
    warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100',
  };
  
  const iconMap = {
    success: <Check className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />,
    warning: <AlertCircle className="w-5 h-5 shrink-0" />,
  };
  
  return (
    <div className={`${baseStyles} ${typeStyles[notification.type]} animate-fade-in-down`}>
      {iconMap[notification.type]}
      <span className="flex-1 text-sm font-medium break-word">{notification.message}</span>
      <button
        onClick={onRemove}
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const { notifications, success, error, info, warning } = useToast();
  
  // Make toast methods globally available
  React.useEffect(() => {
    window.toast = { success, error, info, warning };
  }, [success, error, info, warning]);
  
  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-2 max-w-sm pointer-events-none">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <ToastItem
              notification={notification}
              onRemove={() => {
                toastContainer.notifications = toastContainer.notifications.filter(
                  n => n.id !== notification.id
                );
                toastContainer.listeners.forEach(listener => 
                  listener(toastContainer.notifications)
                );
              }}
            />
          </div>
        ))}
      </div>
    </>
  );
};

export default ToastItem;
