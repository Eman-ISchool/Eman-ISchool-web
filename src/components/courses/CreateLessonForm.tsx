'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface CreateLessonFormProps {
  courseId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateLessonForm({
  courseId,
  onSuccess,
  onCancel,
}: CreateLessonFormProps) {
  const t = useTranslations('lessons');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date_time: '',
    end_date_time: '',
    recurrence: '',
    recurrence_end_date: '',
    meet_link: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (conflict) setConflict(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(t('errors.titleRequired'));
      return false;
    }
    if (!formData.start_date_time) {
      setError(t('errors.startTimeRequired'));
      return false;
    }
    if (!formData.end_date_time) {
      setError(t('errors.endTimeRequired'));
      return false;
    }

    const startDate = new Date(formData.start_date_time);
    const endDate = new Date(formData.end_date_time);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setError(t('errors.invalidDateFormat'));
      return false;
    }

    if (endDate <= startDate) {
      setError(t('errors.endTimeAfterStart'));
      return false;
    }

    if (formData.recurrence && !formData.recurrence_end_date) {
      setError(t('errors.recurrenceEndRequired'));
      return false;
    }

    if (formData.recurrence_end_date) {
      const recurrenceEnd = new Date(formData.recurrence_end_date);
      if (isNaN(recurrenceEnd.getTime())) {
        setError(t('errors.invalidRecurrenceEnd'));
        return false;
      }
      if (recurrenceEnd <= startDate) {
        setError(t('errors.recurrenceEndAfterStart'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConflict(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409 && data.code === 'SCHEDULE_CONFLICT') {
          setConflict(data);
          setError(data.message || t('errors.scheduleConflict'));
        } else {
          setError(data.error || t('errors.createFailed'));
        }
        return;
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error creating lesson:', err);
      setError(t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t('createLesson.title')}</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293-1.293a1 1 0 101.414 1.414L10 11.414l1.293-1.293a1 1 0 001.414-1.414L11.414 10l1.293 1.293a1 1 0 001.414-1.414L12.414 10l1.293-1.293a1 1 0 00-1.414-1.414L11.414 10l-1.293 1.293a1 1 0 00-1.414 0L8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
              {conflict && (
                <button
                  onClick={() => {
                    // TODO: Show conflict details in a modal
                    alert('Conflict details:\n' + JSON.stringify(conflict, null, 2));
                  }}
                  className="mt-2 text-sm text-red-700 underline hover:text-red-900"
                >
                  {t('createLesson.viewConflictDetails')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            {t('createLesson.titleLabel')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('createLesson.titlePlaceholder')}
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            {t('createLesson.descriptionLabel')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('createLesson.descriptionPlaceholder')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start_date_time" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createLesson.startTimeLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="start_date_time"
              name="start_date_time"
              value={formData.start_date_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="end_date_time" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createLesson.endTimeLabel')} <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="end_date_time"
              name="end_date_time"
              value={formData.end_date_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
              {t('createLesson.recurrenceLabel')}
            </label>
            <select
              id="recurrence"
              name="recurrence"
              value={formData.recurrence}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('createLesson.noRecurrence')}</option>
              <option value="daily">{t('createLesson.daily')}</option>
              <option value="weekly">{t('createLesson.weekly')}</option>
              <option value="biweekly">{t('createLesson.biweekly')}</option>
              <option value="monthly">{t('createLesson.monthly')}</option>
            </select>
          </div>

          {formData.recurrence && (
            <div>
              <label htmlFor="recurrence_end_date" className="block text-sm font-medium text-gray-700 mb-1">
                {t('createLesson.recurrenceEndLabel')} <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                id="recurrence_end_date"
                name="recurrence_end_date"
                value={formData.recurrence_end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="meet_link" className="block text-sm font-medium text-gray-700 mb-1">
            {t('createLesson.meetLinkLabel')}
          </label>
          <input
            type="url"
            id="meet_link"
            name="meet_link"
            value={formData.meet_link}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('createLesson.meetLinkPlaceholder')}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('common.creating') : t('common.create')}
          </button>
        </div>
      </form>
    </div>
  );
}
