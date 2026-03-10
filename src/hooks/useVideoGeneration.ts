'use client';

/**
 * Custom hook for AI video generation
 * Manages video generation workflow and status polling
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface VideoGenerationState {
    isGenerating: boolean;
    progress: number;
    reelId: string | null;
    videoUrl: string | null;
    error: string | null;
    status: 'idle' | 'generating' | 'completed' | 'failed';
}

interface GenerateVideoParams {
    prompt: string;
    teacherId: string;
    classId?: string;
    subject?: string;
    gradeLevel?: string;
}

export function useVideoGeneration() {
    const [state, setState] = useState<VideoGenerationState>({
        isGenerating: false,
        progress: 0,
        reelId: null,
        videoUrl: null,
        error: null,
        status: 'idle',
    });

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Clear polling interval on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    // Poll for status updates
    const pollStatus = useCallback(async (reelId: string) => {
        try {
            const response = await fetch(`/api/reels/check-status/${reelId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to check status');
            }

            setState(prev => ({
                ...prev,
                progress: data.progress || prev.progress,
                status: data.completed ? (data.status === 'approved' ? 'completed' : 'failed') : 'generating',
            }));

            if (data.completed) {
                // Stop polling
                if (pollingIntervalRef.current) {
                    clearInterval(pollingIntervalRef.current);
                    pollingIntervalRef.current = null;
                }

                if (data.status === 'approved') {
                    setState(prev => ({
                        ...prev,
                        isGenerating: false,
                        videoUrl: data.videoUrl,
                        status: 'completed',
                        progress: 100,
                    }));
                } else {
                    setState(prev => ({
                        ...prev,
                        isGenerating: false,
                        error: data.error || 'Video generation failed',
                        status: 'failed',
                    }));
                }
            }
        } catch (error: any) {
            console.error('Error polling status:', error);
            setState(prev => ({
                ...prev,
                error: error.message,
            }));
        }
    }, []);

    // Start video generation
    const generateVideo = useCallback(async (params: GenerateVideoParams) => {
        try {
            setState({
                isGenerating: true,
                progress: 0,
                reelId: null,
                videoUrl: null,
                error: null,
                status: 'generating',
            });

            const response = await fetch('/api/reels/generate-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start video generation');
            }

            const reelId = data.data.reelId;
            setState(prev => ({
                ...prev,
                reelId,
                progress: 5,
            }));

            // Start polling for status
            pollingIntervalRef.current = setInterval(() => {
                pollStatus(reelId);
            }, 3000); // Poll every 3 seconds

            // Initial poll
            pollStatus(reelId);

        } catch (error: any) {
            console.error('Error generating video:', error);
            setState({
                isGenerating: false,
                progress: 0,
                reelId: null,
                videoUrl: null,
                error: error.message,
                status: 'failed',
            });
        }
    }, [pollStatus]);

    // Reset state
    const reset = useCallback(() => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
        setState({
            isGenerating: false,
            progress: 0,
            reelId: null,
            videoUrl: null,
            error: null,
            status: 'idle',
        });
    }, []);

    return {
        ...state,
        generateVideo,
        reset,
    };
}
