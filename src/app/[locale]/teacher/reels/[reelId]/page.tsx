'use client';

import { useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import ReelEditor, { type ReelData } from '@/components/reels/ReelEditor';
import VisibilitySelector, { type VisibilityEntry } from '@/components/reels/VisibilitySelector';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export default function ReelManagementPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const reelId = params.reelId as string;

  const [reel, setReel] = useState<ReelData | null>(null);
  const [visibility, setVisibility] = useState<VisibilityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Mock data for available options
  const [availableClasses] = useState([
    { id: 'class-1', name: 'Class 1' },
    { id: 'class-2', name: 'Class 2' },
    { id: 'class-3', name: 'Class 3' },
  ]);

  const [availableGradeLevels] = useState([
    { id: 'grade-1', name: 'Grade 1' },
    { id: 'grade-2', name: 'Grade 2' },
    { id: 'grade-3', name: 'Grade 3' },
  ]);

  const [availableGroups] = useState([
    { id: 'group-1', name: 'Group A' },
    { id: 'group-2', name: 'Group B' },
    { id: 'group-3', name: 'Group C' },
  ]);

  useEffect(() => {
    fetchReelData();
    fetchVisibility();
  }, [reelId]);

  const fetchReelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reels/${reelId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reel');
      }

      const data = await response.json();
      setReel(data.data);
    } catch (err) {
      console.error('[ReelManagement] Error fetching reel:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reel');
    } finally {
      setLoading(false);
    }
  };

  const fetchVisibility = async () => {
    try {
      const response = await fetch(`/api/reels/${reelId}/visibility`);
      if (!response.ok) {
        throw new Error('Failed to fetch visibility');
      }

      const data = await response.json();
      setVisibility(data.visibility || []);
    } catch (err) {
      console.error('[ReelManagement] Error fetching visibility:', err);
    }
  };

  const handleSaveReel = async (updatedReel: Partial<ReelData>) => {
    try {
      setIsSaving(true);
      setActionError(null);

      const response = await fetch(`/api/reels/${reelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReel),
      });

      if (!response.ok) {
        throw new Error('Failed to save reel');
      }

      const data = await response.json();
      setReel(data.data);
      setIsEditing(false);
    } catch (err) {
      console.error('[ReelManagement] Error saving reel:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to save reel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveVisibility = async (newVisibility: VisibilityEntry[]) => {
    try {
      setActionError(null);

      const response = await fetch(`/api/reels/${reelId}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visibility: newVisibility }),
      });

      if (!response.ok) {
        throw new Error('Failed to save visibility');
      }

      setVisibility(newVisibility);
    } catch (err) {
      console.error('[ReelManagement] Error saving visibility:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to save visibility');
    }
  };

  const handlePublish = async () => {
    try {
      setActionError(null);

      const response = await fetch(`/api/reels/${reelId}/publish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to publish reel');
      }

      // Refresh reel data
      await fetchReelData();
    } catch (err) {
      console.error('[ReelManagement] Error publishing reel:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to publish reel');
    }
  };

  const handleUnpublish = async () => {
    try {
      setActionError(null);

      const response = await fetch(`/api/reels/${reelId}/unpublish`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unpublish reel');
      }

      // Refresh reel data
      await fetchReelData();
    } catch (err) {
      console.error('[ReelManagement] Error unpublishing reel:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to unpublish reel');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this reel? This action cannot be undone.')) {
      return;
    }

    try {
      setActionError(null);

      const response = await fetch(`/api/reels/${reelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete reel');
      }

      router.push(withLocalePrefix('/teacher/reels', locale));
    } catch (err) {
      console.error('[ReelManagement] Error deleting reel:', err);
      setActionError(err instanceof Error ? err.message : 'Failed to delete reel');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-600">Loading reel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800 mb-4">{error}</p>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reel) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="back-button"
          >
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
                d="M15 19l-7-7 7 7M15 5l-7-7 7 7"
              />
            </svg>
            Back to Library
          </button>
          <h1 className="page-title">Manage Reel</h1>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{actionError}</p>
          </div>
        )}

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`status-badge status-${reel.status}`}>
            {reel.status.replace('_', ' ').toUpperCase()}
          </span>
        </div>

        {/* Reel Editor */}
        <div className="mb-8">
          <div className="section-header">
            <h2 className="section-title">Reel Details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="edit-button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-7l7 7 7-7V6z"
                  />
                </svg>
                Edit
              </button>
            )}
          </div>
          {isEditing ? (
            <ReelEditor
              reel={reel}
              onSave={handleSaveReel}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="reel-display">
              <video
                className="reel-video"
                src={reel.video_url}
                poster={reel.thumbnail_url}
                controls
              />
              <div className="reel-info">
                <h3 className="reel-title">{reel.title_en}</h3>
                <p className="reel-description">{reel.description_en}</p>
                <div className="reel-meta">
                  <span className="meta-item">
                    Duration: {Math.floor(reel.duration_seconds / 60)}:
                    {(reel.duration_seconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Visibility Selector */}
        <div className="mb-8">
          <div className="section-header">
            <h2 className="section-title">Visibility Settings</h2>
          </div>
          <VisibilitySelector
            value={visibility}
            onChange={handleSaveVisibility}
            availableClasses={availableClasses}
            availableGradeLevels={availableGradeLevels}
            availableGroups={availableGroups}
          />
          {visibility.length === 0 && (
            <p className="visibility-warning">
              ⚠️ No visibility rules set. This reel will not be visible to students.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="actions-bar">
          {reel.status === 'published' ? (
            <button
              onClick={handleUnpublish}
              disabled={isSaving}
              className="action-button unpublish-button"
            >
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
                  d="M18.364 18.364L21 21M12 21l-3-3m0 0l-3 3m3-3l3 3M12 3v18"
                />
              </svg>
              Unpublish
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isSaving || visibility.length === 0}
              className="action-button publish-button"
            >
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
                  d="M5 13l4 4L19 7M7 10l5 5 5-5M12 19V5"
                />
              </svg>
              Publish Reel
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={isSaving}
            className="action-button delete-button"
          >
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
                d="M19 7l-.867 12.142A2 2 0 011.138 2H15.5m-4.5 0a1 1 0 00-1 1v4a1 1 0 001 1h4.5a1 1 0 001-1v-4a1 1 0 00-1-1h-4.5a2 2 0 01-1.138-2zM12 13l-4 4 4-4m0-4l4 4m0-4l-4 4"
              />
            </svg>
            Delete Reel
          </button>
        </div>
      </div>

      <style jsx>{`
        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 24px;
        }

        .back-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: white;
          color: #374151;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background: #f9fafb;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 13px;
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

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .edit-button {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .edit-button:hover {
          background: #2563eb;
        }

        .reel-display {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .reel-video {
          width: 100%;
          max-width: 400px;
          aspect-ratio: 9/16;
          border-radius: 12px;
        }

        .reel-info {
          padding: 16px;
          background: #f9fafb;
          border-radius: 8px;
        }

        .reel-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .reel-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 12px;
        }

        .reel-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #6b7280;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .visibility-warning {
          padding: 12px;
          background: #fef3c7;
          border: 1px solid #fde68a;
          border-radius: 6px;
          font-size: 14px;
          color: #d97706;
        }

        .actions-bar {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
        }

        .action-button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .publish-button {
          background: #10b981;
          color: white;
        }

        .publish-button:hover:not(:disabled) {
          background: #059669;
        }

        .unpublish-button {
          background: #f59e0b;
          color: white;
        }

        .unpublish-button:hover:not(:disabled) {
          background: #d97706;
        }

        .delete-button {
          background: #dc2626;
          color: white;
        }

        .delete-button:hover:not(:disabled) {
          background: #b91c1c;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 640px) {
          .actions-bar {
            flex-direction: column;
          }

          .action-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
