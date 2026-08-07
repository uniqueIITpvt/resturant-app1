'use client';

import {
  AlertCircle,
  CheckCircle,
  X,
  Trash,
  AlertTriangle,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export type ConfirmModalType = 'delete' | 'warning' | 'info' | 'success';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: ConfirmModalType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      // Add delay to allow animation to complete before removing from DOM
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash className='h-6 w-6 text-red-600' />;
      case 'warning':
        return <AlertTriangle className='h-6 w-6 text-yellow-500' />;
      case 'info':
        return <AlertCircle className='h-6 w-6 text-blue-500' />;
      case 'success':
        return <CheckCircle className='h-6 w-6 text-green-500' />;
      default:
        return <AlertCircle className='h-6 w-6 text-gray-500' />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'delete':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    }
  };

  return (
    <div className='fixed inset-0 overflow-y-auto z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${
          isOpen
            ? 'backdrop-blur-sm bg-white/30'
            : 'backdrop-blur-none bg-transparent'
        }`}
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-lg max-w-md w-full mx-auto shadow-xl transform transition-all duration-300 ${
          isOpen
            ? 'translate-y-0 opacity-100 scale-100'
            : 'translate-y-4 opacity-0 scale-95'
        }`}
      >
        <div className='p-6'>
          <div className='flex items-center justify-between mb-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0 mr-3'>{getIcon()}</div>
              <h3 className='text-lg font-semibold text-gray-900'>{title}</h3>
            </div>
            <button
              onClick={onCancel}
              className='text-gray-400 hover:text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-full'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          <div className='mt-3 mb-5'>
            <p className='text-sm text-gray-600'>{message}</p>
          </div>

          <div className='flex justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm'
            >
              {cancelText}
            </button>
            <button
              type='button'
              onClick={onConfirm}
              className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${getButtonStyle()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
