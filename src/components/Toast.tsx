'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 text-yellow-800 dark:text-yellow-200';
      case 'error':
        return 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200';
      default:
        return 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full border-l-4 p-4 rounded-md shadow-lg ${getToastStyles()}`}>
      <div className="flex items-start">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Toast Manager Component
interface ToastManagerProps {
  children: React.ReactNode;
}

export function ToastManager({ children }: ToastManagerProps) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastProps['type'] }>>([]);

  const showToast = (message: string, type: ToastProps['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}
