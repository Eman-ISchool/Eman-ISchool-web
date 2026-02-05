/**
 * Spacing constants matching web app's TailwindCSS spacing scale
 * Consistent spacing across all components
 */

export const spacing = {
  // Base spacing unit (4px)
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  '7xl': 80,
  '8xl': 96,
  
  // Component-specific spacing
  padding: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  
  margin: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  
  // Gap (for flex/grid)
  gap: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  
  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 40,
    '3xl': 48,
  },
  
  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },
  
  // Screen padding (safe area aware)
  screen: {
    horizontal: 16,
    vertical: 12,
  },
  
  // Card spacing
  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },
  
  // Button spacing
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  
  // Input spacing
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  
  // Tab bar spacing
  tabBar: {
    height: 60,
    paddingVertical: 8,
    iconSize: 24,
  },
  
  // Header spacing
  header: {
    height: 56,
    paddingHorizontal: 16,
  },
} as const;

export type SpacingKey = keyof typeof spacing;
