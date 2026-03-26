/**
 * Admin Reels Dashboard Page
 * Displays all reels across teachers with filtering and management options
 */

'use client';

import { useState, useEffect } from 'react';
import { logAdminReelAction } from '@/lib/admin-audit-log';


interface Reel {
    id: string;
    title_en: string;
    title_ar: string;
    description_en: string | null;
    description_ar: string | null;
    video_url: string;
    thumbnail_url: string | null;
    duration_seconds: number;
    status: 'queued' | 'processing' | 'pending_review' | 'approved' | 'rejected' | 'failed';
    subject: string | null;
    grade_level: string | null;
    teacher_id: string;
    lesson_id: string | null;
    created_at: string;
    view_count: number;
}

export default function AdminReelsPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [teacherFilter, setTeacherFilter] = useState<string>('all');
    const [subjectFilter, setSubjectFilter] = useState<string>('all');
    const [dateFrom, setDateFrom] = useState<string>('');
    const [dateTo, setDateTo] = useState<string>('');

    useEffect(() => {
        fetchReels();
    }, [statusFilter, teacherFilter, subjectFilter, dateFrom, dateTo]);

    const fetchReels = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (statusFilter !== 'all') params.append('status', statusFilter);
            if (teacherFilter !== 'all') params.append('teacher_id', teacherFilter);
            if (subjectFilter !== 'all') params.append('subject', subjectFilter);
            if (dateFrom) params.append('date_from', dateFrom);
            if (dateTo) params.append('date_to', dateTo);

            const response = await fetch(`/api/admin/reels?${params.toString()}`);

            if (!response.ok) {
                throw new Error('Failed to fetch reels');
            }

            const data = await response.json();
            setReels(data.data || []);
        } catch (err: any) {
            console.error('Error fetching reels:', err);
            setError(err.message || 'Failed to load reels');
        } finally {
            setLoading(false);
        }
    };

    const handleFlagReel = async (reelId: string) => {
        const reason = prompt('Please provide a reason for flagging this reel:');
        if (!reason) return;

        try {
            const response = await fetch(`/api/admin/reels/${reelId}/flag`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flagReason: reason }),
            });

            if (!response.ok) {
                throw new Error('Failed to flag reel');
            }

            // Log admin action
            await logAdminReelAction(reelId, 'flagged', 'admin', { reason });

            // Refresh reels list
            fetchReels();
        } catch (err: any) {
            console.error('Error flagging reel:', err);
            alert('Failed to flag reel. Please try again.');
        }
    };

    const handleRemoveReel = async (reelId: string) => {
        if (!confirm('Are you sure you want to remove this reel? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/reels/${reelId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove reel');
            }

            // Log admin action
            await logAdminReelAction(reelId, 'removed', 'admin');

            // Refresh reels list
            fetchReels();
        } catch (err: any) {
            console.error('Error removing reel:', err);
            alert('Failed to remove reel. Please try again.');
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'queued':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'pending_review':
                return 'bg-orange-100 text-orange-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    Reels Management
                </h1>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Statuses</option>
                                <option value="queued">Queued</option>
                                <option value="processing">Processing</option>
                                <option value="pending_review">Pending Review</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Teacher Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Teacher
                            </label>
                            <select
                                value={teacherFilter}
                                onChange={(e) => setTeacherFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Teachers</option>
                                {/* TODO: Fetch actual teachers from API */}
                                <option value="teacher-1">Teacher 1</option>
                                <option value="teacher-2">Teacher 2</option>
                            </select>
                        </div>

                        {/* Subject Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Subject
                            </label>
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Subjects</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Science">Science</option>
                                <option value="Arabic">Arabic</option>
                                <option value="English">English</option>
                                <option value="Physics">Physics</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>

                        {/* Date Range Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date From
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date To
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading state */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600">Loading reels...</p>
                    </div>
                ) : (
                    /* Reels table */
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {reels.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <p>No reels found matching the selected filters.</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Teacher
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subject
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Duration
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Views
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {reels.map((reel) => (
                                        <tr key={reel.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {reel.title_en}
                                                    <div className="text-sm text-gray-500">
                                                        {reel.title_ar}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {/* TODO: Fetch teacher name from users table */}
                                                {reel.teacher_id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {reel.subject || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(reel.status)}`}>
                                                    {reel.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {Math.floor(reel.duration_seconds / 60)}:{(reel.duration_seconds % 60).toString().padStart(2, '0')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {reel.view_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(reel.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => window.open(reel.video_url, '_blank')}
                                                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        onClick={() => handleFlagReel(reel.id)}
                                                        className="px-3 py-1 text-sm text-orange-600 hover:text-orange-800"
                                                    >
                                                        Flag
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemoveReel(reel.id)}
                                                        className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
