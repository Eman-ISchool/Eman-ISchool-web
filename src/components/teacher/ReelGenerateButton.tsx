/**
 * Reel Generate Button Component
 * Button component for triggering AI reel generation
 */

'use client';

import { useState } from 'react';

interface ReelGenerateButtonProps {
  materialId: string;
  lessonId?: string;
  content: string;
  onGenerate?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function ReelGenerateButton({
  materialId,
  lessonId,
  content,
  onGenerate,
  disabled = false,
  className = '',
}: ReelGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (isGenerating || disabled) {
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/reels/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId: '', // Populated server-side from the session
          materialId,
          lessonId: lessonId ?? null,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate reel');
      }

      onGenerate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to generate reel');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`inline-flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleGenerate}
        disabled={disabled || isGenerating}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
      >
        {isGenerating ? (
          <>
            <svg
              className="h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Generate Reel
          </>
        )}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
