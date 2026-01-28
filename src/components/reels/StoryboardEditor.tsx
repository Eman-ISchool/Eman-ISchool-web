'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { validateStoryboard } from '@/lib/storyboard-generator';

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

  const isStoryboardValid = useMemo(() => {
    return storyboard ? validateStoryboard(storyboard) : false;
  }, [storyboard]);

  // Handle scene edit
  const handleSceneEdit = useCallback(
    (index: number, field: keyof StoryboardScene, value: string | number) => {
      if (!storyboard) {
        return;
      }

      setEditedScenes((prev) => {
        const next = [...prev];
        const baseScene = next[index] ?? storyboard.scenes[index];

        next[index] = {
          ...baseScene,
          [field]: value,
        } as StoryboardScene;

        return next;
      });
    },
    [storyboard]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!storyboard || !isStoryboardValid) {
      setSaveError('Storyboard has validation errors.');
      return;
    }

    setIsSaving(true);
    try {
      const updatedStoryboard: Storyboard = {
        ...storyboard,
        scenes: storyboard.scenes.map((scene, index) => {
          const editedScene = editedScenes[index];
          return editedScene ? { ...scene, ...editedScene } : scene;
        }),
      };

      await onSave?.(updatedStoryboard);

      setSaveError(null);
    } catch (error: any) {
      setSaveError(error.message || 'Failed to save storyboard');
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  }, [editedScenes, isStoryboardValid, onSave, storyboard]);

  // Handle edit button click
  const handleEditClick = () => {
    if (readOnly || !storyboard) {
      return;
    }

    if (isEditing) {
      setIsEditing(false);
      setEditedScenes([]);
      setSaveError(null);
      return;
    }

    setEditedScenes(storyboard.scenes.map((scene) => ({ ...scene })));
    setIsEditing(true);
  };

  return (
    <div className={`storyboard-editor ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Storyboard Editor</h2>
        {!readOnly && (
          <button
            onClick={handleEditClick}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            disabled={isSaving || !storyboard}
            type="button"
          >
            {isEditing ? 'Cancel' : 'Edit'}
          </button>
        )}
      </div>

      <div className="mb-6">
        {storyboard?.scenes.map((scene, index) => {
          const editedScene = editedScenes[index] ?? scene;
          const inputsDisabled = readOnly || !isEditing || isSaving;

          return (
            <div
              key={scene.scene_number ?? index}
              className="mb-4 rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex items-center justify-between text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  Scene {scene.scene_number}
                </span>
                <span>{editedScene.duration}s</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-medium text-gray-700">
                  Duration (seconds)
                  <input
                    type="number"
                    className="mt-1 w-28 rounded border border-gray-300 px-2 py-1 focus:border-blue-500 focus:ring-2"
                    value={editedScene.duration}
                    onChange={(e) =>
                      handleSceneEdit(index, 'duration', Number(e.target.value))
                    }
                    min="0"
                    max="60"
                    step="1"
                    disabled={inputsDisabled}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700">
                  Visual Suggestion
                  <input
                    type="text"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2"
                    value={editedScene.visual_suggestion}
                    onChange={(e) =>
                      handleSceneEdit(index, 'visual_suggestion', e.target.value)
                    }
                    disabled={inputsDisabled}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                  Narration
                  <textarea
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2"
                    rows={4}
                    value={editedScene.narration}
                    onChange={(e) =>
                      handleSceneEdit(index, 'narration', e.target.value)
                    }
                    disabled={inputsDisabled}
                  />
                </label>

                <label className="block text-sm font-medium text-gray-700 md:col-span-2">
                  Text Overlay
                  <input
                    type="text"
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2"
                    value={editedScene.text_overlay}
                    onChange={(e) =>
                      handleSceneEdit(index, 'text_overlay', e.target.value)
                    }
                    disabled={inputsDisabled}
                  />
                </label>
              </div>
            </div>
          );
        })}

        {storyboard?.scenes.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            <p>
              No storyboard available. Generate one from document content first.
            </p>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={handleSave}
            disabled={!isEditing || isSaving || !isStoryboardValid}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          <button
            onClick={() => {
              if (!storyboard) {
                return;
              }

              setEditedScenes(storyboard.scenes.map((scene) => ({ ...scene })));
              setSaveError(null);
              onEdit?.(storyboard);
            }}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white transition-colors hover:bg-gray-700"
            type="button"
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
