'use client';

import { useState, useRef } from 'react';
import { Download, Upload, FileText, Clock, ChevronRight, X, CheckCircle } from 'lucide-react';

interface Assignment {
    id: string;
    type: 'quiz' | 'assignment';
    title: string;
    subject?: string;
    dueAt: string;
    fileUrl?: string;
    submissionStatus: 'pending' | 'submitted' | 'late';
}

interface AssignmentListProps {
    assignments: Assignment[];
    onSeeAll?: () => void;
    onUpload?: (assignmentId: string, file: File) => Promise<void>;
}

export function AssignmentList({ assignments, onSeeAll, onUpload }: AssignmentListProps) {
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [uploadModal, setUploadModal] = useState<Assignment | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const statusStyles = {
        pending: 'badge-upcoming',
        submitted: 'bg-green-100 text-green-700',
        late: 'bg-red-100 text-red-700',
    };

    const statusLabels = {
        pending: 'Pending',
        submitted: 'Submitted',
        late: 'Late',
    };

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    const handleUploadClick = (assignment: Assignment) => {
        setUploadModal(assignment);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !uploadModal || !onUpload) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/png', 'image/jpeg', 'application/zip'];
        if (!allowedTypes.includes(file.type)) {
            alert('Invalid file type. Please upload PDF, DOCX, PNG, JPG, or ZIP files.');
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('File too large. Maximum size is 10MB.');
            return;
        }

        setUploadingId(uploadModal.id);
        try {
            await onUpload(uploadModal.id, file);
            setUploadModal(null);
        } catch (error) {
            console.error('Upload failed:', error);
        } finally {
            setUploadingId(null);
        }
    };

    if (assignments.length === 0) {
        return (
            <div className="card-soft p-8 text-center">
                <CheckCircle className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)]">You're all caught up!</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">No assignments or quizzes pending</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Assignments & Quizzes</h2>
                    {onSeeAll && (
                        <button
                            onClick={onSeeAll}
                            className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                        >
                            See all
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="space-y-2">
                    {assignments.slice(0, 5).map((assignment) => (
                        <div key={assignment.id} className="card-soft p-4 flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center">
                                <FileText className="w-5 h-5 text-[var(--color-primary)]" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-[var(--color-text-primary)] truncate">
                                        {assignment.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusStyles[assignment.submissionStatus]}`}>
                                        {statusLabels[assignment.submissionStatus]}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
                                    {assignment.subject && <span>{assignment.subject}</span>}
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        Due {new Date(assignment.dueAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                                {assignment.fileUrl && (
                                    <button
                                        onClick={() => handleDownload(assignment.fileUrl!)}
                                        className="p-2 rounded-lg bg-[var(--color-bg-muted)] hover:bg-[var(--color-primary-light)] transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    </button>
                                )}
                                {assignment.submissionStatus !== 'submitted' && (
                                    <button
                                        onClick={() => handleUploadClick(assignment)}
                                        disabled={uploadingId === assignment.id}
                                        className="p-2 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50"
                                        title="Upload submission"
                                    >
                                        <Upload className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-soft p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Upload Submission</h3>
                            <button onClick={() => setUploadModal(null)} className="p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-[var(--color-text-secondary)] mb-4">
                            Submit your work for: <strong>{uploadModal.title}</strong>
                        </p>

                        <div
                            className="border-2 border-dashed border-[var(--color-primary)] rounded-xl p-8 text-center cursor-pointer hover:bg-[var(--color-primary-light)] transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-10 h-10 text-[var(--color-primary)] mx-auto mb-3" />
                            <p className="font-medium text-[var(--color-text-primary)]">
                                {uploadingId ? 'Uploading...' : 'Click or drag to upload'}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)] mt-1">
                                PDF, DOCX, PNG, JPG, ZIP (max 10MB)
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
