'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface Homework {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  is_open: boolean;
  submission_count: number;
  created_at: string;
}

interface HomeworkSubmission {
  id: string;
  homework_id: string;
  text_answer: string | null;
  file_url: string | null;
  submitted_at: string;
}

interface LessonHomeworkSectionProps {
  lessonId: string;
  userRole: string;
  userId: string;
}

export default function LessonHomeworkSection({
  lessonId,
  userRole,
  userId,
}: LessonHomeworkSectionProps) {
  const t = useTranslations('lessons');
  const { data: session } = useSession();
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, HomeworkSubmission>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState<string | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);

  // New homework form state
  const [newHomework, setNewHomework] = useState({
    title: '',
    description: '',
    due_date: '',
    is_open: true,
  });

  // Submit homework form state
  const [submissionForm, setSubmissionForm] = useState({
    text_answer: '',
    file_url: '',
  });

  const canCreateHomework = userRole === 'teacher' || userRole === 'admin';

  // Fetch homework list
  useEffect(() => {
    fetchHomework();
  }, [lessonId]);

  const fetchHomework = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}/homework`);
      if (!response.ok) {
        throw new Error('Failed to fetch homework');
      }
      const data = await response.json();
      setHomeworkList(data.homework || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching homework:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for students
  useEffect(() => {
    if (userRole === 'student' && homeworkList.length > 0) {
      fetchSubmissions();
    }
  }, [userRole, homeworkList]);

  const fetchSubmissions = async () => {
    try {
      const homeworkIds = homeworkList.map(h => h.id);
      const response = await fetch(`/api/homework/${homeworkIds.join(',')}`);
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      const data = await response.json();
      const submissionsMap: Record<string, HomeworkSubmission> = {};
      if (data.homeworks) {
        data.homeworks.forEach((hw: any) => {
          if (hw.submission) {
            submissionsMap[hw.id] = hw.submission;
          }
        });
      }
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  // Create homework
  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/lessons/${lessonId}/homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newHomework),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create homework');
      }
      await fetchHomework();
      setShowCreateModal(false);
      setNewHomework({ title: '', description: '', due_date: '', is_open: true });
    } catch (err) {
      console.error('Error creating homework:', err);
      alert(err instanceof Error ? err.message : 'Failed to create homework');
    }
  };

  // Delete homework
  const handleDeleteHomework = async (homeworkId: string) => {
    if (!confirm('Are you sure you want to delete this homework?')) {
      return;
    }
    try {
      const response = await fetch(`/api/homework/${homeworkId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete homework');
      }
      await fetchHomework();
    } catch (err) {
      console.error('Error deleting homework:', err);
      alert('Failed to delete homework');
    }
  };

  // Submit homework
  const handleSubmitHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    try {
      const response = await fetch(`/api/homework/${showSubmitModal}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionForm),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit homework');
      }
      await fetchSubmissions();
      setShowSubmitModal(null);
      setSubmissionForm({ text_answer: '', file_url: '' });
    } catch (err) {
      console.error('Error submitting homework:', err);
      alert(err instanceof Error ? err.message : 'Failed to submit homework');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t('homework.title')}</h2>
        {canCreateHomework && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('homework.create')}
          </button>
        )}
      </div>

      {homeworkList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('homework.noHomework')}
        </div>
      ) : (
        <div className="space-y-4">
          {homeworkList.map((homework) => (
            <div
              key={homework.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{homework.title}</h3>
                  {homework.description && (
                    <p className="text-gray-600 mb-3">{homework.description}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>
                      {t('homework.dueDate')}: {formatDate(homework.due_date)}
                    </span>
                    <span>
                      {t('homework.submissions')}: {homework.submission_count}
                    </span>
                    <span className={homework.is_open ? 'text-green-600' : 'text-red-600'}>
                      {homework.is_open ? t('homework.open') : t('homework.closed')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {canCreateHomework ? (
                    <>
                      <button
                        onClick={() => handleDeleteHomework(homework.id)}
                        className="px-3 py-1 text-red-600 hover:text-red-700"
                      >
                        {t('homework.delete')}
                      </button>
                    </>
                  ) : userRole === 'student' ? (
                    <>
                      {submissions[homework.id] ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                          {t('homework.submitted')}
                        </span>
                      ) : homework.is_open && !isOverdue(homework.due_date) ? (
                        <button
                          onClick={() => {
                            setShowSubmitModal(homework.id);
                            setSelectedHomework(homework);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          {t('homework.submit')}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded">
                          {homework.is_open ? t('homework.overdue') : t('homework.closed')}
                        </span>
                      )}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Homework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('homework.createHomework')}</h3>
            <form onSubmit={handleCreateHomework}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('homework.title')}
                  </label>
                  <input
                    type="text"
                    value={newHomework.title}
                    onChange={(e) => setNewHomework({ ...newHomework, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('homework.description')}
                  </label>
                  <textarea
                    value={newHomework.description}
                    onChange={(e) => setNewHomework({ ...newHomework, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('homework.dueDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={newHomework.due_date}
                    onChange={(e) => setNewHomework({ ...newHomework, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_open"
                    checked={newHomework.is_open}
                    onChange={(e) => setNewHomework({ ...newHomework, is_open: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="is_open" className="text-sm">
                    {t('homework.isOpen')}
                  </label>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t('common.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Homework Modal */}
      {showSubmitModal && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('homework.submitHomework')}</h3>
            <div className="mb-4">
              <h4 className="font-semibold">{selectedHomework.title}</h4>
              {selectedHomework.description && (
                <p className="text-gray-600 text-sm mt-1">{selectedHomework.description}</p>
              )}
            </div>
            <form onSubmit={handleSubmitHomework}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('homework.textAnswer')}
                  </label>
                  <textarea
                    value={submissionForm.text_answer}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, text_answer: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    rows={5}
                    placeholder={t('homework.textAnswerPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('homework.fileUrl')}
                  </label>
                  <input
                    type="text"
                    value={submissionForm.file_url}
                    onChange={(e) => setSubmissionForm({ ...submissionForm, file_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    placeholder={t('homework.fileUrlPlaceholder')}
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitModal(null);
                    setSelectedHomework(null);
                    setSubmissionForm({ text_answer: '', file_url: '' });
                  }}
                  className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
