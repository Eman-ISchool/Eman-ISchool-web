/**
 * Reel Error Boundary Component
 * Catches and displays errors for reel-related pages
 */

'use client';

import { Component, ReactNode, ErrorInfo } from 'react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface ReelErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ReelErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export default class ReelErrorBoundary extends Component<
    ReelErrorBoundaryProps,
    ReelErrorBoundaryState
> {
    constructor(props: ReelErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ReelErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Reel Error Boundary caught an error:', error, errorInfo);
        
        // Log error to error tracking service (if available)
        if (typeof window !== 'undefined' && (window as any).trackError) {
            (window as any).trackError(error, errorInfo);
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            const handleBackToReels = () => {
                if (typeof window === 'undefined') return;
                const locale = getLocaleFromPathname(window.location.pathname);
                window.location.href = withLocalePrefix('/teacher/reels', locale);
            };

            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.932-3.131L13.067 5.069c-.926-1.464 2.608-2.931 4.131-2.931 1.523 0 3.205 1.467 4.131 2.931l4.931 10.938c.57 1.464 1.392 2.931 2.932 2.931 1.523 0 3.205-1.467 4.131-2.931l-4.931-10.938c-.926-1.464-2.608-2.931-4.131-2.931z"
                                />
                            </svg>
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Something went wrong
                        </h2>
                        
                        <p className="text-gray-600 mb-6">
                            {this.state.error?.message || 'An unexpected error occurred while loading the reels.'}
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={this.handleReset}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Try Again
                            </button>
                            
                            <button
                                onClick={handleBackToReels}
                                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                            >
                                Back to Reels
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    Error Details
                                </summary>
                                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs text-gray-800 overflow-auto">
                                    {this.state.error?.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
