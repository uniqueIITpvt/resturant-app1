import { useState, useCallback } from 'react';
// import { ToastType } from 'react-hot-toast';
// import { ToastType } from '@components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

export default function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message: string) => {
      return addToast(message, 'success');
    },
    [addToast]
  );

  const showError = useCallback(
    (message: string) => {
      return addToast(message, 'error');
    },
    [addToast]
  );

  const showInfo = useCallback(
    (message: string) => {
      return addToast(message, 'info');
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showInfo,
  };
}
