'use client';

/**
 * Lesson Lifecycle Bar Component
 * 
 * Displays lesson lifecycle with action buttons and tab navigation:
 * - Info tab
 * - Materials tab
 * - Attendance tab (Phase 5)
 * - Homework tab (Phase 7)
 * - Quiz tab (Phase 7)
 * - Exam tab (Phase 7)
 */

import React, { memo } from 'react';

export interface LessonLifecycleBarProps {
  lesson: any;
  onStart?: () => void;
  onEnd?: () => void;
  onCancel?: () => void;
  onTabChange?: (tab: 'info' | 'materials' | 'attendance' | 'homework' | 'quiz' | 'exam') => void;
  activeTab?: 'info' | 'materials' | 'attendance' | 'homework' | 'quiz' | 'exam';
}

const LessonLifecycleBar = memo<LessonLifecycleBarProps>(({
  lesson,
  onStart,
  onEnd,
  onCancel,
  onTabChange,
  activeTab = 'info',
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'blue';
      case 'live':
        return 'green';
      case 'completed':
        return 'gray';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'live':
        return 'Live';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const status = lesson?.status || 'scheduled';

  const handleTabClick = (tab: 'info' | 'materials' | 'attendance' | 'homework' | 'quiz' | 'exam') => {
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="lesson-lifecycle-bar">
      <div className="status-indicator">
        <span
          className={`status-dot ${getStatusColor(status)}`}
          aria-hidden="true"
        />
        <span className={`status-label ${getStatusColor(status)}`}>
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="lifecycle-actions">
        {status === 'scheduled' && (
          <>
            {onStart && (
              <button
                onClick={onStart}
                className="btn-start"
                aria-label="Start lesson"
              >
                ▶ Start
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="btn-cancel"
                aria-label="Cancel lesson"
              >
                ✕ Cancel
              </button>
            )}
          </>
        )}

        {status === 'live' && (
          <>
            {onEnd && (
              <button
                onClick={onEnd}
                className="btn-end"
                aria-label="End lesson"
              >
                ■ End
              </button>
            )}
          </>
        )}

        {(status === 'completed' || status === 'cancelled') && (
          <span className="view-only">
            {status === 'completed' && '✓ Completed'}
            {status === 'cancelled' && '✗ Cancelled'}
          </span>
        )}
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => handleTabClick('info')}
          aria-label="Info tab"
        >
          Info
        </button>
        <button
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => handleTabClick('materials')}
          aria-label="Materials tab"
        >
          Materials
        </button>
        <button
          className={`tab-button ${activeTab === 'attendance' ? 'active' : ''}`}
          onClick={() => handleTabClick('attendance')}
          aria-label="Attendance tab"
        >
          Attendance
        </button>
        <button
          className={`tab-button ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleTabClick('homework')}
          aria-label="Homework tab"
          disabled
        >
          Homework
        </button>
        <button
          className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => handleTabClick('quiz')}
          aria-label="Quiz tab"
          disabled
        >
          Quiz
        </button>
        <button
          className={`tab-button ${activeTab === 'exam' ? 'active' : ''}`}
          onClick={() => handleTabClick('exam')}
          aria-label="Exam tab"
          disabled
        >
          Exam
        </button>
      </div>
    </div>
  );
});

LessonLifecycleBar.displayName = 'LessonLifecycleBar';

export default LessonLifecycleBar;
