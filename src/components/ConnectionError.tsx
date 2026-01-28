'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface ConnectionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function ConnectionError({ message = 'Unable to connect to the server', onRetry }: ConnectionErrorProps) {
  const handleRetry = () => {
    // Default retry behavior: reload the page
    window.location.reload();
    // If custom retry handler provided, call it
    onRetry?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 rounded-full p-4">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    </div>
  );
}
