import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type CourseStatusFilter = 'all' | 'active' | 'upcoming' | 'completed';

export interface CourseStatusTabsProps {
  value: CourseStatusFilter;
  onChange: (value: CourseStatusFilter) => void;
  className?: string;
}

const STATUS_LABELS: Record<CourseStatusFilter, string> = {
  all: 'جميع',
  active: 'نشطة',
  upcoming: 'قادمة',
  completed: 'مكتملة',
};

export function CourseStatusTabs({
  value,
  onChange,
  className = '',
}: CourseStatusTabsProps) {
  return (
    <Tabs
      value={value}
      onValueChange={(newValue) => onChange(newValue as CourseStatusFilter)}
      className={className}
    >
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="all">{STATUS_LABELS.all}</TabsTrigger>
        <TabsTrigger value="active">{STATUS_LABELS.active}</TabsTrigger>
        <TabsTrigger value="upcoming">{STATUS_LABELS.upcoming}</TabsTrigger>
        <TabsTrigger value="completed">{STATUS_LABELS.completed}</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
