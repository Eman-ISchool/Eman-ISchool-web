'use client';

import { useState } from 'react';
import { validateExternalUrl, getVideoMetadata, checkVideoAvailability } from '@/lib/external-video';

interface ExternalLinkInputProps {
  onSubmit: (data: {
    url: string;
    title?: string;
    description?: string;
    classId?: string;
    gradeLevel?: string;
    groupId?: string;
  }) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

interface VideoMetadata {
  provider: 'youtube' | 'vimeo' | 'other';
  externalId: string;
  title?: string;
  thumbnailUrl?: string;
  duration?: number;
  isAvailable: boolean;
}

export default function ExternalLinkInput({
  onSubmit,
  onCancel,
  isLoading = false,
}: ExternalLinkInputProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [groupId, setGroupId] = useState('');

  const [isValidating, setIsValidating] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = async (value: string) => {
    setUrl(value);
    setError(null);
    setMetadata(null);

    if (!value.trim()) {
      return;
    }

    // Basic validation
    const validation = validateExternalUrl(value);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid video URL');
      return;
    }

    // Fetch metadata
    setIsValidating(true);
    try {
      const videoMetadata = await getVideoMetadata(value);
      if (videoMetadata) {
        setMetadata(videoMetadata);
        // Auto-fill title if not already set
        if (!title && videoMetadata.title) {
          setTitle(videoMetadata.title);
        }
      } else {
        setError('Failed to fetch video metadata');
      }
    } catch (err) {
      setError('Failed to validate video URL');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Video URL is required');
      return;
    }

    const validation = validateExternalUrl(url);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid video URL');
      return;
    }

    // Check availability
    const isAvailable = await checkVideoAvailability(url);
    if (!isAvailable) {
      setError('Video is not available or has been removed');
      return;
    }

    onSubmit({
      url: url.trim(),
      title: title.trim() || undefined,
      description: description.trim() || undefined,
      classId: classId || undefined,
      gradeLevel: gradeLevel || undefined,
      groupId: groupId || undefined,
    });
  };

  const getProviderIcon = () => {
    if (metadata?.provider === 'youtube') {
      return (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    } else if (metadata?.provider === 'vimeo') {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 003.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Add External Video
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add a video from YouTube or Vimeo to create an educational reel
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* URL Input */}
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Video URL *
          </label>
          <div className="relative">
            <input
              id="url"
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {isValidating && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {/* Video Preview */}
        {metadata && metadata.isAvailable && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              {getProviderIcon()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {metadata.title || 'External Video'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {metadata.provider}
                </p>
              </div>
              {metadata.thumbnailUrl && (
                <img
                  src={metadata.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-24 h-16 object-cover rounded"
                />
              )}
            </div>
          </div>
        )}

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Reel title (optional)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={isLoading}
          />
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the content of this reel (optional)"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            disabled={isLoading}
          />
        </div>

        {/* Visibility Settings */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Visibility Settings (Optional)
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="classId" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Class
              </label>
              <input
                id="classId"
                type="text"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="Class ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="gradeLevel" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Grade Level
              </label>
              <input
                id="gradeLevel"
                type="text"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                placeholder="Grade Level"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label htmlFor="groupId" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Group
              </label>
              <input
                id="groupId"
                type="text"
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
                placeholder="Group ID"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !url.trim() || !metadata?.isAvailable}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Creating...' : 'Create Reel'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
