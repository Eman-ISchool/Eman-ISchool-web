'use client';

import React, { useState, useCallback, useRef } from 'react';
import * as tus from 'tus-js-client';
import { validateFileByType } from '@/lib/file-validation';
import type { SourceContentType } from '@/types/database';

interface UploadProgress {
  progress: number;
  bytesUploaded: number;
  bytesTotal: number;
  uploadSpeed: number; // bytes per second
}

interface SourceUploaderProps {
  onUploadComplete?: (sourceId: string, fileUrl: string) => void;
  onUploadError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
  acceptedTypes?: SourceContentType[];
  maxSizeMB?: number;
  className?: string;
}

export default function SourceUploader({
  onUploadComplete,
  onUploadError,
  onProgress,
  acceptedTypes = ['video', 'document', 'recording'],
  maxSizeMB = 500,
  className = '',
}: SourceUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<tus.Upload | null>(null);

  // Validate file
  const validateFile = useCallback((selectedFile: File) => {
    const type = getFileType(selectedFile);
    const validation = validateFileByType(selectedFile, type);
    
    if (!validation.valid) {
      setValidationError(validation.error || 'Invalid file');
      return false;
    }
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setValidationError(`File size exceeds ${maxSizeMB}MB limit`);
      return false;
    }
    
    setValidationError(null);
    return true;
  }, [acceptedTypes, maxSizeMB]);

  // Get file type from MIME type
  const getFileType = (file: File): SourceContentType => {
    const mimeType = file.type.toLowerCase();
    
    if (mimeType.startsWith('video/')) {
      return 'video';
    }
    if (mimeType.includes('pdf')) {
      return 'document';
    }
    if (mimeType.includes('word') || mimeType.includes('document')) {
      return 'document';
    }
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
      return 'document';
    }
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) {
      return 'document';
    }
    if (mimeType === 'text/plain' || mimeType === 'text/csv') {
      return 'document';
    }
    if (mimeType.startsWith('audio/')) {
      return 'recording';
    }
    
    // Default to video for recordings
    return 'video';
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    setUploadProgress({
      progress: 0,
      bytesUploaded: 0,
      bytesTotal: selectedFile.size,
      uploadSpeed: 0,
    });
  }, [validateFile]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  }, [handleFileSelect]);

  // Extract source ID from upload URL
  const extractSourceIdFromUpload = (url: string): string => {
    // This is a placeholder - in production, the API would return the source ID
    // For now, we'll return a mock ID
    return 'mock-source-id';
  };

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (uploadRef.current) {
      uploadRef.current.abort(true);
      setIsUploading(false);
      setUploadProgress(null);
      setFile(null);
    }
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const sizeIndex = Math.floor(i / 3);
    return Math.round((bytes / Math.pow(k, sizeIndex)) * 100) / 100 + ' ' + sizes[sizeIndex];
  };

  // Get accepted file types for input
  const getAcceptedTypes = (): string => {
    const types: string[] = [];
    
    if (acceptedTypes.includes('video')) {
      types.push('video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska', 'video/x-msvideo', 'video/3gpp', 'video/x-flv', 'video/x-ms-wmv', 'video/mpeg');
    }
    if (acceptedTypes.includes('document')) {
      types.push(
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
      );
    }
    if (acceptedTypes.includes('recording')) {
      types.push('video/mp4', 'video/webm', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm');
    }
    
    return types.join(',');
  };

  return (
    <div
      className={`source-uploader ${className} ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={getAcceptedTypes()}
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />
      
      <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
        {isUploading ? (
          <div className="uploading-state">
            <div className="spinner" />
            <div className="progress-info">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress?.progress || 0}%` }}
                />
              </div>
              <span className="progress-text">
                {Math.round(uploadProgress?.progress || 0)}%
              </span>
            </div>
            <div className="upload-details">
              <span>{formatFileSize(uploadProgress?.bytesUploaded || 0)}</span>
              <span> / </span>
              <span>{formatFileSize(uploadProgress?.bytesTotal || 0)}</span>
              {uploadProgress?.uploadSpeed && uploadProgress.uploadSpeed > 0 && (
                <span className="upload-speed">
                  ({formatFileSize(uploadProgress.uploadSpeed)}/s)
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="idle-state">
            <div className="upload-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 15v4a2 2 0 011-2 0 0 0 0v-2a2 2 0 01-4 0-2 2 0 01 4 0 0 0zm-9 9h.01M11 9a2 2 0 0112 2 0 0 0a2 2 0 01-4 2 0 0 0 0zm-9 9h.01V11a2 2 0 0112 2 0 0 0a2 2 0 01-4 2 0 0 0z"
                />
              </svg>
            </div>
            <div className="upload-text">
              {isDragging ? (
                <p>Drop your file here</p>
              ) : (
                <p>
                  {file ? (
                    <span className="file-name">{file.name}</span>
                  ) : (
                    <span>Click to upload or drag and drop</span>
                  )}
                </p>
              )}
              <p className="file-types">
                Videos (MP4, MOV, WebM) • Documents (PDF, DOCX, TXT)
              </p>
              <p className="file-limit">
                Max size: {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
        
        {validationError && (
          <div className="validation-error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
              <path d="M12 16v4" strokeWidth="2" />
            </svg>
            <span>{validationError}</span>
            <button
              className="dismiss-error"
              onClick={() => setValidationError(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        
        {isUploading && (
          <button className="cancel-button" onClick={cancelUpload}>
            Cancel Upload
          </button>
        )}
      </div>
      
      <style jsx>{`
        .source-uploader {
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .source-uploader.dragging {
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
        .upload-area {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .hidden {
          display: none;
        }
        .idle-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }
        .uploading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .upload-icon {
          color: #64748b;
        }
        .upload-text {
          color: #374151;
          font-size: 14px;
          line-height: 1.5;
        }
        .file-name {
          font-weight: 600;
          color: #1f2937;
        }
        .file-types, .file-limit {
          font-size: 12px;
          color: #6b7280;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          transition: width 0.3s ease;
        }
        .progress-text {
          font-size: 12px;
          font-weight: 600;
          color: #3b82f6;
        }
        .upload-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6b7280;
        }
        .upload-speed {
          color: #9ca3af;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .validation-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background-color: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 4px;
          margin-top: 16px;
        }
        .validation-error svg {
          color: #dc2626;
          flex-shrink: 0;
        }
        .validation-error span {
          flex: 1;
          font-size: 13px;
          color: #dc2626;
        }
        .dismiss-error {
          padding: 4px 12px;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }
        .cancel-button {
          margin-top: 16px;
          padding: 8px 16px;
          background-color: #dc2626;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }
        .cancel-button:hover {
          background-color: #b91c1c;
        }
      `}</style>
    </div>
  );
}
