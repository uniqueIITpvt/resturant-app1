'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  Wifi,
  Heart,
  Star,
  Sparkles,
} from 'lucide-react';

export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'loading'
  | 'network'
  | 'favorite'
  | 'review'
  | 'celebration';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

interface ToastProps {
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number;
  showProgress?: boolean;
  dismissible?: boolean;
  onClose?: () => void;
}

const Toast = ({
  message,
  title,
  type = 'success',
  duration = 3000,
  showProgress = true,
  dismissible = true,
  onClose,
}: ToastProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isMobile, setIsMobile] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<number>(100);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Progress and auto-dismiss
  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      progressRef.current -= (100 / duration) * 50;
      setProgress(progressRef.current);

      if (progressRef.current <= 0) {
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) setTimeout(onClose, 300);
  };

  // Touch handlers for mobile swipe-to-dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile || !dismissible) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isMobile) return;
    const touch = e.touches[0];
    const diff = touch.clientX - startX;
    setCurrentX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || !isMobile) return;
    setIsDragging(false);

    if (Math.abs(currentX) > 100) {
      handleClose();
    } else {
      setCurrentX(0);
    }
  };

  const getIcon = () => {
    const iconSize = isMobile ? 'h-5 w-5' : 'h-6 w-6';
    const iconColor = 'text-white';

    switch (type) {
      case 'success':
        return <CheckCircle className={`${iconSize} ${iconColor}`} />;
      case 'error':
        return <AlertCircle className={`${iconSize} ${iconColor}`} />;
      case 'warning':
        return <AlertTriangle className={`${iconSize} ${iconColor}`} />;
      case 'info':
        return <Info className={`${iconSize} ${iconColor}`} />;
      case 'loading':
        return (
          <div className={`${iconSize} ${iconColor}`}>
            <div className='animate-spin rounded-full h-full w-full border-2 border-white border-t-transparent' />
          </div>
        );
      case 'network':
        return <Wifi className={`${iconSize} ${iconColor}`} />;
      case 'favorite':
        return <Heart className={`${iconSize} ${iconColor} fill-current`} />;
      case 'review':
        return <Star className={`${iconSize} ${iconColor} fill-current`} />;
      case 'celebration':
        return <Sparkles className={`${iconSize} ${iconColor}`} />;
      default:
        return <CheckCircle className={`${iconSize} ${iconColor}`} />;
    }
  };

  const getToastStyle = () => {
    const baseStyles = 'shadow-2xl backdrop-blur-sm border';

    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 border-green-400`;
      case 'error':
        return `${baseStyles} bg-gradient-to-r from-red-500 to-red-600 border-red-400`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400`;
      case 'info':
        return `${baseStyles} bg-gradient-to-r from-blue-500 to-blue-600 border-blue-400`;
      case 'loading':
        return `${baseStyles} bg-gradient-to-r from-indigo-500 to-indigo-600 border-indigo-400`;
      case 'network':
        return `${baseStyles} bg-gradient-to-r from-purple-500 to-purple-600 border-purple-400`;
      case 'favorite':
        return `${baseStyles} bg-gradient-to-r from-pink-500 to-pink-600 border-pink-400`;
      case 'review':
        return `${baseStyles} bg-gradient-to-r from-yellow-500 to-yellow-600 border-yellow-400`;
      case 'celebration':
        return `${baseStyles} bg-gradient-to-r from-violet-500 to-violet-600 border-violet-400`;
      default:
        return `${baseStyles} bg-gradient-to-r from-green-500 to-green-600 border-green-400`;
    }
  };

  const getAnimationClasses = () => {
    if (!isVisible) {
      return 'opacity-0 scale-95 translate-y-2';
    }
    return 'opacity-100 scale-100 translate-y-0';
  };

  return (
    <div
      ref={toastRef}
      className={`transition-all duration-300 ease-out ${getAnimationClasses()}`}
      style={{
        transform: isDragging ? `translateX(${currentX}px)` : undefined,
        maxWidth: isMobile ? 'calc(100vw - 2rem)' : '400px',
        minWidth: isMobile ? '280px' : '320px',
        width: '100%',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`relative overflow-hidden rounded-2xl text-white ${getToastStyle()} ${
          isMobile ? 'p-4' : 'p-5'
        }`}
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent' />
          <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent' />
        </div>

        {/* Content */}
        <div className='relative flex items-start gap-3'>
          {/* Icon */}
          <div className='flex-shrink-0 mt-0.5'>{getIcon()}</div>

          {/* Text Content */}
          <div className='flex-1 min-w-0'>
            {title && (
              <h4
                className={`font-semibold ${
                  isMobile ? 'text-sm' : 'text-base'
                } mb-1 leading-tight`}
              >
                {title}
              </h4>
            )}
            <p
              className={`${isMobile ? 'text-sm' : 'text-base'} ${
                title ? 'opacity-90' : ''
              } leading-relaxed break-words`}
            >
              {message}
            </p>
          </div>

          {/* Close Button */}
          {dismissible && (
            <button
              onClick={handleClose}
              className={`flex-shrink-0 text-white/80 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10 active:scale-95 ${
                isMobile ? 'ml-2' : 'ml-3'
              }`}
              aria-label='Close toast'
            >
              <X className={isMobile ? 'h-4 w-4' : 'h-5 w-5'} />
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {showProgress && duration > 0 && (
          <div className='absolute bottom-0 left-0 right-0 h-1 bg-white/20'>
            <div
              className='h-full bg-white/60 transition-all duration-75 ease-linear rounded-r-full'
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Mobile Swipe Indicator */}
        {isMobile && dismissible && (
          <div className='absolute top-2 right-2 opacity-30'>
            <div className='text-xs text-white/60'>swipe →</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Toast;

// Toast Container for multiple toasts
export function ToastContainer({
  toasts,
  removeToast,
  position = 'top-center',
}: {
  toasts: Array<{
    id: string;
    message: string;
    title?: string;
    type: ToastType;
    duration?: number;
    showProgress?: boolean;
    dismissible?: boolean;
  }>;
  removeToast: (id: string) => void;
  position?: ToastPosition;
}) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const getContainerClasses = () => {
    const spacing = isMobile ? 'gap-2' : 'gap-3';
    const direction = position.includes('top')
      ? 'flex-col'
      : 'flex-col-reverse';

    return `fixed z-[9999] ${spacing} flex ${direction} pointer-events-none`;
  };

  const getContainerPosition = () => {
    // Improved mobile and desktop positioning
    const positions = {
      'top-left': isMobile ? 'top-4 left-4 top-safe left-safe' : 'top-6 left-6',
      'top-center': isMobile
        ? 'toast-top-center'
        : 'top-6 left-1/2 -translate-x-1/2',
      'top-right': isMobile
        ? 'top-4 right-4 top-safe right-safe'
        : 'top-6 right-6',
      'bottom-left': isMobile
        ? 'bottom-4 left-4 bottom-safe left-safe'
        : 'bottom-6 left-6',
      'bottom-center': isMobile
        ? 'bottom-4 left-1/2 -translate-x-1/2 bottom-safe'
        : 'bottom-6 left-1/2 -translate-x-1/2',
      'bottom-right': isMobile
        ? 'bottom-4 right-4 bottom-safe right-safe'
        : 'bottom-6 right-6',
    };

    return positions[position];
  };

  const getContainerStyles = () => {
    return {
      maxWidth: isMobile ? 'min(400px, calc(100vw - 2rem))' : '400px',
      minWidth: isMobile ? 'min(280px, calc(100vw - 2rem))' : '320px',
      width: position.includes('center') ? 'auto' : undefined,
    };
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className={`${getContainerClasses()} ${getContainerPosition()}`}
      style={getContainerStyles()}
    >
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className='pointer-events-auto w-full'
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <Toast
            message={toast.message}
            title={toast.title}
            type={toast.type}
            duration={toast.duration}
            showProgress={toast.showProgress}
            dismissible={toast.dismissible}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Hook for using toasts - This is just a placeholder, actual implementation is in ToastContext
export function useToast() {
  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    console.log('Toast:', props);
  };

  return {
    success: (message: string, title?: string) =>
      showToast({ message, title, type: 'success' }),
    error: (message: string, title?: string) =>
      showToast({ message, title, type: 'error' }),
    warning: (message: string, title?: string) =>
      showToast({ message, title, type: 'warning' }),
    info: (message: string, title?: string) =>
      showToast({ message, title, type: 'info' }),
    loading: (message: string, title?: string) =>
      showToast({ message, title, type: 'loading', duration: 0 }),
    network: (message: string, title?: string) =>
      showToast({ message, title, type: 'network' }),
    favorite: (message: string, title?: string) =>
      showToast({ message, title, type: 'favorite' }),
    review: (message: string, title?: string) =>
      showToast({ message, title, type: 'review' }),
    celebration: (message: string, title?: string) =>
      showToast({ message, title, type: 'celebration' }),
  };
}
