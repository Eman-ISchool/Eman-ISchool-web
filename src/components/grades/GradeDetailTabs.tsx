'use client';

/**
 * Grade Detail Tabs Component
 * 
 * A 5-tab container for grade detail pages with lazy loading and caching.
 * 
 * Tabs:
 * 1. Info - Grade information, supervisor, description
 * 2. Courses - List of courses in this grade
 * 3. Schedule - Grade schedule calendar (Phase 8)
 * 4. Students - List of students with export functionality
 * 5. Fees - Fee structure and payment status
 * 
 * Features:
 * - Lazy loading: Each tab loads data only when first accessed
 * - Caching: Loaded data is cached in a useRef<Map> for session lifetime
 * - React.memo: Prevents unnecessary re-renders
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { useLocale } from 'next-intl';
import GradeInfoTab from './GradeInfoTab';
import GradeCoursesTab from './GradeCoursesTab';
import GradeStudentsTab from './GradeStudentsTab';
import GradeFeesTab from './GradeFeesTab';

export type GradeTab = 'info' | 'courses' | 'schedule' | 'students' | 'fees';

export interface GradeDetailTabsProps {
  gradeId: string;
  userRole?: string;
  supervisorId?: string;
  initialTab?: GradeTab;
  onTabChange?: (tab: GradeTab) => void;
}

export interface TabData {
  [key: string]: any;
}

const GradeDetailTabs = memo<GradeDetailTabsProps>(({
  gradeId,
  userRole,
  supervisorId,
  initialTab = 'info',
  onTabChange,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [activeTab, setActiveTab] = useState<GradeTab>(initialTab);
  const [loading, setLoading] = useState<GradeTab | null>(null);
  const [error, setError] = useState<GradeTab | null>(null);
  
  // Cache for loaded tab data (persists for session lifetime)
  const tabDataCache = useRef<Map<GradeTab, TabData>>(new Map());
  const loadedTabs = useRef<Set<GradeTab>>(new Set());

  // Update active tab when initialTab changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTabChange = (tab: GradeTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const tabs: { id: GradeTab; label: string; icon: string }[] = [
    { id: 'info', label: isArabic ? 'المعلومات' : 'Info', icon: 'ℹ️' },
    { id: 'courses', label: isArabic ? 'المواد' : 'Courses', icon: '📚' },
    { id: 'schedule', label: isArabic ? 'الجدول' : 'Schedule', icon: '📅' },
    { id: 'students', label: isArabic ? 'الطلاب' : 'Students', icon: '👥' },
    { id: 'fees', label: isArabic ? 'الرسوم' : 'Fees', icon: '💰' },
  ];

  return (
    <div className="grade-detail-tabs">
      {/* Tab Navigation */}
      <div className="tab-navigation" role="tablist" aria-label="Grade details">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabChange(tab.id)}
            aria-label={`View ${tab.label} for grade`}
          >
            <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <div
            role="tabpanel"
            id="tabpanel-info"
            aria-labelledby="tab-info"
            className="tab-panel"
          >
            <GradeInfoTab
              gradeId={gradeId}
              userRole={userRole}
              supervisorId={supervisorId}
              data={tabDataCache.current.get('info')}
              onLoad={(data) => {
                tabDataCache.current.set('info', data);
                loadedTabs.current.add('info');
              }}
              onError={() => setError('info')}
              onLoadingStart={() => setLoading('info')}
              onLoadingEnd={() => setLoading(null)}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <div
            role="tabpanel"
            id="tabpanel-courses"
            aria-labelledby="tab-courses"
            className="tab-panel"
          >
            <GradeCoursesTab
              gradeId={gradeId}
              userRole={userRole}
              data={tabDataCache.current.get('courses')}
              onLoad={(data) => {
                tabDataCache.current.set('courses', data);
                loadedTabs.current.add('courses');
              }}
              onError={() => setError('courses')}
              onLoadingStart={() => setLoading('courses')}
              onLoadingEnd={() => setLoading(null)}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div
            role="tabpanel"
            id="tabpanel-schedule"
            aria-labelledby="tab-schedule"
            className="tab-panel"
          >
            <div className="grade-schedule-tab">
              <p>{isArabic ? 'سيتم تنفيذ تقويم جدول الفصل في المرحلة 8.' : 'Grade schedule calendar will be implemented in Phase 8.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <div
            role="tabpanel"
            id="tabpanel-students"
            aria-labelledby="tab-students"
            className="tab-panel"
          >
            <GradeStudentsTab
              gradeId={gradeId}
              userRole={userRole}
              data={tabDataCache.current.get('students')}
              onLoad={(data) => {
                tabDataCache.current.set('students', data);
                loadedTabs.current.add('students');
              }}
              onError={() => setError('students')}
              onLoadingStart={() => setLoading('students')}
              onLoadingEnd={() => setLoading(null)}
            />
          </div>
        )}

        {activeTab === 'fees' && (
          <div
            role="tabpanel"
            id="tabpanel-fees"
            aria-labelledby="tab-fees"
            className="tab-panel"
          >
            <GradeFeesTab
              gradeId={gradeId}
              userRole={userRole}
              data={tabDataCache.current.get('fees')}
              onLoad={(data) => {
                tabDataCache.current.set('fees', data);
                loadedTabs.current.add('fees');
              }}
              onError={() => setError('fees')}
              onLoadingStart={() => setLoading('fees')}
              onLoadingEnd={() => setLoading(null)}
            />
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="tab-loading">
          <div className="spinner" aria-hidden="true" />
          <span>{isArabic ? `جاري تحميل ${loading}...` : `Loading ${loading}...`}</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="tab-error">
          <p>{isArabic ? `فشل تحميل ${error}. يرجى المحاولة مرة أخرى.` : `Failed to load ${error}. Please try again.`}</p>
          <button onClick={() => setError(null)}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
        </div>
      )}
    </div>
  );
});

GradeDetailTabs.displayName = 'GradeDetailTabs';

export default GradeDetailTabs;
