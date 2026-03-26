'use client';

/**
 * Lesson Detail Page Component
 * 
 * Main container for lesson details with sub-tabs for:
 * - Info section
 * - Materials section
 * - Attendance section (Phase 5)
 * - Homework section (Phase 7)
 * - Quiz section (Phase 7)
 * - Exam section (Phase 7)
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import LessonLifecycleBar from './LessonLifecycleBar';
import LessonInfoSection from './LessonInfoSection';
import LessonMaterialsSection from './LessonMaterialsSection';
import { AttendanceRoster } from './AttendanceRoster';

// Lazy load homework, quiz, and exam sections
const LessonHomeworkSection = lazy(() => import('./LessonHomeworkSection'));
const LessonQuizSection = lazy(() => import('./LessonQuizSection'));
const LessonExamSection = lazy(() => import('./LessonExamSection'));

export interface LessonDetailPageProps {
  lessonId: string;
  courseId: string;
  initialTab?: 'info' | 'materials' | 'attendance' | 'homework' | 'quiz' | 'exam';
}

type LessonTab = 'info' | 'materials' | 'attendance' | 'homework' | 'quiz' | 'exam';

export default function LessonDetailPage({
  lessonId,
  courseId,
  initialTab = 'info',
}: LessonDetailPageProps) {
  const [activeTab, setActiveTab] = useState<LessonTab>(initialTab);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const loadLesson = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch lesson');
        }
        const data = await response.json();
        setLesson(data.lesson);
      } catch (err) {
        console.error('Error loading lesson:', err);
        setError('Failed to load lesson');
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [lessonId]);

  // Fetch current user info for role-based rendering
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.user?.role || '');
          setUserId(data.user?.id || '');
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleTabChange = (tab: LessonTab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="lesson-detail-page loading">
        <div className="spinner" aria-hidden="true" />
        <p>Loading lesson details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-detail-page error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="lesson-detail-page empty">
        <p>Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="lesson-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href={`/teacher/courses/${courseId}`}>Course</a>
          </li>
          <li aria-current="page">Lesson Details</li>
        </ol>
      </nav>

      {/* Lesson Lifecycle Bar */}
      <LessonLifecycleBar lesson={lesson} onTabChange={handleTabChange} activeTab={activeTab} />

      {/* Tab Content */}
      <div className="lesson-tabs">
        {activeTab === 'info' && (
          <div role="tabpanel" id="tabpanel-info" aria-labelledby="tab-info" className="tab-panel">
            <LessonInfoSection lesson={lesson} />
          </div>
        )}

        {activeTab === 'materials' && (
          <div role="tabpanel" id="tabpanel-materials" aria-labelledby="tab-materials" className="tab-panel">
            <LessonMaterialsSection lessonId={lessonId} />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div role="tabpanel" id="tabpanel-attendance" aria-labelledby="tab-attendance" className="tab-panel">
            <AttendanceRoster lessonId={lessonId} />
          </div>
        )}

        {activeTab === 'homework' && (
          <div role="tabpanel" id="tabpanel-homework" aria-labelledby="tab-homework" className="tab-panel">
            <Suspense fallback={<div className="p-6">Loading homework...</div>}>
              <LessonHomeworkSection
                lessonId={lessonId}
                userRole={userRole}
                userId={userId}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'quiz' && (
          <div role="tabpanel" id="tabpanel-quiz" aria-labelledby="tab-quiz" className="tab-panel">
            <Suspense fallback={<div className="p-6">Loading quizzes...</div>}>
              <LessonQuizSection
                lessonId={lessonId}
                userRole={userRole}
                userId={userId}
              />
            </Suspense>
          </div>
        )}

        {activeTab === 'exam' && (
          <div role="tabpanel" id="tabpanel-exam" aria-labelledby="tab-exam" className="tab-panel">
            <Suspense fallback={<div className="p-6">Loading exams...</div>}>
              <LessonExamSection
                lessonId={lessonId}
                userRole={userRole}
                userId={userId}
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
