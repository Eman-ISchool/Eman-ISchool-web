// Main Admin Components
export { default as AdminLayout } from './AdminLayout';

// UI Components
export { default as Topbar } from './Topbar';
export { default as PageHeader } from './PageHeader';
export { default as TabPanel, TabContent } from './TabPanel';
export { default as CardView } from './CardView';
export { default as DataTable } from './DataTable';
export { default as DropdownMenu, StandardActionsDropdown } from './DropdownMenu';
export { default as Modal, FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from './Modal';

// Form Components
export { FormField, InputField, TextareaField, SelectField, CheckboxField, RadioGroup } from './FormField';

// Button Components
export { Button, IconButton, ButtonGroup, LinkButton } from './Button';

// State Components
export { LoadingState, ErrorState, EmptyState, CardSkeleton, TableRowSkeleton, TableSkeleton } from './StateComponents';

// Dashboard Components
export { default as KPIStatCard } from './KPIStatCard';
export { default as DateRangeFilter } from './DateRangeFilter';

// DashboardChart: use dynamic import to avoid loading recharts (~200KB) eagerly
// Import directly: import DashboardChart from '@/components/admin/DashboardChart'
// Or use: const DashboardChart = dynamic(() => import('@/components/admin/DashboardChart'), { ssr: false })

// Types
export type { Column, DataTableProps } from './DataTable';
export type { DropdownItem, DropdownMenuProps } from './DropdownMenu';
export type { Tab, TabPanelProps, TabContentProps } from './TabPanel';
export type { Card, CardViewProps } from './CardView';
export type { ButtonProps, IconButtonProps, ButtonGroupProps, LinkButtonProps } from './Button';
export type { FormFieldProps, InputFieldProps, TextareaFieldProps, SelectFieldProps, CheckboxFieldProps, RadioGroupProps } from './FormField';
export type { LoadingStateProps, ErrorStateProps, EmptyStateProps } from './StateComponents';
export type { KPIStatCardProps } from './KPIStatCard';
export type { DashboardChartProps, ChartDataPoint } from './DashboardChart';
export type { DateRangeFilterProps } from './DateRangeFilter';
export type { PageHeaderProps } from './PageHeader';
export type { ModalProps } from './Modal';
