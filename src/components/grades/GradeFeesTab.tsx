'use client';

/**
 * Grade Fees Tab Component
 * 
 * Displays fee information for a grade including:
 * - Fee summary statistics
 * - Invoice items list
 * - Payment status
 * - Student information
 * - Filter by fee type and payment status
 */

import React, { useState, useEffect, memo } from 'react';
import { useLocale } from 'next-intl';

export interface GradeFeesTabProps {
  gradeId: string;
  data?: any;
  onLoad: (data: any) => void;
  onError: () => void;
  onLoadingStart: () => void;
  onLoadingEnd: () => void;
}

const GradeFeesTab = memo<GradeFeesTabProps>(({
  gradeId,
  data,
  onLoad,
  onError,
  onLoadingStart,
  onLoadingEnd,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [fees, setFees] = useState<any[]>(data?.fees || []);
  const [summary, setSummary] = useState<any>(data?.summary || null);
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('');

  useEffect(() => {
    if (data) {
      setFees(data.fees);
      setSummary(data.summary);
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    const loadFees = async () => {
      if (data) return; // Use cached data if available

      onLoadingStart();
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/grades/${gradeId}/fees`);
        if (!response.ok) {
          throw new Error('Failed to fetch fees');
        }
        const feesData = await response.json();
        setFees(feesData.fees);
        setSummary(feesData.summary);
        onLoad(feesData);
      } catch (err) {
        console.error('Error loading fees:', err);
        setError('Failed to load fees');
        onError();
      } finally {
        setLoading(false);
        onLoadingEnd();
      }
    };

    loadFees();
  }, [gradeId, data, onLoad, onError, onLoadingStart, onLoadingEnd]);

  const filteredFees = fees.filter(fee => {
    // Apply status filter
    if (statusFilter !== 'all' && fee.status !== statusFilter) {
      return false;
    }

    // Apply type filter
    if (typeFilter && !fee.description.toLowerCase().includes(typeFilter.toLowerCase())) {
      return false;
    }

    return true;
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'partial':
        return 'yellow';
      case 'pending':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="grade-fees-tab loading">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grade-fees-tab error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>{isArabic ? 'إعادة المحاولة' : 'Retry'}</button>
      </div>
    );
  }

  return (
    <div className="grade-fees-tab">
      {/* Summary Statistics */}
      {summary && (
        <div className="fees-summary">
          <h2>{isArabic ? 'ملخص الرسوم' : 'Fee Summary'}</h2>
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-label">{isArabic ? 'إجمالي الرسوم' : 'Total Fees'}</div>
              <div className="card-value">
                {formatCurrency(summary.total_fees, 'USD')}
              </div>
            </div>
            <div className="summary-card">
              <div className="card-label">{isArabic ? 'إجمالي المدفوع' : 'Total Paid'}</div>
              <div className="card-value text-green">
                {formatCurrency(summary.total_paid, 'USD')}
              </div>
            </div>
            <div className="summary-card">
              <div className="card-label">{isArabic ? 'الرصيد المتبقي' : 'Outstanding Balance'}</div>
              <div className="card-value text-red">
                {formatCurrency(summary.total_balance, 'USD')}
              </div>
            </div>
            <div className="summary-card">
              <div className="card-label">{isArabic ? 'حالة الدفع' : 'Payment Status'}</div>
              <div className="card-stats">
                <div className="stat">
                  <span className="stat-count text-green">{summary.paid_count}</span>
                  <span className="stat-label">{isArabic ? 'مدفوع' : 'Paid'}</span>
                </div>
                <div className="stat">
                  <span className="stat-count text-yellow">{summary.partial_count}</span>
                  <span className="stat-label">{isArabic ? 'جزئي' : 'Partial'}</span>
                </div>
                <div className="stat">
                  <span className="stat-count text-red">{summary.pending_count}</span>
                  <span className="stat-label">{isArabic ? 'معلق' : 'Pending'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fees List */}
      <div className="fees-list-header">
        <h2>{isArabic ? `عناصر الرسوم (${filteredFees.length})` : `Fee Items (${filteredFees.length})`}</h2>
        <div className="fees-filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
            aria-label="Filter fees by payment status"
          >
            <option value="all">{isArabic ? 'جميع الحالات' : 'All Status'}</option>
            <option value="paid">{isArabic ? 'مدفوع' : 'Paid'}</option>
            <option value="partial">{isArabic ? 'جزئي' : 'Partial'}</option>
            <option value="pending">{isArabic ? 'معلق' : 'Pending'}</option>
          </select>
          <input
            type="text"
            placeholder={isArabic ? 'تصفية حسب النوع...' : 'Filter by type...'}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="filter-input"
            aria-label="Filter fees by type"
          />
        </div>
      </div>

      {filteredFees.length === 0 ? (
        <div className="empty-state">
          <p>{isArabic ? 'لم يتم العثور على رسوم.' : 'No fees found.'}</p>
        </div>
      ) : (
        <div className="fees-table">
          <table>
            <thead>
              <tr>
                <th>{isArabic ? 'الوصف' : 'Description'}</th>
                <th>{isArabic ? 'الطالب' : 'Student'}</th>
                <th>{isArabic ? 'المادة' : 'Course'}</th>
                <th>{isArabic ? 'المبلغ' : 'Amount'}</th>
                <th>{isArabic ? 'المدفوع' : 'Paid'}</th>
                <th>{isArabic ? 'الرصيد' : 'Balance'}</th>
                <th>{isArabic ? 'الحالة' : 'Status'}</th>
                <th>{isArabic ? 'الفاتورة' : 'Invoice'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.map(fee => (
                <tr key={fee.id}>
                  <td className="description-cell">{fee.description}</td>
                  <td className="student-cell">
                    {fee.student ? (
                      <a href={`/admin/students/${fee.student.id}`}>
                        {fee.student.name}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="course-cell">
                    {fee.course_title ? (
                      <a href={`/admin/courses/${fee.course_id}`}>
                        {fee.course_title}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(fee.total, fee.invoice?.currency || 'USD')}
                  </td>
                  <td className="paid-cell text-green">
                    {formatCurrency(fee.total_paid, fee.invoice?.currency || 'USD')}
                  </td>
                  <td className={`balance-cell ${fee.balance > 0 ? 'text-red' : 'text-green'}`}>
                    {formatCurrency(fee.balance, fee.invoice?.currency || 'USD')}
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${getStatusColor(fee.status)}`}>
                      {isArabic ? (fee.status === 'paid' ? 'مدفوع' : fee.status === 'partial' ? 'جزئي' : fee.status === 'pending' ? 'معلق' : fee.status) : fee.status}
                    </span>
                  </td>
                  <td className="invoice-cell">
                    {fee.invoice ? (
                      <a href={`/admin/invoices/${fee.invoice.invoice_number}`}>
                        {fee.invoice.invoice_number}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
});

GradeFeesTab.displayName = 'GradeFeesTab';

export default GradeFeesTab;
