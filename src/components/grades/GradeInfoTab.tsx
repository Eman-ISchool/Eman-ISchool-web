'use client';

/**
 * Grade Info Tab Component
 * 
 * Displays grade information including:
 * - Name and English name
 * - Supervisor assignment
 * - Description
 * - Image
 * - Active status
 * - Sort order
 */

import React, { useState, useEffect, memo } from 'react';

export interface GradeInfoTabProps {
  gradeId: string;
  userRole?: string;
  supervisorId?: string;
  data?: any;
  onLoad: (data: any) => void;
  onError: () => void;
  onLoadingStart: () => void;
  onLoadingEnd: () => void;
}

const GradeInfoTab = memo<GradeInfoTabProps>(({
  gradeId,
  userRole,
  supervisorId,
  data,
  onLoad,
  onError,
  onLoadingStart,
  onLoadingEnd,
}) => {
  const [grade, setGrade] = useState<any>(data?.grade || null);
  const [supervisor, setSupervisor] = useState<any>(data?.supervisor || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const isSupervisor = userRole === 'supervisor';

  useEffect(() => {
    if (data) {
      setGrade(data.grade);
      setSupervisor(data.supervisor);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const loadGradeInfo = async () => {
      if (data) return; // Use cached data if available

      onLoadingStart();
      setLoading(true);
      setError(null);

      try {
        // Fetch grade details
        const gradeResponse = await fetch(`/api/grades/${gradeId}`);
        if (!gradeResponse.ok) {
          throw new Error('Failed to fetch grade');
        }
        const gradeData = await gradeResponse.json();

        // Fetch supervisor if assigned
        let supervisorData = null;
        if (gradeData.grade?.supervisor_id) {
          const supervisorResponse = await fetch(`/api/users/${gradeData.grade.supervisor_id}`);
          if (supervisorResponse.ok) {
            supervisorData = await supervisorResponse.json();
          }
        }

        setGrade(gradeData.grade);
        setSupervisor(supervisorData?.user);
        onLoad({ grade: gradeData.grade, supervisor: supervisorData?.user });
      } catch (err) {
        console.error('Error loading grade info:', err);
        setError('Failed to load grade information');
        onError();
      } finally {
        setLoading(false);
        onLoadingEnd();
      }
    };

    loadGradeInfo();
  }, [gradeId, data, onLoad, onError, onLoadingStart, onLoadingEnd]);

  const handleEdit = () => {
    setFormData({
      name: grade?.name || '',
      name_en: grade?.name_en || '',
      description: grade?.description || '',
      supervisor_id: grade?.supervisor_id || '',
      image_url: grade?.image_url || '',
      is_active: grade?.is_active ?? true,
      sort_order: grade?.sort_order || 0,
    });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormData({});
  };

  const handleSave = async () => {
    try {
      // For supervisors, exclude supervisor_id from the update
      const updateData = isSupervisor 
        ? {
            name: formData.name,
            name_en: formData.name_en,
            description: formData.description,
            image_url: formData.image_url,
          }
        : formData;

      const response = await fetch(`/api/grades/${gradeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update grade');
      }

      const updatedData = await response.json();
      setGrade(updatedData.grade);
      setEditing(false);
      onLoad({ grade: updatedData.grade, supervisor });
    } catch (err) {
      console.error('Error updating grade:', err);
      setError('Failed to update grade');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <div className="grade-info-tab loading">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grade-info-tab error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!grade) {
    return <div className="grade-info-tab empty">Grade not found</div>;
  }

  return (
    <div className="grade-info-tab">
      {editing ? (
        <div className="grade-info-edit">
          <h2>Edit Grade Information</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name_en">English Name</label>
              <input
                type="text"
                id="name_en"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Supervisor selector - hidden for supervisors */}
            {!isSupervisor && (
              <div className="form-group">
                <label htmlFor="supervisor_id">Supervisor</label>
                <select
                  id="supervisor_id"
                  name="supervisor_id"
                  value={formData.supervisor_id}
                  onChange={handleInputChange}
                >
                  <option value="">No Supervisor</option>
                  {/* TODO: Load supervisor options */}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="image_url">Image URL</label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
              />
            </div>

            {/* Active status - disabled for supervisors */}
            <div className={`form-group checkbox ${isSupervisor ? 'disabled' : ''}`}>
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                disabled={isSupervisor}
                title={isSupervisor ? "Only admins can change this setting" : undefined}
              />
              <label htmlFor="is_active" title={isSupervisor ? "Only admins can change this setting" : undefined}>
                Active
              </label>
              {isSupervisor && (
                <span className="tooltip">Only admins can change this setting</span>
              )}
            </div>

            {/* Sort order - disabled for supervisors */}
            <div className={`form-group ${isSupervisor ? 'disabled' : ''}`}>
              <label htmlFor="sort_order">Sort Order</label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                disabled={isSupervisor}
                title={isSupervisor ? "Only admins can change this setting" : undefined}
              />
              {isSupervisor && (
                <span className="tooltip">Only admins can change this setting</span>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="grade-info-view">
          <div className="grade-header">
            {grade.image_url && (
              <img loading="lazy" decoding="async" src={grade.image_url} alt={grade.name} className="grade-image" />
            )}
            <div className="grade-title">
              <h1>{grade.name}</h1>
              {grade.name_en && <p className="grade-name-en">{grade.name_en}</p>}
              <span className={`grade-status ${grade.is_active ? 'active' : 'inactive'}`}>
                {grade.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button onClick={handleEdit} className="btn-edit" aria-label="Edit grade">
              ✏️
            </button>
          </div>

          {grade.description && (
            <div className="grade-description">
              <h3>Description</h3>
              <p>{grade.description}</p>
            </div>
          )}

          <div className="grade-details">
            <div className="detail-item">
              <span className="detail-label">Supervisor:</span>
              <span className="detail-value">
                {supervisor ? (
                  <a href={`/admin/users/${supervisor.id}`}>{supervisor.name}</a>
                ) : (
                  <em>Not assigned</em>
                )}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Sort Order:</span>
              <span className="detail-value">{grade.sort_order}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Grade ID:</span>
              <span className="detail-value">{grade.id}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Slug:</span>
              <span className="detail-value">{grade.slug}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GradeInfoTab.displayName = 'GradeInfoTab';

export default GradeInfoTab;
