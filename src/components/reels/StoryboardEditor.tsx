'use client';

import React, { useState, useCallback } from 'react';
import { generateStoryboard, validateStoryboard } from '@/lib/storyboard-generator';

export interface StoryboardScene {
  scene_number: number;
  duration: number;
  narration: string;
  visual_suggestion: string;
  text_overlay: string;
  background_style: string;
}

export interface Storyboard {
  scenes: StoryboardScene[];
  summary: string;
  estimated_duration: number;
  target_audience: string;
}

interface StoryboardEditorProps {
  storyboard?: Storyboard;
  sourceId: string;
  onEdit?: (updatedStoryboard: Storyboard) => void;
  onSave?: (updatedStoryboard: Storyboard) => void;
  readOnly?: boolean;
  className?: string;
}

export default function StoryboardEditor({
  storyboard,
  sourceId,
  onEdit,
  onSave,
  readOnly = false,
  className = '',
}: StoryboardEditorProps) {
  const [editedScenes, setEditedScenes] = useState<StoryboardScene[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle scene edit
  const handleSceneEdit = useCallback((index: number, field: keyof StoryboardScene) => (value: string | number | boolean) => {
    setEditedScenes(prev => {
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value,
      },
    });
  };

  // Handle save
  const handleSave = useCallback(async () => {
    if (!validateStoryboard(storyboard)) {
      setSaveError('Storyboard has validation errors');
      return;
    }

    setIsSaving(true);
    try {
      // Call onSave with edited storyboard
      await onSave?.(editedScenes);
      
      setIsSaving(false);
      setSaveError(null);
    } catch (error: any) {
      setIsSaving(false);
      setSaveError(error.message || 'Failed to save storyboard');
    }
  });

  // Handle edit button click
  const handleEditClick = () => {
    if (readOnly) {
      return;
    }
    setIsEditing(true);
  };

  return (
    <div className={`storyboard-editor ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Storyboard Editor
      {!readOnly && (
        <button
          onClick={handleEditClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isEditing || isSaving}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      )}
      
      <div className="mb-6">
        {storyboard?.scenes.map((scene, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-500">Scene {scene.scene_number}</span>
                <span className="text-xs text-gray-400">({scene.duration}s)</span>
              </div>
              <div className="flex-1 flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Duration:
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:border-blue-500"
                    value={editedScenes[index]?.duration || scene.duration}
                    onChange={(e) => handleSceneEdit(index, 'duration', e.target.value)}
                    min="0"
                    max="60"
                    step="1"
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Narration:
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:border-blue-500 text-sm"
                    rows={4}
                    value={editedScenes[index]?.narration || scene.narration}
                    onChange={(e) => handleSceneEdit(index, 'narration', e.target.value)}
                    disabled={readOnly}
                  />
                </label>
              </div>
              
              <div className="flex-1 flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Visual Suggestion:
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:border-blue-500 text-sm"
                    value={editedScenes[index]?.visual_suggestion || scene.visual_suggestion}
                    onChange={(e) => handleSceneEdit(index, 'visual_suggestion', e.target.value)}
                    disabled={readOnly}
                  />
                </label>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Text Overlay:
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:border-blue-500 text-sm"
                    value={editedScenes[index]?.text_overlay || scene.text_overlay}
                    onChange={(e) => handleSceneEdit(index, 'text_overlay', e.target.value)}
                    disabled={readOnly}
                  />
                </label>
              </div>
            </div>
          ))}
        
        {storyboard?.scenes.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p>No storyboard available. Generate one from document content first.</p>
          </div>
        )}
        
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving || !validateStoryboard(storyboard) || editedScenes.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            onClick={() => onEdit?.(storyboard)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Reset
          </button>
        </div>

        {saveError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="font-medium text-red-900">{saveError}</p>
          </div>
        )}
      </div>
    </div>
  );
}
