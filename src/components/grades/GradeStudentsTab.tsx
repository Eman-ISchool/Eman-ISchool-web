'use client';

/**
 * Grade Students Tab Component
 * 
 * Displays all students for a grade with:
 * - Student list with photos
 * - Enrollment status
 * - Course enrollments
 * - Export to CSV functionality
 * - Filter by enrollment status
 */

import React, { useState, useEffect, memo } from 'react';

export interface GradeStudentsTabProps {
  gradeId: string;
  data?: any;
  onLoad: (data: any) => void;
  onError: () => void;
  onLoadingStart: () => void;
  onLoadingEnd: () => void;
}

const GradeStudentsTab = memo<GradeStudentsTabProps>(({
  gradeId,
  data,
  onLoad,
  onError,
  onLoadingStart,
  onLoadingEnd,
}) => {
  const [students, setStudents] = useState<any[]>(data?.students || []);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (data) {
      setStudents(data.students);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const loadStudents = async () => {
      if (data) return; // Use cached data if available

      onLoadingStart();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/grades/${gradeId}/students`);
        if (!response.ok) {
          throw new Error('Failed to fetch students');
        }
        const studentsData = await response.json();
        setStudents(studentsData.students);
        onLoad(studentsData);
      } catch (err) {
        console.error('Error loading students:', err);
        setError('Failed to load students');
        onError();
      } finally {
        setLoading(false);
        onLoadingEnd();
      }
    };

    loadStudents();
  }, [gradeId, data, onLoad, onError, onLoadingStart, onLoadingEnd]);

  const filteredStudents = students.filter(student => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        (student.phone && student.phone.toLowerCase().includes(searchLower))
      );
    }

    return true;
  });

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/grades/${gradeId}/students?export=csv`);
      if (!response.ok) {
        throw new Error('Failed to export students');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-grade-${gradeId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting students:', err);
      setError('Failed to export students');
    } finally {
      setExporting(false);
    }
  };

  const handleViewStudent = (studentId: string) => {
    window.location.href = `/admin/students/${studentId}`;
  };

  if (loading) {
    return (
      <div className="grade-students-tab loading">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grade-students-tab error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="grade-students-tab">
      <div className="students-header">
        <h2>Students ({filteredStudents.length})</h2>
        <div className="students-actions">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search students"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter students by enrollment status"
          >
            <option value="all">All Students</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="dropped">Dropped</option>
          </select>
          <button
            onClick={handleExportCSV}
            disabled={exporting || filteredStudents.length === 0}
            className="btn-secondary"
            aria-label="Export students to CSV"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <p>No students found.</p>
        </div>
      ) : (
        <div className="students-list">
          {filteredStudents.map(student => (
            <div key={student.id} className="student-card">
              <div className="student-avatar">
                {student.image ? (
                  <img src={student.image} alt={student.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {student.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="student-info">
                <h3>{student.name}</h3>
                <p className="student-email">{student.email}</p>
                {student.phone && (
                  <p className="student-phone">{student.phone}</p>
                )}

                <div className="student-stats">
                  <div className="stat-item">
                    <span className="stat-label">Enrollments:</span>
                    <span className="stat-value">{student.enrollment_count}</span>
                  </div>
                </div>

                {student.courses && student.courses.length > 0 && (
                  <div className="student-courses">
                    <span className="courses-label">Courses:</span>
                    <div className="courses-list">
                      {student.courses.slice(0, 3).map((course: any) => (
                        <span key={course.id} className="course-tag">
                          {course.title}
                        </span>
                      ))}
                      {student.courses.length > 3 && (
                        <span className="course-tag more">
                          +{student.courses.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="student-actions">
                <button
                  onClick={() => handleViewStudent(student.id)}
                  className="btn-secondary"
                  aria-label={`View details for ${student.name}`}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

GradeStudentsTab.displayName = 'GradeStudentsTab';

export default GradeStudentsTab;
