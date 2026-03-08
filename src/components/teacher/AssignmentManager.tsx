'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Loader2, Plus, Eye, EyeOff, FileText, Calendar } from 'lucide-react';

interface AssignmentManagerProps {
    lessonId: string;
    initialAssignments?: any[];
    locale: string;
}

export function AssignmentManager({ lessonId, initialAssignments, locale }: AssignmentManagerProps) {
    const t = useTranslations('teacher.assignments');
    const [assignments, setAssignments] = useState<any[]>(initialAssignments || []);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [viewingSubmissions, setViewingSubmissions] = useState<string | null>(null);
    const [expandedAssignments, setExpandedAssignments] = useState<Set<string>>(new Set());

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedAssignments);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedAssignments(newExpanded);
    };

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/assignments?lessonId=${lessonId}`, {
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                throw new Error('Failed to fetch assignments');
            }

            const data = await res.json();
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAssignment = async () => {
        setShowCreateForm(false);
        // TODO: Navigate to assignment creation form
        console.log('Create assignment for lesson:', lessonId);
    };

    const handleToggleAssignmentStatus = async (assignmentId: string, is_open: boolean) => {
        try {
            const res = await fetch(`/api/assignments/${assignmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_open }),
            });

            if (!res.ok) {
                throw new Error('Failed to update assignment status');
            }

            const data = await res.json();
            setAssignments(assignments.map(a => a.id === assignmentId ? { ...a, is_open } : a));
        } catch (error) {
            console.error('Error updating assignment status:', error);
        }
    };

    const handleViewSubmissions = async (assignmentId: string) => {
        setViewingSubmissions(assignmentId);
        // TODO: Navigate to submissions page
        console.log('View submissions for assignment:', assignmentId);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {assignments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <p className="text-sm">{t('noAssignments')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {assignments.map((assignment) => (
                                    <Card key={assignment.id} className="border">
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {t('due')}: {new Date(assignment.due_date).toLocaleDateString(locale, {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${assignment.is_open ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                            }`}>
                                                            {assignment.is_open ? t('open') : t('closed')}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${assignment.is_open ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {t('maxScore')}: {assignment.max_score || 100}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleToggleAssignmentStatus(assignment.id, !assignment.is_open)}
                                                            className="p-1"
                                                        >
                                                            {assignment.is_open ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewSubmissions(assignment.id)}
                                                        >
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            {t('viewSubmissions')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{t('title')}</h2>
                <Button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    {t('createAssignment')}
                </Button>
            </div>

            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                    {assignments.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold mb-4">{t('assignmentsList')}</h3>
                            <div className="space-y-3">
                                {assignments.map((assignment) => (
                                    <Card key={assignment.id} className="border">
                                        <CardContent className="pt-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                                                    <p className="text-sm text-gray-600 mb-2">
                                                        {t('due')}: {new Date(assignment.due_date).toLocaleDateString(locale, {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className={`text-xs px-2 py-1 rounded ${assignment.is_open ? 'bg-green-100 text-green-700' :
                                                            'bg-red-100 text-red-700'
                                                            }`}>
                                                            {assignment.is_open ? t('open') : t('closed')}
                                                        </span>
                                                        <span className={`text-xs px-2 py-1 rounded ${assignment.is_open ? 'bg-green-100 text-green-700' :
                                                            'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {t('maxScore')}: {assignment.max_score || 100}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleToggleAssignmentStatus(assignment.id, !assignment.is_open)}
                                                            className="p-1"
                                                        >
                                                            {assignment.is_open ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleViewSubmissions(assignment.id)}
                                                        >
                                                            <FileText className="h-4 w-4 mr-1" />
                                                            {t('viewSubmissions')}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {
                viewingSubmissions && (
                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{t('submissionsTitle')}</h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => setViewingSubmissions(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('submissionsDescription')}
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showCreateForm && (
                    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">{t('createAssignment')}</h3>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowCreateForm(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </Button>
                            </div>
                            <div className="text-sm text-gray-600">
                                {t('createAssignmentDescription')}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
