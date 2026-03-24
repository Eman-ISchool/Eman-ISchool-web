'use client';

import { useState, useCallback, useRef } from 'react';

interface UploadProgress {
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  uploadSpeed: number;
}

interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  sourceId: string | null;
}

interface UseSourceUploadReturn {
  uploadFile: (file: File) => Promise<void>;
  cancelUpload: () => void;
  retryUpload: () => void;
  state: UploadState;
}

export function useSourceUpload(): UseSourceUploadReturn {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    sourceId: null,
  });

  const uploadRef = useRef<tus.Upload | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    // Create new abort controller for this upload
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState({
      isUploading: true,
      progress: {
        progress: 0,
        bytesUploaded: 0,
        bytesTotal: file.size,
        uploadSpeed: 0,
      },
      error: null,
      sourceId: null,
    });

    try {
      // Create TUS upload
      const upload = new tus.Upload(file, {
        endpoint: '/api/source-content',
        chunkSize: 5 * 1024 * 1024, // 5MB chunks
        retryDelays: [0, 3000, 5000], // Exponential backoff
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onError: (error) => {
          console.error('[useSourceUpload] Upload error:', error);
          setState(prev => ({
            ...prev,
            isUploading: false,
            error: error.message || 'Upload failed',
          }));
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const progress = (bytesUploaded / bytesTotal) * 100;
          const uploadSpeed = bytesUploaded / ((Date.now() - startTime) / 1000);

          setState(prev => ({
            ...prev,
            progress: {
              progress,
              bytesUploaded,
              bytesTotal,
              uploadSpeed,
            },
          }));
        },
        onSuccess: async () => {
          console.log('[useSourceUpload] Upload complete');
          
          // Extract source ID from upload response
          // Note: The actual source ID would come from API response
          // For now, we'll extract it from the upload URL or response
          const sourceId = extractSourceIdFromUpload(upload.url || '');

          setState(prev => ({
            ...prev,
            isUploading: false,
            progress: null,
            sourceId,
          }));
        },
      });

      uploadRef.current = upload;
      const startTime = Date.now();
      upload.start({
        uploadUrl: upload.url,
        options: {
          signal: abortControllerRef.current?.signal,
        },
      });
    } catch (error) {
      console.error('[useSourceUpload] Upload initiation error:', error);
      setState(prev => ({
        ...prev,
        isUploading: false,
        progress: null,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  }, []);

  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort(true);
      setState({
        isUploading: false,
        progress: null,
        error: 'Upload cancelled',
        sourceId: null,
      });
    }
  }, []);

  const retryUpload = useCallback(() => {
    if (!state.sourceId) {
      console.warn('[useSourceUpload] No source ID to retry');
      return;
    }

    setState({
      isUploading: false,
      progress: null,
      error: null,
      sourceId: null,
    });

    // TODO: Implement retry logic
    // This would call the upload API again with the same file
    console.log('[useSourceUpload] Retry requested');
  }, [state.sourceId]);

  const resetUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort(true);
    }
    
    setState({
      isUploading: false,
      progress: null,
      error: null,
      sourceId: null,
    });
  }, []);

  // Extract source ID from the TUS upload URL
  const extractSourceIdFromUpload = (url: string): string => {
    if (!url) return '';
    // TUS uploads typically append the resource ID to the endpoint URL
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  };

  return {
    uploadFile,
    cancelUpload,
    retryUpload,
    resetUpload,
    state,
  };
}
