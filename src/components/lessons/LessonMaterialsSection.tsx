'use client';

/**
 * Lesson Materials Section Component
 * 
 * Displays all materials for a lesson with:
 * - List view
 * - Add material button
 * - Material type icons
 */

import React, { useState, useEffect, memo } from 'react';

export interface Material {
  id: string;
  title: string;
  type: 'file' | 'link' | 'book' | 'image' | 'video';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_mime_type?: string;
  external_url?: string;
  uploaded_by_user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  uploaded_at: string;
}

export interface LessonMaterialsSectionProps {
  lessonId: string;
  onMaterialAdded?: (material: Material) => void;
}

const LessonMaterialsSection = memo<LessonMaterialsSectionProps>(({ lessonId, onMaterialAdded }) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const response = await fetch(`/api/lessons/${lessonId}/materials`);
        if (!response.ok) {
          throw new Error('Failed to fetch materials');
        }
        const data = await response.json();
        setMaterials(data.materials || []);
      } catch (err) {
        console.error('Error loading materials:', err);
        setError('Failed to load materials');
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [lessonId]);

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'file':
        return '📄';
      case 'link':
        return '🔗';
      case 'book':
        return '📚';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      default:
        return '📎';
    }
  };

  const getMaterialTypeLabel = (type: string) => {
    switch (type) {
      case 'file':
        return 'File';
      case 'link':
        return 'Link';
      case 'book':
        return 'Book';
      case 'image':
        return 'Image';
      case 'video':
        return 'Video';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="lesson-materials-section loading">
        <div className="spinner" aria-hidden="true" />
        <p>Loading materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="lesson-materials-section error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="lesson-materials-section">
      <div className="section-header">
        <h2 className="section-title">Lesson Materials</h2>
        {onMaterialAdded && (
          <button
            onClick={() => {
              // TODO: Open add material modal
              console.log('Add material button clicked');
            }}
            className="btn-add-material"
            aria-label="Add material to lesson"
          >
            + Add Material
          </button>
        )}
      </div>

      {materials.length === 0 ? (
        <div className="empty-state">
          <p>No materials yet.</p>
        </div>
      ) : (
        <div className="materials-list">
          {materials.map((material) => (
            <div key={material.id} className="material-card">
              <div className="material-header">
                <span className="material-icon" aria-hidden="true">
                  {getMaterialIcon(material.type)}
                </span>
                <h3 className="material-title">{material.title}</h3>
                <span className="material-type-badge">
                  {getMaterialTypeLabel(material.type)}
                </span>
              </div>

              <div className="material-meta">
                {material.uploaded_by_user && (
                  <div className="uploaded-by">
                    <span className="user-avatar">
                      {material.uploaded_by_user.image ? (
                        <img
                          src={material.uploaded_by_user.image}
                          alt={material.uploaded_by_user.name}
                          className="user-image"
                        />
                      ) : (
                        <span className="user-initials">
                          {material.uploaded_by_user.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()}
                        </span>
                      )}
                    </span>
                    <span className="upload-date">
                      {new Date(material.uploaded_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {material.type === 'file' && material.file_size && (
                  <div className="file-size">
                    {(material.file_size / 1024 / 1024).toFixed(1)} KB
                  </div>
                )}
              </div>

              <div className="material-content">
                {material.type === 'file' && material.file_url && (
                  <a
                    href={material.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="material-link"
                    aria-label={`Download ${material.file_name}`}
                  >
                    {material.file_name || 'Download file'}
                  </a>
                )}

                {material.type === 'link' && material.external_url && (
                  <a
                    href={material.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="material-link"
                    aria-label={`Open ${material.title}`}
                  >
                    {material.external_url}
                  </a>
                )}

                {material.type === 'link' && !material.external_url && (
                  <span className="material-link-placeholder">
                    No link provided
                  </span>
                )}

                {material.type === 'video' && material.external_url && (
                  <a
                    href={material.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="material-link video-link"
                    aria-label={`Watch ${material.title}`}
                  >
                    ▶ Watch Video
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

LessonMaterialsSection.displayName = 'LessonMaterialsSection';

export default LessonMaterialsSection;
