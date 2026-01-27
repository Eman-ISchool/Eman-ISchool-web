'use client';

import { useState } from 'react';

export interface VisibilityEntry {
  visibility_type: 'class' | 'grade_level' | 'group';
  class_id?: string;
  grade_level?: string;
  group_id?: string;
}

export interface VisibilitySelectorProps {
  value: VisibilityEntry[];
  onChange: (visibility: VisibilityEntry[]) => void;
  availableClasses?: Array<{ id: string; name: string }>;
  availableGradeLevels?: Array<{ id: string; name: string }>;
  availableGroups?: Array<{ id: string; name: string }>;
  className?: string;
}

export default function VisibilitySelector({
  value,
  onChange,
  availableClasses = [],
  availableGradeLevels = [],
  availableGroups = [],
  className = '',
}: VisibilitySelectorProps) {
  const [newEntry, setNewEntry] = useState<VisibilityEntry>({
    visibility_type: 'class',
  });

  const addVisibility = () => {
    if (!newEntry.visibility_type) return;

    let validEntry: VisibilityEntry = {
      visibility_type: newEntry.visibility_type,
    };

    if (newEntry.visibility_type === 'class') {
      if (!newEntry.class_id) return;
      validEntry.class_id = newEntry.class_id;
    } else if (newEntry.visibility_type === 'grade_level') {
      if (!newEntry.grade_level) return;
      validEntry.grade_level = newEntry.grade_level;
    } else if (newEntry.visibility_type === 'group') {
      if (!newEntry.group_id) return;
      validEntry.group_id = newEntry.group_id;
    }

    onChange([...value, validEntry]);
    setNewEntry({ visibility_type: 'class' });
  };

  const removeVisibility = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const getVisibilityLabel = (entry: VisibilityEntry): string => {
    if (entry.visibility_type === 'class') {
      const classInfo = availableClasses.find(c => c.id === entry.class_id);
      return classInfo ? `Class: ${classInfo.name}` : 'Class';
    } else if (entry.visibility_type === 'grade_level') {
      const gradeInfo = availableGradeLevels.find(g => g.id === entry.grade_level);
      return gradeInfo ? `Grade: ${gradeInfo.name}` : 'Grade Level';
    } else if (entry.visibility_type === 'group') {
      const groupInfo = availableGroups.find(g => g.id === entry.group_id);
      return groupInfo ? `Group: ${groupInfo.name}` : 'Group';
    }
    return 'Unknown';
  };

  return (
    <div className={`visibility-selector ${className}`}>
      <h3 className="selector-title">Visibility Settings</h3>
      <p className="selector-description">
        Select which students can see this reel. You can add multiple visibility rules.
      </p>

      {/* Current Visibility List */}
      {value.length > 0 && (
        <div className="visibility-list">
          {value.map((entry, index) => (
            <div key={index} className="visibility-item">
              <span className="visibility-label">
                {getVisibilityLabel(entry)}
              </span>
              <button
                className="remove-button"
                onClick={() => removeVisibility(index)}
                aria-label="Remove visibility rule"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Visibility */}
      <div className="add-visibility">
        <div className="visibility-type-selector">
          <label className="type-label">Visibility Type:</label>
          <select
            value={newEntry.visibility_type}
            onChange={(e) =>
              setNewEntry({
                visibility_type: e.target.value as any,
              })
            }
            className="type-select"
          >
            <option value="class">Class</option>
            <option value="grade_level">Grade Level</option>
            <option value="group">Group</option>
          </select>
        </div>

        {newEntry.visibility_type === 'class' && (
          <div className="value-selector">
            <label className="value-label">Class:</label>
            <select
              value={newEntry.class_id || ''}
              onChange={(e) =>
                setNewEntry({ ...newEntry, class_id: e.target.value })
              }
              className="value-select"
            >
              <option value="">Select a class...</option>
              {availableClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {newEntry.visibility_type === 'grade_level' && (
          <div className="value-selector">
            <label className="value-label">Grade Level:</label>
            <select
              value={newEntry.grade_level || ''}
              onChange={(e) =>
                setNewEntry({ ...newEntry, grade_level: e.target.value })
              }
              className="value-select"
            >
              <option value="">Select a grade level...</option>
              {availableGradeLevels.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {newEntry.visibility_type === 'group' && (
          <div className="value-selector">
            <label className="value-label">Group:</label>
            <select
              value={newEntry.group_id || ''}
              onChange={(e) =>
                setNewEntry({ ...newEntry, group_id: e.target.value })
              }
              className="value-select"
            >
              <option value="">Select a group...</option>
              {availableGroups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          className="add-button"
          onClick={addVisibility}
          disabled={
            (newEntry.visibility_type === 'class' && !newEntry.class_id) ||
            (newEntry.visibility_type === 'grade_level' && !newEntry.grade_level) ||
            (newEntry.visibility_type === 'group' && !newEntry.group_id)
          }
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Visibility Rule
        </button>
      </div>

      <style jsx>{`
        .visibility-selector {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .selector-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }

        .selector-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }

        .visibility-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }

        .visibility-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .visibility-label {
          font-size: 14px;
          font-weight: 500;
          color: #374151;
        }

        .remove-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-button:hover {
          background: #fee2e2;
        }

        .add-visibility {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          border-radius: 8px;
        }

        .visibility-type-selector,
        .value-selector {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .type-label,
        .value-label {
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }

        .type-select,
        .value-select {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          cursor: pointer;
        }

        .type-select:focus,
        .value-select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .add-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 16px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .add-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .add-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
