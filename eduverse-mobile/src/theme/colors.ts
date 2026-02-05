/**
 * Color palette matching web app's TailwindCSS theme
 * Extracted from globals.css @theme variables
 */

export const colors = {
  // Primary brand colors
  primary: '#0D9488',
  primaryHover: '#0F766E',
  primaryLight: '#CCFBF1',
  
  // Brand colors
  brandPrimary: '#FFD501',
  brandDark: '#111111',
  
  // Text colors
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  backgroundTertiary: '#F3F4F6',
  
  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Status colors
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // Semantic colors
  online: '#10B981',
  offline: '#6B7280',
  unread: '#F59E0B',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.8)',
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  
  // Grayscale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Role-based colors
  student: '#3B82F6',
  teacher: '#10B981',
  parent: '#F59E0B',
  admin: '#8B5CF6',
  
  // RTL-aware (will be used with conditional logic)
  rtl: {
    left: 'right',
    right: 'left',
  },
  ltr: {
    left: 'left',
    right: 'right',
  },
} as const;

export type ColorKey = keyof typeof colors;
