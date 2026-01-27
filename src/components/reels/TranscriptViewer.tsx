'use client';

import React, { useState, useCallback, useMemo } from 'react';

interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

interface TranscriptViewerProps {
  transcript?: {
    text: string;
    segments: TranscriptSegment[];
    language: string;
    confidence: number;
    wordCount: number;
    isManual: boolean;
  };
  onEdit?: (updatedTranscript: any) => void;
  readOnly?: boolean;
  className?: string;
}

export default function TranscriptViewer({
  transcript,
  onEdit,
  readOnly = false,
  className = '',
}: TranscriptViewerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Format timestamp
  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Filter segments by search
  const filteredSegments = useMemo(() => {
    if (!searchQuery) {
      return transcript?.segments || [];
    }
    
    const query = searchQuery.toLowerCase();
    return (transcript?.segments || []).filter(
      segment => segment.text.toLowerCase().includes(query)
    );
  }, [transcript, searchQuery]);

  // Handle segment click
  const handleSegmentClick = useCallback((segment: TranscriptSegment) => {
    setSelectedSegment(segment.start);
  }, []);

  // Handle edit mode toggle
  const toggleEditMode = useCallback(() => {
    if (readOnly) return;
    setIsEditing(!isEditing);
    setEditedText(transcript?.text || '');
    setSelectedSegment(null);
  }, [isEditing, readOnly, transcript]);

  // Handle save edit
  const handleSaveEdit = useCallback(() => {
    if (!editedText.trim()) {
      return;
    }

    onEdit?.({
      ...transcript,
      text: editedText,
      isManual: true,
    });

    setIsEditing(false);
    setEditedText('');
  }, [editedText, transcript, onEdit]);

  // Handle cancel edit
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedText('');
  }, []);

  // Calculate word count
  const wordCount = editedText.split(/\s+/).filter(Boolean).length;

  // Calculate confidence color
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.9) return '#10b981';
    if (confidence >= 0.7) return '#f59e0b';
    return '#f59e0b';
  };

  return (
    <div className={`transcript-viewer ${className}`}>
      <div className="transcript-header">
        <h3 className="transcript-title">Transcript</h3>
        
        {!isEditing && (
          <div className="transcript-meta">
            <div className="meta-item">
              <span className="meta-label">Language:</span>
              <span className="meta-value">{transcript?.language || 'Unknown'}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Words:</span>
              <span className="meta-value">{transcript?.wordCount || 0}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Confidence:</span>
              <span
                className="meta-value"
                style={{ color: getConfidenceColor(transcript?.confidence || 0) }}
              >
                {(transcript?.confidence || 0).toFixed(2)}
              </span>
            </div>
            {transcript?.isManual && (
              <div className="meta-item manual-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M11 5H6a2 2 0 011-2 0 0 0v-2a2 2 0 01-4 0-2 2 0 01 4 0 0 0zm-9 9h.01M11 9a2 2 0 0112 2 0 0a2 2 0 01-4 2 0 0 0zm-9 9h.01"
                    fill="currentColor"
                  />
                </svg>
                <span>Manual</span>
              </div>
            )}
            {!readOnly && (
              <button className="edit-button" onClick={toggleEditMode}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M11 4H4a2 2 0 011-2 0 0 0v-2a2 2 0 01-4 0-2 2 0 0zm-9 9h.01M11 9a2 2 0 0112 2 0 0a2 2 0 01-4 2 0 0zm-9 9h.01"
                    fill="currentColor"
                  />
                </svg>
                Edit
              </button>
            )}
          </div>
        )}

        {isEditing && (
          <div className="edit-mode">
            <div className="edit-header">
              <h4 className="edit-title">Edit Transcript</h4>
              <div className="edit-meta">
                <span className="word-count">{wordCount} words</span>
                <button className="cancel-edit" onClick={handleCancelEdit}>
                  Cancel
                </button>
                <button
                  className="save-edit"
                  onClick={handleSaveEdit}
                  disabled={!editedText.trim()}
                >
                  Save
                </button>
              </div>
            </div>
            <textarea
              className="transcript-textarea"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              placeholder="Edit the transcript text here..."
            />
          </div>
        )}
      </div>

      <div className="search-bar">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m-9 0a2 2 0 011-2 0 0 0v-2a2 2 0 01-4 0-2 2 0 0zm-9 9h.01M11 9a2 2 0 0112 2 0 0a2 2 0 01-4 2 0 0zm-9 9h.01"
          />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Search transcript..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="transcript-segments">
        {filteredSegments.map((segment, index) => (
          <div
            key={index}
            className={`segment-item ${selectedSegment === segment.start ? 'selected' : ''}`}
            onClick={() => handleSegmentClick(segment)}
          >
            <div className="segment-timestamp">
              {formatTimestamp(segment.start)}
            </div>
            <div className="segment-content">
              <div className="segment-text">{segment.text}</div>
              <div className="segment-confidence">
                <span
                  className="confidence-dot"
                  style={{ backgroundColor: getConfidenceColor(segment.confidence) }}
                />
                <span className="confidence-value">
                  {(segment.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .transcript-viewer {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .transcript-header {
          margin-bottom: 24px;
        }
        .transcript-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }
        .transcript-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          align-items: center;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        .meta-label {
          color: #6b7280;
          font-weight: 500;
        }
        .meta-value {
          color: #1f2937;
          font-weight: 500;
        }
        .manual-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background-color: #eff6ff;
          border-radius: 4px;
          font-size: 12px;
          color: #3b82f6;
        }
        .edit-button {
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .edit-button:hover {
          background-color: #2563eb;
        }
        .edit-mode {
          margin-bottom: 24px;
          padding: 16px;
          background-color: #f9fafb;
          border-radius: 6px;
        }
        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .edit-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }
        .edit-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .word-count {
          font-size: 13px;
          color: #6b7280;
        }
        .cancel-edit {
          padding: 8px 16px;
          background-color: white;
          color: #6b7280;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .cancel-edit:hover {
          background-color: #f3f4f6;
        }
        .save-edit {
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
        }
        .save-edit:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }
        .transcript-textarea {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          font-family: inherit;
        }
        .transcript-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
          margin-bottom: 24px;
        }
        .search-input {
          flex: 1;
          padding: 10px 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
        }
        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
        }
        .transcript-segments {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
        }
        .segment-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .segment-item:hover {
          background-color: #f3f4f6;
        }
        .segment-item.selected {
          background-color: #eff6ff;
          border-left: 3px solid #3b82f6;
        }
        .segment-timestamp {
          flex-shrink: 0;
          font-family: monospace;
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
        }
        .segment-content {
          flex: 1;
        }
        .segment-text {
          font-size: 14px;
          color: #1f2937;
          line-height: 1.5;
        }
        .segment-confidence {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
        }
        .confidence-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .confidence-value {
          color: #6b7280;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
