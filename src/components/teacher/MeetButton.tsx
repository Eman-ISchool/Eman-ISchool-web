'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Loader2, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function MeetButton({
    lessonId,
    initialMeetLink,
    startDateTime
}: {
    lessonId: string,
    initialMeetLink?: string,
    startDateTime: string
}) {
    const [meetLink, setMeetLink] = useState(initialMeetLink);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Real-time status update
        const checkStatus = () => {
            const now = new Date().getTime();
            const start = new Date(startDateTime).getTime();
            // If the current time is greater than or equal to start time, it's live (Red). 
            // Otherwise it's upcoming (Green).
            setIsLive(now >= start);
        };

        checkStatus();
        const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [startDateTime]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setError('');

        try {
            // Call our new robust backend endpoint to get/create a real Google Meet link
            const res = await fetch(`/api/lessons/${lessonId}/meeting`, {
                method: 'POST',
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to generate meeting link');
            }

            if (!data.meeting?.meet_url) {
                throw new Error('No valid internal url returned from API');
            }

            setMeetLink(data.meeting.meet_url);
        } catch (err: any) {
            console.error('[MeetButtonError]', err);
            setError(err.message || 'Failed to generate meet link.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!meetLink) return;
        try {
            await navigator.clipboard.writeText(meetLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy', e);
        }
    };

    if (meetLink) {
        return (
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Status Indicator */}
                        <div className="relative flex h-3 w-3">
                            {isLive ? (
                                <>
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </>
                            ) : (
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            )}
                        </div>
                        <span className={`text-sm font-semibold ${isLive ? 'text-red-600' : 'text-green-600'}`}>
                            {isLive ? 'Live Now' : 'Upcoming'}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button onClick={handleCopy} variant="outline" size="sm" className="h-9 px-3" title="Copy Meeting Link">
                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-500" />}
                        </Button>
                        <Button asChild variant="default" className={isLive ? 'bg-red-600 hover:bg-red-700 text-white h-9' : 'bg-green-600 hover:bg-green-700 text-white h-9'}>
                            <a href={meetLink} target="_blank" rel="noopener noreferrer" className="gap-2">
                                <Video className="h-4 w-4" />
                                Join Meeting
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-gray-500 truncate w-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                    Synchronized across portals
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
                {isGenerating ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Video className="h-4 w-4" />
                        Generate Google Meet
                    </>
                )}
            </Button>
            {error && (
                <div className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {error}
                </div>
            )}
        </div>
    );
}
