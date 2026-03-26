'use client';

import { useState, useEffect } from 'react';
import { LoadingState } from '@/components/admin/StateComponents';
import { fetchSessions } from '@/lib/session-api';

export default function CalendarPage() {
    const [loading, setLoading] = useState(true);

    // T019: Fetch real sessions from API
    useEffect(() => {
        const loadSessions = async () => {
            setLoading(true);
            try {
                await fetchSessions();
            } catch (error) {
                console.error('Error loading sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    if (loading) {
        return <LoadingState message="جاري تحميل التقويم..." />;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold">Fixed Calendar Stub</h1>
            <p className="text-gray-500">This page is temporarily disabled for maintenance.</p>
        </div>
    );
}
