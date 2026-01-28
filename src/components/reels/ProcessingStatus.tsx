'use client';

import React, { useEffect, useState } from 'react';

interface ProcessingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface ProcessingStatusProps {
  jobId: string;
  steps: ProcessingStep[];
  onComplete?: () => void;
  onRetry?: () => void;
  className?: string;
}

export default function ProcessingStatus({
  jobId,
  steps,
  onComplete,
  onRetry,
  className = '',
}: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);

  // Calculate overall progress
  useEffect(() => {
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const totalSteps = steps.length;
    const progress = (completedSteps / totalSteps) * 100;
    setOverallProgress(progress);

    // Update current step
    const inProgressStep = steps.findIndex(s => s.status === 'in_progress');
    if (inProgressStep !== -1) {
      setCurrentStep(inProgressStep);
    }

    // Check if all steps are complete
    if (completedSteps === totalSteps) {
      onComplete?.();
    }
  }, [steps]);

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'in_progress':
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="spinning"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v2h2v4h-2v-2h2z"
              fill="currentColor"
            />
          </svg>
        );
      case 'completed':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 6L9 17l-5-5 4 4m0 0l4 4m0 8l4-4 4-4m0 8l-4 4 4 0"
              stroke="currentColor"
            />
          </svg>
        );
      case 'failed':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
            <path d="M12 16v4" strokeWidth="2" />
          </svg>
        );
    }
  };

  const getStepStatusText = (step: ProcessingStep) => {
    switch (step.status) {
      case 'pending':
        return 'Waiting';
      case 'in_progress':
        return `${step.progress}%`;
      case 'completed':
        return 'Complete';
      case 'failed':
        return step.error || 'Failed';
    }
  };

  return (
    <div className={`processing-status ${className}`}>
      <div className="progress-header">
        <h3 className="status-title">Processing Status</h3>
        <div className="overall-progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(overallProgress)}%</span>
        </div>
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`step-item ${step.status === 'in_progress' ? 'active' : ''}`}
          >
            <div className="step-icon">{getStepIcon(step.status)}</div>
            <div className="step-content">
              <div className="step-name">{step.name}</div>
              <div className="step-status">
                {getStepStatusText(step)}
              </div>
              {step.status === 'in_progress' && (
                <div className="step-progress">
                  <div
                    className="step-progress-fill"
                    style={{ width: `${step.progress}%` }}
                  />
                </div>
              )}
              {step.error && (
                <div className="step-error">{step.error}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {onRetry && overallProgress < 100 && (
        <div className="retry-section">
          <button className="retry-button" onClick={onRetry}>
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
                d="M4 4v3h2v2h-2v-2zm0 0l4 4m0 8l4-4 4-4m0 8l-4 4 4 0"
              />
            </svg>
            Retry
          </button>
        </div>
      )}

      <style jsx>{`
        .processing-status {
          background: white;
          border-radius: 8px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .progress-header {
          margin-bottom: 24px;
        }
        .status-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 16px 0;
        }
        .overall-progress {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .progress-bar {
          flex: 1;
          height: 8px;
          background-color: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          transition: width 0.5s ease;
        }
        .progress-text {
          font-size: 14px;
          font-weight: 600;
          color: #3b82f6;
        }
        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .step-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          border-radius: 6px;
          background-color: #f9fafb;
          transition: all 0.3s ease;
        }
        .step-item.active {
          background-color: #eff6ff;
          border-left: 3px solid #3b82f6;
        }
        .step-icon {
          flex-shrink: 0;
          color: #6b7280;
        }
        .step-icon.spinning {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .step-content {
          flex: 1;
        }
        .step-name {
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          margin-bottom: 4px;
        }
        .step-status {
          font-size: 13px;
          color: #6b7280;
        }
        .step-progress {
          height: 4px;
          background-color: #e5e7eb;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 4px;
        }
        .step-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
          transition: width 0.5s ease;
        }
        .step-error {
          font-size: 12px;
          color: #dc2626;
          margin-top: 4px;
        }
        .retry-section {
          margin-top: 24px;
          text-align: center;
        }
        .retry-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        .retry-button:hover {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
}
