'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  ToastContainer,
  ToastType,
  ToastPosition,
} from '@/components/ui/Toast';

interface ToastItem {
  id: string;
  message: string;
  title?: string;
  type: ToastType;
  duration?: number;
  showProgress?: boolean;
  dismissible?: boolean;
}

interface ToastContextType {
  showToast: (props: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  loading: (message: string, title?: string) => void;
  network: (message: string, title?: string) => void;
  favorite: (message: string, title?: string) => void;
  review: (message: string, title?: string) => void;
  celebration: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = 'top-center',
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback(
    (props: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastItem = {
        id,
        duration: 4000,
        showProgress: true,
        dismissible: true,
        ...props,
      };

      setToasts((current) => {
        // Limit the number of toasts
        const updatedToasts = [newToast, ...current].slice(0, maxToasts);
        return updatedToasts;
      });

      // Auto-remove toast if duration is set
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, newToast.duration + 300); // Add extra time for exit animation
      }
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'success' });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'error', duration: 6000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'warning', duration: 5000 });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'info' });
    },
    [showToast]
  );

  const loading = useCallback(
    (message: string, title?: string) => {
      showToast({
        message,
        title,
        type: 'loading',
        duration: 0,
        dismissible: false,
        showProgress: false,
      });
    },
    [showToast]
  );

  const network = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'network' });
    },
    [showToast]
  );

  const favorite = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'favorite' });
    },
    [showToast]
  );

  const review = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'review' });
    },
    [showToast]
  );

  const celebration = useCallback(
    (message: string, title?: string) => {
      showToast({ message, title, type: 'celebration', duration: 6000 });
    },
    [showToast]
  );

  const value: ToastContextType = {
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    loading,
    network,
    favorite,
    review,
    celebration,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        removeToast={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
