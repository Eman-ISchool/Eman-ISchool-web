/**
 * Teacher Reel Upload Page
 * Allows teachers to upload source content (videos, documents) for AI-powered reel generation
 */

'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import SourceUploader from '@/components/reels/SourceUploader';
import ProcessingStatus from '@/components/reels/ProcessingStatus';
import TranscriptViewer from '@/components/reels/TranscriptViewer';
import { useSourceUpload } from '@/hooks/useSourceUpload';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface ProcessingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface SourceContent {
  id: string;
  type: 'video' | 'document' | 'recording';
  status: 'uploaded' | 'processing' | 'transcribing' | 'ready' | 'failed';
  file_url: string;
  original_filename: string;
  transcript?: {
    text: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
      confidence: number;
    }>;
    language: string;
    confidence: number;
    wordCount: number;
    isManual: boolean;
  };
  processing_job?: {
    id: string;
    status: 'pending' | 'processing' | 'paused' | 'completed' | 'failed';
    current_step: string;
    progress_percent: number;
    error_message: string | null;
  };
}

export default function TeacherReelUploadPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getLocaleFromPathname(pathname);
  const { resetUpload, state: uploadState } = useSourceUpload();
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [sourceContent, setSourceContent] = useState<SourceContent | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    { name: 'Upload', status: 'pending', progress: 0 },
    { name: 'Transcription', status: 'pending', progress: 0 },
    { name: 'Segmentation', status: 'pending', progress: 0 },
    { name: 'Reel Generation', status: 'pending', progress: 0 },
  ]);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Handle upload completion
  const handleUploadComplete = async (sourceId: string, fileUrl: string) => {
    // Fetch source content details
    try {
      const response = await fetch(`/api/source-content/${sourceId}`);
      if (response.ok) {
        const data = await response.json();
        setSourceContent(data.data);
        
        // Start processing status polling
        startPolling(sourceId);
      }
    } catch (error) {
      console.error('[UploadPage] Error fetching source content:', error);
    }
  };

  // Handle upload error
  const handleUploadError = (error: string) => {
    console.error('[UploadPage] Upload error:', error);
  };

  // Start polling for processing status
  const startPolling = (sourceId: string) => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/source-content/${sourceId}`);
        if (response.ok) {
          const data = await response.json();
          const updatedSource = data.data;
          
          setSourceContent(updatedSource);
          
          // Update processing steps based on job status
          if (updatedSource.processing_job) {
            updateProcessingSteps(updatedSource.processing_job);
          }

          // Stop polling if processing is complete
          if (updatedSource.status === 'ready' || updatedSource.status === 'failed') {
            clearInterval(interval);
            setPollingInterval(null);
          }
        }
      } catch (error) {
        console.error('[UploadPage] Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

  // Update processing steps based on job status
  const updateProcessingSteps = (job: SourceContent['processing_job']) => {
    const steps = [...processingSteps];
    
    // Map job status to steps
    if (job.status === 'processing') {
      if (job.current_step === 'upload') {
        steps[0].status = 'in_progress';
        steps[0].progress = job.progress_percent;
      } else if (job.current_step === 'transcription') {
        steps[0].status = 'completed';
        steps[0].progress = 100;
        steps[1].status = 'in_progress';
        steps[1].progress = job.progress_percent;
      } else if (job.current_step === 'segmentation') {
        steps[0].status = 'completed';
        steps[0].progress = 100;
        steps[1].status = 'completed';
        steps[1].progress = 100;
        steps[2].status = 'in_progress';
        steps[2].progress = job.progress_percent;
      } else if (job.current_step === 'generation') {
        steps[0].status = 'completed';
        steps[0].progress = 100;
        steps[1].status = 'completed';
        steps[1].progress = 100;
        steps[2].status = 'completed';
        steps[2].progress = 100;
        steps[3].status = 'in_progress';
        steps[3].progress = job.progress_percent;
      }
    } else if (job.status === 'completed') {
      steps.forEach(step => {
        step.status = 'completed';
        step.progress = 100;
      });
    } else if (job.status === 'failed') {
      const failedStep = steps.findIndex(s => s.status === 'in_progress');
      if (failedStep !== -1) {
        steps[failedStep].status = 'failed';
        steps[failedStep].error = job.error_message || 'Processing failed';
      }
    }

    setProcessingSteps(steps);
  };

  // Handle processing complete
  const handleProcessingComplete = () => {
    // Navigate to reels library after a short delay
    setTimeout(() => {
      router.push(withLocalePrefix('/temp-teacher/reels', locale));
    }, 2000);
  };

  // Handle retry
  const handleRetry = async () => {
    if (!sourceContent?.id) return;

    try {
      const response = await fetch(`/api/reels/generate-from-source`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceId: sourceContent.id,
          classId: selectedClassId || null,
        }),
      });

      if (response.ok) {
        // Reset processing steps and start polling
        setProcessingSteps([
          { name: 'Upload', status: 'completed', progress: 100 },
          { name: 'Transcription', status: 'pending', progress: 0 },
          { name: 'Segmentation', status: 'pending', progress: 0 },
          { name: 'Reel Generation', status: 'pending', progress: 0 },
        ]);
        startPolling(sourceContent.id);
      }
    } catch (error) {
      console.error('[UploadPage] Retry error:', error);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Content for Reel Generation
          </h1>
          <p className="text-gray-600">
            Upload videos or documents to automatically generate educational reels using AI
          </p>
        </div>

        {/* Class Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class (Optional)
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={uploadState.isUploading || !!sourceContent}
          >
            <option value="">All Classes</option>
            {/* TODO: Fetch and display actual classes */}
            <option value="class-1">Class 1</option>
            <option value="class-2">Class 2</option>
          </select>
          <p className="mt-2 text-sm text-gray-500">
            Select a class to automatically assign generated reels to that class
          </p>
        </div>

        {/* Upload Section */}
        {!sourceContent && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload Source Content
            </h2>
            <SourceUploader
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              acceptedTypes={['video', 'document']}
              maxSizeMB={500}
            />
            
            {/* Upload Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Supported Formats</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Videos: MP4, MOV, WebM (max 500MB, 2 hours)</li>
                <li>• Documents: PDF, DOCX, TXT (max 50MB, 100 pages)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Processing Status */}
        {sourceContent && sourceContent.status !== 'ready' && sourceContent.status !== 'failed' && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Processing Status
            </h2>
            <ProcessingStatus
              jobId={sourceContent.processing_job?.id || ''}
              steps={processingSteps}
              onComplete={handleProcessingComplete}
              onRetry={handleRetry}
            />
            <div className="mt-4 text-sm text-gray-600">
              <p>File: {sourceContent.original_filename}</p>
              <p>Status: {sourceContent.status}</p>
            </div>
          </div>
        )}

        {/* Transcript Viewer */}
        {sourceContent && sourceContent.transcript && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Transcript
            </h2>
            <TranscriptViewer
              transcript={sourceContent.transcript}
              onEdit={async (updatedTranscript) => {
                // Handle transcript edit
                try {
                  const response = await fetch(`/api/source-content/${sourceContent.id}/transcript`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedTranscript),
                  });

                  if (response.ok) {
                    const data = await response.json();
                    setSourceContent(data.data);
                  }
                } catch (error) {
                  console.error('[UploadPage] Error updating transcript:', error);
                }
              }}
            />
          </div>
        )}

        {/* Success Message */}
        {sourceContent && sourceContent.status === 'ready' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-xl font-semibold text-green-900">
                Processing Complete!
              </h2>
            </div>
            <p className="text-green-800 mb-4">
              Your content has been successfully processed and reels have been generated.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push(withLocalePrefix('/temp-teacher/reels', locale))}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                View Generated Reels
              </button>
              <button
                onClick={() => {
                  setSourceContent(null);
                  resetUpload();
                }}
                className="px-6 py-2 bg-white text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors"
              >
                Upload Another File
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {sourceContent && sourceContent.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-600"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                <path d="M12 16v4" strokeWidth="2" />
              </svg>
              <h2 className="text-xl font-semibold text-red-900">
                Processing Failed
              </h2>
            </div>
            <p className="text-red-800 mb-4">
              An error occurred while processing your content. Please try again or contact support.
            </p>
            {sourceContent.processing_job?.error_message && (
              <p className="text-sm text-red-700 mb-4">
                Error: {sourceContent.processing_job.error_message}
              </p>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleRetry}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => {
                  setSourceContent(null);
                  resetUpload();
                }}
                className="px-6 py-2 bg-white text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
              >
                Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
