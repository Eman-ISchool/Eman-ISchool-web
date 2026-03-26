'use client';

import { Download, Smartphone, Tablet, Globe } from 'lucide-react';
import { formatFileSize } from '@/types/builds';

interface PlatformCardProps {
  platform: 'android' | 'ios' | 'pwa';
  version: string;
  downloadUrl?: string;
  fileSize?: number;
  instructions: string[];
  isRecommended?: boolean;
}

export function PlatformCard({
  platform,
  version,
  downloadUrl,
  fileSize,
  instructions,
  isRecommended = false,
  onInstall,
}: PlatformCardProps & { onInstall?: () => void }) {
  const getIcon = () => {
    switch (platform) {
      case 'android':
        return <Smartphone className="w-12 h-12 text-green-600" />;
      case 'ios':
        return <Tablet className="w-12 h-12 text-blue-600" />;
      case 'pwa':
        return <Globe className="w-12 h-12 text-purple-600" />;
    }
  };

  const getPlatformName = () => {
    switch (platform) {
      case 'android':
        return 'Android';
      case 'ios':
        return 'iOS';
      case 'pwa':
        return 'PWA (Web App)';
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 transition-all ${isRecommended
          ? 'border-blue-500 shadow-lg'
          : 'border-gray-200 hover:border-gray-300'
        }`}
    >
      {isRecommended && (
        <span className="absolute -top-3 -right-3 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          Recommended
        </span>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-4">
          {getIcon()}
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{getPlatformName()}</h3>
            <p className="text-sm text-gray-600">Version {version}</p>
          </div>
        </div>

        {platform === 'pwa' && onInstall ? (
          <button
            onClick={onInstall}
            className="flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mb-6"
          >
            <Download className="w-5 h-5" />
            Install App
          </button>
        ) : downloadUrl ? (
          <a
            href={downloadUrl}
            download
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors mb-6"
          >
            <Download className="w-5 h-5" />
            Download
          </a>
        ) : (
          <div className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-500 font-medium py-3 px-6 rounded-lg mb-6">
            {platform === 'pwa' ? 'Already Installed' : 'Coming Soon'}
          </div>
        )}

        {fileSize && (
          <p className="text-sm text-gray-600 mb-4">
            File size: {formatFileSize(fileSize)}
          </p>
        )}

        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Installation Instructions</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            {instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
