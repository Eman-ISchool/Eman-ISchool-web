'use client';

/**
 * Grade Courses Tab Component
 * 
 * Displays all courses for a grade with:
 * - Course list with thumbnails
 * - Teacher assignments
 * - Student counts
 * - Published status
 * - Price and currency
 * - Create new course button (admin only)
 */

import React, { useState, useEffect, memo } from 'react';
import { useLocale } from 'next-intl';

export interface GradeCoursesTabProps {
  gradeId: string;
  userRole?: string;
  data?: any;
  onLoad: (data: any) => void;
  onError: () => void;
  onLoadingStart: () => void;
  onLoadingEnd: () => void;
}

const GradeCoursesTab = memo<GradeCoursesTabProps>(({
  gradeId,
  userRole,
  data,
  onLoad,
  onError,
  onLoadingStart,
  onLoadingEnd,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [courses, setCourses] = useState<any[]>(data?.courses || []);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const isSupervisor = userRole === 'supervisor';
  const isAdmin = userRole === 'admin';

  useEffect(() => {
    if (data) {
      setCourses(data.courses);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const loadCourses = async () => {
      if (data) return; // Use cached data if available

      onLoadingStart();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/grades/${gradeId}/courses`);
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        const coursesData = await response.json();
        setCourses(coursesData.courses);
        onLoad(coursesData);
      } catch (err) {
        console.error('Error loading courses:', err);
        setError('Failed to load courses');
        onError();
      } finally {
        setLoading(false);
        onLoadingEnd();
      }
    };

    loadCourses();
  }, [gradeId, data, onLoad, onError, onLoadingStart, onLoadingEnd]);

  const filteredCourses = courses.filter(course => {
    // Apply status filter
    if (filter === 'published' && !course.is_published) return false;
    if (filter === 'draft' && course.is_published) return false;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        course.title.toLowerCase().includes(searchLower) ||
        (course.subject && course.subject.toLowerCase().includes(searchLower)) ||
        (course.description && course.description.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const handleCreateCourse = () => {
    // TODO: Navigate to course creation page
    window.location.href = `/admin/courses/new?grade_id=${gradeId}`;
  };

  const handleViewCourse = (courseId: string) => {
    window.location.href = `/admin/courses/${courseId}`;
  };

  const handleEditCourse = (course: any) => {
    setEditFormData({
      title: course.title || '',
      description: course.description || '',
      image_url: course.image_url || '',
      thumbnail_url: course.thumbnail_url || '',
      price: course.price || 0,
      duration_hours: course.duration_hours || 0,
      max_students: course.max_students || 30,
      teacher_id: course.teacher_id || '',
    });
    setEditingCourse(course);
  };

  const handleSaveEdit = async () => {
    try {
      // For supervisors, exclude teacher_id from update
      const updateData = isSupervisor
        ? {
            title: editFormData.title,
            description: editFormData.description,
            image_url: editFormData.image_url,
            thumbnail_url: editFormData.thumbnail_url,
            price: editFormData.price,
            duration_hours: editFormData.duration_hours,
            max_students: editFormData.max_students,
          }
        : editFormData;

      const response = await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const updatedData = await response.json();
      setCourses(courses.map(c => c.id === editingCourse.id ? updatedData.course : c));
      setEditingCourse(null);
    } catch (err) {
      console.error('Error updating course:', err);
      setError('Failed to update course');
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditFormData({});
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="grade-courses-tab loading">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grade-courses-tab error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
      </div>
    );
  }

  return (
    <div className="grade-courses-tab">
      <div className="courses-header">
        <h2>{isArabic ? `المواد (${filteredCourses.length})` : `Courses (${filteredCourses.length})`}</h2>
        <div className="courses-actions">
          <input
            type="text"
            placeholder={isArabic ? 'بحث المواد...' : 'Search courses...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search courses"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter courses by status"
          >
            <option value="all">{isArabic ? 'جميع المواد' : 'All Courses'}</option>
            <option value="published">{isArabic ? 'منشور' : 'Published'}</option>
            <option value="draft">{isArabic ? 'مسودة' : 'Draft'}</option>
          </select>
          {/* Create Course button - hidden for supervisors */}
          {!isSupervisor && (
            <button onClick={handleCreateCourse} className="btn-primary">
              {isArabic ? '+ إنشاء مادة' : '+ Create Course'}
            </button>
          )}
          {/* Supervisor sees disabled button with tooltip */}
          {isSupervisor && (
            <button
              onClick={handleCreateCourse}
              className="btn-primary disabled"
              disabled
              title={isArabic ? 'إنشاء المادة يتطلب صلاحية المسؤول' : 'Course creation requires admin access'}
              aria-label={isArabic ? 'إنشاء المادة يتطلب صلاحية المسؤول' : 'Course creation requires admin access'}
            >
              {isArabic ? '+ إنشاء مادة' : '+ Create Course'}
            </button>
          )}
        </div>
      </div>

      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <p>{isArabic ? 'لم يتم العثور على مواد.' : 'No courses found.'}</p>
          {!isSupervisor && (
            <button onClick={handleCreateCourse} className="btn-primary">
              {isArabic ? 'إنشاء أول مادة' : 'Create First Course'}
            </button>
          )}
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map(course => (
            <div key={course.id} className="course-card">
              <div className="course-thumbnail">
                {course.thumbnail_url || course.image_url ? (
                  <img
                    src={course.thumbnail_url || course.image_url}
                    alt={course.title}
                  />
                ) : (
                  <div className="course-placeholder">
                    <span>📚</span>
                  </div>
                )}
                <span className={`course-status ${course.is_published ? 'published' : 'draft'}`}>
                  {course.is_published ? (isArabic ? 'منشور' : 'Published') : (isArabic ? 'مسودة' : 'Draft')}
                </span>
              </div>

              <div className="course-info">
                <h3>{course.title}</h3>
                {course.subject && (
                  <p className="course-subject">{course.subject}</p>
                )}
                {course.description && (
                  <p className="course-description">
                    {course.description.substring(0, 100)}
                    {course.description.length > 100 && '...'}
                  </p>
                )}

                <div className="course-meta">
                  <div className="meta-item">
                    <span className="meta-label">{isArabic ? 'السعر:' : 'Price:'}</span>
                    <span className="meta-value">
                      {course.price} {course.currency}
                    </span>
                  </div>

                  {course.teacher_id && (
                    <div className="meta-item">
                      <span className="meta-label">{isArabic ? 'المعلم:' : 'Teacher:'}</span>
                      <span className="meta-value">{isArabic ? 'معيّن' : 'Assigned'}</span>
                    </div>
                  )}

                  <div className="meta-item">
                    <span className="meta-label">{isArabic ? 'الطلاب:' : 'Students:'}</span>
                    <span className="meta-value">
                      {course.enrollments?.count || '-'}
                    </span>
                  </div>
                </div>

                <div className="course-actions">
                  <button
                    onClick={() => handleViewCourse(course.id)}
                    className="btn-secondary"
                  >
                    {isArabic ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                  {/* Edit button - visible for admin and supervisor */}
                  {(isAdmin || isSupervisor) && (
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="btn-secondary"
                    >
                      {isArabic ? 'تعديل' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{isArabic ? 'تعديل المادة' : 'Edit Course'}</h2>
              <button onClick={handleCancelEdit} className="btn-close" aria-label="Close modal">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="edit-title">{isArabic ? 'العنوان *' : 'Title *'}</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">{isArabic ? 'الوصف' : 'Description'}</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-image_url">{isArabic ? 'رابط الصورة' : 'Image URL'}</label>
                <input
                  type="url"
                  id="edit-image_url"
                  name="image_url"
                  value={editFormData.image_url}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-thumbnail_url">{isArabic ? 'رابط الصورة المصغرة' : 'Thumbnail URL'}</label>
                <input
                  type="url"
                  id="edit-thumbnail_url"
                  name="thumbnail_url"
                  value={editFormData.thumbnail_url}
                  onChange={handleEditInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-price">{isArabic ? 'السعر' : 'Price'}</label>
                <input
                  type="number"
                  id="edit-price"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-duration_hours">{isArabic ? 'المدة (ساعات)' : 'Duration (hours)'}</label>
                <input
                  type="number"
                  id="edit-duration_hours"
                  name="duration_hours"
                  value={editFormData.duration_hours}
                  onChange={handleEditInputChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="edit-max_students">{isArabic ? 'الحد الأقصى للطلاب' : 'Max Students'}</label>
                <input
                  type="number"
                  id="edit-max_students"
                  name="max_students"
                  value={editFormData.max_students}
                  onChange={handleEditInputChange}
                  min="1"
                />
              </div>

              {/* Teacher selector - only for admin */}
              {!isSupervisor && (
                <div className="form-group">
                  <label htmlFor="edit-teacher_id">{isArabic ? 'المعلم' : 'Teacher'}</label>
                  <select
                    id="edit-teacher_id"
                    name="teacher_id"
                    value={editFormData.teacher_id}
                    onChange={handleEditInputChange}
                  >
                    <option value="">{isArabic ? 'غير معيّن' : 'Unassigned'}</option>
                    {/* TODO: Load teacher options */}
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={handleCancelEdit} className="btn-secondary">
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button type="button" onClick={handleSaveEdit} className="btn-primary">
                {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GradeCoursesTab.displayName = 'GradeCoursesTab';

export default GradeCoursesTab;
