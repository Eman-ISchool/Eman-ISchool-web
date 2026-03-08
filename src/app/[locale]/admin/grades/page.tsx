'use client';

/**
 * Grades List Page
 * 
 * Lists all grades with links to grade detail pages.
 * Supports filtering by active status and supervisor.
 */

import React, { useState, useEffect } from 'react';

export default function GradesListPage({
  params,
}: {
  params: { locale: string };
}) {
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadGrades = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (filter !== 'all') {
          params.append('is_active', filter === 'active' ? 'true' : 'false');
        }

        const response = await fetch(`/api/grades?${params.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch grades');
        }
        const data = await response.json();
        setGrades(data.grades || []);
      } catch (err) {
        console.error('Error loading grades:', err);
        setError('Failed to load grades');
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [filter]);

  const filteredGrades = grades.filter(grade => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        grade.name.toLowerCase().includes(searchLower) ||
        (grade.name_en && grade.name_en.toLowerCase().includes(searchLower)) ||
        (grade.description && grade.description.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const handleCreateGrade = () => {
    // TODO: Navigate to grade creation page
    window.location.href = `/${params.locale}/admin/grades/new`;
  };

  const handleViewGrade = (gradeId: string) => {
    window.location.href = `/${params.locale}/admin/grades/${gradeId}`;
  };

  return (
    <div className="grades-list-page">
      <div className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <ol>
            <li>
              <a href={`/${params.locale}/admin`}>Admin</a>
            </li>
            <li aria-current="page">Grades</li>
          </ol>
        </nav>

        {/* Page Header */}
        <header className="page-header">
          <div className="header-content">
            <h1>Grades</h1>
            <p className="page-description">
              Manage grade levels, assign supervisors, and view grade details.
            </p>
          </div>
          <button onClick={handleCreateGrade} className="btn-primary">
            + Create Grade
          </button>
        </header>

        {/* Filters */}
        <div className="grades-filters">
          <input
            type="text"
            placeholder="Search grades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
            aria-label="Search grades"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter grades by status"
          >
            <option value="all">All Grades</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading grades...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredGrades.length === 0 && (
          <div className="empty-state">
            <p>No grades found.</p>
            <button onClick={handleCreateGrade} className="btn-primary">
              Create First Grade
            </button>
          </div>
        )}

        {/* Grades Grid */}
        {!loading && !error && filteredGrades.length > 0 && (
          <div className="grades-grid">
            {filteredGrades.map(grade => (
              <div key={grade.id} className="grade-card">
                {grade.image_url && (
                  <img
                    src={grade.image_url}
                    alt={grade.name}
                    className="grade-image"
                  />
                )}
                <div className="grade-content">
                  <h3>{grade.name}</h3>
                  {grade.name_en && (
                    <p className="grade-name-en">{grade.name_en}</p>
                  )}
                  {grade.description && (
                    <p className="grade-description">
                      {grade.description.substring(0, 100)}
                      {grade.description.length > 100 && '...'}
                    </p>
                  )}
                  <div className="grade-meta">
                    <span className={`status-badge ${grade.is_active ? 'active' : 'inactive'}`}>
                      {grade.is_active ? 'Active' : 'Inactive'}
                    </span>
                    {grade.supervisor_id && (
                      <span className="supervisor-badge">
                        Supervisor Assigned
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleViewGrade(grade.id)}
                    className="btn-secondary"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
