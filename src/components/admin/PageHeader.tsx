'use client';

import { ReactNode } from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  primaryAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  secondaryActions?: Array<{
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  }>;
  backHref?: string;
  backLabel?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  primaryAction,
  secondaryActions,
  backHref,
  backLabel,
}: PageHeaderProps) {
  const t = useTranslations();
  const isRTL = t('dir') === 'rtl';

  return (
    <header className="mb-6">
      <div className="flex items-center justify-between">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center gap-1">
                  {crumb.href ? (
                    <a
                      href={crumb.href}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span className="text-gray-700">{crumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Back Button */}
        {backHref && (
          <a
            href={backHref}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span>{backLabel || t('common.back')}</span>
          </a>
        )}

        {/* Title and Subtitle */}
        <div className="flex-1 items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                {primaryAction.icon && (
                  <span className="flex items-center">{primaryAction.icon}</span>
                )}
                <span>{primaryAction.label}</span>
              </button>
            )}

            {secondaryActions && secondaryActions.length > 0 && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    secondaryActions[0].onClick();
                  }}
                  className="flex items-center gap-2 text-sm text-gray-700 bg-white border border-gray-200 px-3 py-2 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                  <span>{t('common.actions')}</span>
                </button>

                {/* Dropdown Menu */}
                {secondaryActions.length > 1 && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {secondaryActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick()}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors"
                        >
                          {action.icon && (
                            <span className="flex items-center gap-2">
                              {action.icon}
                            </span>
                          )}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default PageHeader;
