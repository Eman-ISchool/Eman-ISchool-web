'use client';

/**
 * Lesson Info Section Component
 * 
 * Displays lesson information:
 * - Title and description
 * - Date and time
 * - Recurrence information
 * - Meeting details
 */

import React, { memo } from 'react';
import { useMeetingHeartbeat } from '@/hooks/useMeetingHeartbeat';
import { JoinLessonButton } from './JoinLessonButton';

export interface LessonInfoSectionProps {
  lesson: any;
}

const LessonInfoSection = memo<LessonInfoSectionProps>(({ lesson }) => {
  const { joinMeeting, leaveMeeting, hasJoined } = useMeetingHeartbeat({
    lessonId: lesson?.id,
    enabled: !!lesson,
  });

  if (!lesson) {
    return <div className="lesson-info-section empty">No lesson data</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours === 0 && mins === 0) return '< 1 min';
    if (hours === 0) return `${mins} min`;
    if (hours === 1) return `${hours}h ${mins}m`;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="lesson-info-section">
      <h2 className="section-title">Lesson Information</h2>

      <div className="info-grid">
        <div className="info-item">
          <label>Title</label>
          <span className="info-value">{lesson.title || 'N/A'}</span>
        </div>

        <div className="info-item">
          <label>Description</label>
          <span className="info-value">
            {lesson.description || 'No description provided'}
          </span>
        </div>

        <div className="info-item">
          <label>Date & Time</label>
          <span className="info-value">
            {lesson.start_date_time && formatDate(lesson.start_date_time)}
            {lesson.end_date_time && ` - ${formatTime(lesson.end_date_time)}`}
            {lesson.duration && ` (${formatDuration(lesson.start_date_time, lesson.end_date_time)})`}
          </span>
        </div>

        {lesson.recurrence && (
          <div className="info-item">
            <label>Recurrence</label>
            <span className="info-value">{lesson.recurrence}</span>
          </div>
        )}

        {lesson.recurrence_end_date && (
          <div className="info-item">
            <label>Recurrence Ends</label>
            <span className="info-value">
              {formatDate(lesson.recurrence_end_date)}
            </span>
          </div>
        )}
      </div>

      <div className="meeting-details">
        <h3 className="subsection-title">Meeting Details</h3>

        {lesson.meet_link && (
          <div className="info-item mt-4 mb-4 flex items-center gap-3">
            <JoinLessonButton
              lessonId={lesson.id}
              isLive={lesson.status === 'scheduled' || lesson.status === 'live'}
              isJoined={hasJoined}
              onJoin={async () => {
                await joinMeeting();
                window.open(lesson.meet_link, '_blank');
              }}
              onLeave={async () => {
                await leaveMeeting();
              }}
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(lesson.meet_link);
                alert('Meeting link copied to clipboard!');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md font-medium text-sm transition-colors border border-gray-200"
            >
              Copy Link
            </button>
            {hasJoined && (
              <span className="ml-4 text-sm text-green-600 font-medium">
                ✅ Attendance tracked automatically
              </span>
            )}
          </div>
        )}

        {lesson.meeting_provider && (
          <div className="info-item">
            <label>Provider</label>
            <span className="info-value">{lesson.meeting_provider}</span>
          </div>
        )}

        {lesson.meeting_duration_min && (
          <div className="info-item">
            <label>Duration</label>
            <span className="info-value">{lesson.meeting_duration_min} minutes</span>
          </div>
        )}

        {lesson.meeting_title && (
          <div className="info-item">
            <label>Meeting Title</label>
            <span className="info-value">{lesson.meeting_title}</span>
          </div>
        )}
      </div>

      <div className="notes-details">
        <h3 className="subsection-title">Notes</h3>
        <div className="info-item">
          <label>Teacher Notes</label>
          <span className="info-value">
            {lesson.teacher_notes || 'No teacher notes'}
          </span>
        </div>
        {lesson.cancellation_reason && (
          <div className="info-item">
            <label>Cancellation Reason</label>
            <span className="info-value">
              {lesson.cancellation_reason}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

LessonInfoSection.displayName = 'LessonInfoSection';

export default LessonInfoSection;
