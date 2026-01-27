'use client';

import { useState } from 'react';

export interface ReelData {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  status: string;
}

export interface ReelEditorProps {
  reel: ReelData;
  onSave: (updatedReel: Partial<ReelData>) => Promise<void>;
  onCancel: () => void;
  className?: string;
}

export default function ReelEditor({
  reel,
  onSave,
  onCancel,
  className = '',
}: ReelEditorProps) {
  const [titleEn, setTitleEn] = useState(reel.title_en);
  const [titleAr, setTitleAr] = useState(reel.title_ar);
  const [descriptionEn, setDescriptionEn] = useState(reel.description_en || '');
  const [descriptionAr, setDescriptionAr] = useState(reel.description_ar || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      // Validate required fields
      if (!titleEn.trim()) {
        setError('English title is required');
        return;
      }

      if (!titleAr.trim()) {
        setError('Arabic title is required');
        return;
      }

      await onSave({
        title_en: titleEn,
        title_ar: titleAr,
        description_en: descriptionEn,
        description_ar: descriptionAr,
      });
    } catch (err) {
      console.error('[ReelEditor] Error saving reel:', err);
      setError(err instanceof Error ? err.message : 'Failed to save reel');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`reel-editor ${className}`}>
      <h2 className="editor-title">Edit Reel</h2>

      {/* Preview */}
      <div className="reel-preview">
        <video
          className="preview-video"
          src={reel.video_url}
          poster={reel.thumbnail_url}
          controls
        />
        <div className="preview-info">
          <span className="duration-badge">
            {Math.floor(reel.duration_seconds / 60)}:
            {(reel.duration_seconds % 60).toString().padStart(2, '0')}
          </span>
          <span className="status-badge">{reel.status}</span>
        </div>
      </div>

      {/* Form */}
      <div className="editor-form">
        {error && (
          <div className="error-message">
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
            <span>{error}</span>
          </div>
        )}

        {/* English Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="title-en">
            English Title <span className="required">*</span>
          </label>
          <input
            id="title-en"
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="Enter reel title in English"
            className="form-input"
            maxLength={200}
          />
          <span className="char-count">
            {titleEn.length}/200
          </span>
        </div>

        {/* Arabic Title */}
        <div className="form-group">
          <label className="form-label" htmlFor="title-ar">
            Arabic Title <span className="required">*</span>
          </label>
          <input
            id="title-ar"
            type="text"
            value={titleAr}
            onChange={(e) => setTitleAr(e.target.value)}
            placeholder="أدخل عنوان الفيديو بالعربية"
            className="form-input"
            maxLength={200}
            dir="rtl"
          />
          <span className="char-count">
            {titleAr.length}/200
          </span>
        </div>

        {/* English Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description-en">
            English Description
          </label>
          <textarea
            id="description-en"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            placeholder="Enter reel description in English"
            className="form-textarea"
            rows={4}
            maxLength={1000}
          />
          <span className="char-count">
            {descriptionEn.length}/1000
          </span>
        </div>

        {/* Arabic Description */}
        <div className="form-group">
          <label className="form-label" htmlFor="description-ar">
            Arabic Description
          </label>
          <textarea
            id="description-ar"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            placeholder="أدخل وصف الفيديو بالعربية"
            className="form-textarea"
            rows={4}
            maxLength={1000}
            dir="rtl"
          />
          <span className="char-count">
            {descriptionAr.length}/1000
          </span>
        </div>

        {/* Actions */}
        <div className="form-actions">
          <button
            className="cancel-button"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg
                  className="spinner"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2v4M12 18v4M4.93 4.93l1.41 1.41M17.66 17.66l-1.41 1.41M12 12l4.24 4.24M12 12l-4.24 4.24M12 12l-4.24-4.24M12 12l4.24-4.24"
                  />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .reel-editor {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .editor-title {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
        }

        .reel-preview {
          position: relative;
          width: 100%;
          max-width: 400px;
          aspect-ratio: 9/16;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
        }

        .preview-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
        }

        .duration-badge {
          background: rgba(0, 0, 0, 0.6);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.published {
          background: #10b981;
          color: white;
        }

        .status-badge.unpublished {
          background: #f59e0b;
          color: white;
        }

        .status-badge.pending_review {
          background: #3b82f6;
          color: white;
        }

        .editor-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 6px;
          color: #dc2626;
          font-size: 14px;
        }

        .error-message svg {
          flex-shrink: 0;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .required {
          color: #dc2626;
        }

        .form-input {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-textarea {
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .char-count {
          font-size: 12px;
          color: #9ca3af;
          text-align: right;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .cancel-button {
          flex: 1;
          padding: 10px 20px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cancel-button:hover:not(:disabled) {
          background: #f9fafb;
        }

        .cancel-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .save-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .save-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .reel-preview {
            max-width: 100%;
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-button,
          .save-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
