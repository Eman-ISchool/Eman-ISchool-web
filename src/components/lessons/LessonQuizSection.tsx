'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface Assessment {
  id: string;
  assessment_type: string;
  title: string;
  duration_minutes: number | null;
  attempt_limit: number;
  late_submissions_allowed: boolean;
  submission_count: number;
  created_at: string;
}

interface AssessmentSubmission {
  id: string;
  assessment_id: string;
  score: number | null;
  graded_at: string | null;
  submitted_at: string;
}

interface LessonQuizSectionProps {
  lessonId: string;
  userRole: string;
  userId: string;
}

export default function LessonQuizSection({
  lessonId,
  userRole,
  userId,
}: LessonQuizSectionProps) {
  const t = useTranslations('lessons');
  useSession();
  const [quizList, setQuizList] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Record<string, AssessmentSubmission[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState<string | null>(null);
  const [showTakeQuizModal, setShowTakeQuizModal] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<Assessment | null>(null);

  // New quiz form state
  const [newQuiz, setNewQuiz] = useState({
    title: '',
    duration_minutes: '',
    attempt_limit: '1',
    late_submissions_allowed: false,
  });

  const canCreateQuiz = userRole === 'teacher' || userRole === 'admin';

  // Fetch quiz list
  useEffect(() => {
    fetchQuizzes();
  }, [lessonId]);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons/${lessonId}/assessments?type=quiz`);
      if (!response.ok) {
        throw new Error('Failed to fetch quizzes');
      }
      const data = await response.json();
      setQuizList(data.assessments || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch submissions for students
  useEffect(() => {
    if (quizList.length > 0) {
      fetchSubmissions();
    }
  }, [userRole, quizList]);

  const fetchSubmissions = async () => {
    try {
      const submissionsMap: Record<string, AssessmentSubmission[]> = {};
      for (const quiz of quizList) {
        const response = await fetch(`/api/assessments/${quiz.id}/results?student_id=${userId}`);
        if (response.ok) {
          const data = await response.json();
          submissionsMap[quiz.id] = data.submissions || [];
        }
      }
      setSubmissions(submissionsMap);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  // Create quiz
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/lessons/${lessonId}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessment_type: 'quiz',
          title: newQuiz.title,
          duration_minutes: newQuiz.duration_minutes ? parseInt(newQuiz.duration_minutes) : null,
          attempt_limit: parseInt(newQuiz.attempt_limit),
          late_submissions_allowed: newQuiz.late_submissions_allowed,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create quiz');
      }
      await fetchQuizzes();
      setShowCreateModal(false);
      setNewQuiz({ title: '', duration_minutes: '', attempt_limit: '1', late_submissions_allowed: false });
    } catch (err) {
      console.error('Error creating quiz:', err);
      alert(err instanceof Error ? err.message : 'Failed to create quiz');
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) {
      return;
    }
    try {
      const response = await fetch(`/api/assessments/${quizId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      await fetchQuizzes();
    } catch (err) {
      console.error('Error deleting quiz:', err);
      alert('Failed to delete quiz');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getLatestSubmission = (quizId: string) => {
    const quizSubmissions = submissions[quizId] || [];
    if (quizSubmissions.length === 0) return null;
    return quizSubmissions[quizSubmissions.length - 1];
  };

  const hasReachedAttemptLimit = (quiz: Assessment) => {
    const quizSubmissions = submissions[quiz.id] || [];
    return quizSubmissions.length >= quiz.attempt_limit;
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
        <h2 className="text-2xl font-bold">{t('quizzes.title')}</h2>
        {canCreateQuiz && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {t('quizzes.create')}
          </button>
        )}
      </div>

      {quizList.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t('quizzes.noQuizzes')}
        </div>
      ) : (
        <div className="space-y-4">
          {quizList.map((quiz) => {
            const latestSubmission = getLatestSubmission(quiz.id);
            const reachedLimit = hasReachedAttemptLimit(quiz);

            return (
              <div
                key={quiz.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{quiz.title}</h3>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>
                        {t('quizzes.duration')}: {quiz.duration_minutes ? `${quiz.duration_minutes} min` : '-'}
                      </span>
                      <span>
                        {t('quizzes.attempts')}: {submissions[quiz.id]?.length || 0}/{quiz.attempt_limit}
                      </span>
                      <span>
                        {t('quizzes.submissions')}: {quiz.submission_count}
                      </span>
                    </div>
                    {latestSubmission && (
                      <div className="mt-2 text-sm">
                        <span className="text-gray-600">
                          {t('quizzes.lastSubmission')}: {formatDate(latestSubmission.submitted_at)}
                        </span>
                        {latestSubmission.score !== null && (
                          <span className="ms-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {t('quizzes.score')}: {latestSubmission.score.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canCreateQuiz ? (
                      <>
                        <button
                          onClick={() => setShowResultsModal(quiz.id)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-700"
                        >
                          {t('quizzes.viewResults')}
                        </button>
                        <button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          className="px-3 py-1 text-red-600 hover:text-red-700"
                        >
                          {t('quizzes.delete')}
                        </button>
                      </>
                    ) : userRole === 'student' ? (
                      <>
                        {latestSubmission ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded">
                            {t('quizzes.submitted')}
                          </span>
                        ) : reachedLimit ? (
                          <span className="px-3 py-1 bg-red-100 text-red-700 rounded">
                            {t('quizzes.attemptLimitReached')}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setShowTakeQuizModal(quiz.id);
                              setSelectedQuiz(quiz);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          >
                            {t('quizzes.takeQuiz')}
                          </button>
                        )}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{t('quizzes.createQuiz')}</h3>
            <form onSubmit={handleCreateQuiz}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('quizzes.title')}
                  </label>
                  <input
                    type="text"
                    value={newQuiz.title}
                    onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('quizzes.durationMinutes')}
                  </label>
                  <input
                    type="number"
                    value={newQuiz.duration_minutes}
                    onChange={(e) => setNewQuiz({ ...newQuiz, duration_minutes: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('quizzes.attemptLimit')}
                  </label>
                  <input
                    type="number"
                    value={newQuiz.attempt_limit}
                    onChange={(e) => setNewQuiz({ ...newQuiz, attempt_limit: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                    min="1"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="late_submissions_allowed"
                    checked={newQuiz.late_submissions_allowed}
                    onChange={(e) => setNewQuiz({ ...newQuiz, late_submissions_allowed: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="late_submissions_allowed" className="text-sm">
                    {t('quizzes.allowLateSubmissions')}
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

      {/* Take Quiz Modal */}
      {showTakeQuizModal && selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">{t('quizzes.takeQuiz')}</h3>
            <div className="mb-4">
              <h4 className="font-semibold">{selectedQuiz.title}</h4>
              {selectedQuiz.duration_minutes && (
                <p className="text-gray-600 text-sm mt-1">
                  {t('quizzes.timeLimit')}: {selectedQuiz.duration_minutes} {t('quizzes.minutes')}
                </p>
              )}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
              <p className="text-sm text-yellow-800">
                {t('quizzes.quizWarning')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowTakeQuizModal(null);
                  setSelectedQuiz(null);
                }}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => {
                  // TODO: Navigate to quiz taking page
                  alert('Quiz taking functionality to be implemented');
                  setShowTakeQuizModal(null);
                  setSelectedQuiz(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('quizzes.startQuiz')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{t('quizzes.quizResults')}</h3>
              <button
                onClick={() => setShowResultsModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <QuizResults assessmentId={showResultsModal} />
          </div>
        </div>
      )}
    </div>
  );
}

function QuizResults({ assessmentId }: { assessmentId: string }) {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [assessmentId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assessments/${assessmentId}/results`);
      if (!response.ok) {
        throw new Error('Failed to fetch results');
      }
      const data = await response.json();
      setResults(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded p-4">
          <div className="text-sm text-gray-600">{results.statistics.submission_count} submissions</div>
          <div className="text-2xl font-bold text-blue-600">{results.statistics.submission_count}</div>
        </div>
        <div className="bg-green-50 rounded p-4">
          <div className="text-sm text-gray-600">Average Score</div>
          <div className="text-2xl font-bold text-green-600">
            {results.statistics.average_score ? results.statistics.average_score.toFixed(1) : '-'}%
          </div>
        </div>
        <div className="bg-purple-50 rounded p-4">
          <div className="text-sm text-gray-600">Highest Score</div>
          <div className="text-2xl font-bold text-purple-600">
            {results.statistics.max_score ? results.statistics.max_score.toFixed(1) : '-'}%
          </div>
        </div>
        <div className="bg-orange-50 rounded p-4">
          <div className="text-sm text-gray-600">Lowest Score</div>
          <div className="text-2xl font-bold text-orange-600">
            {results.statistics.min_score ? results.statistics.min_score.toFixed(1) : '-'}%
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-start">Student</th>
              <th className="px-4 py-2 text-start">Submitted</th>
              <th className="px-4 py-2 text-start">Score</th>
              <th className="px-4 py-2 text-start">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.submissions.map((submission: any) => (
              <tr key={submission.id} className="border-t">
                <td className="px-4 py-2">{submission.student.name}</td>
                <td className="px-4 py-2">{new Date(submission.submitted_at).toLocaleString()}</td>
                <td className="px-4 py-2">
                  {submission.score !== null ? `${submission.score.toFixed(1)}%` : '-'}
                </td>
                <td className="px-4 py-2">
                  {submission.score !== null ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                      Graded
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
