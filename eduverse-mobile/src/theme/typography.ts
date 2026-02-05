import { TextStyle, Platform } from 'react-native';
import { colors } from './colors';

/**
 * Typography styles matching web app's design system
 * Platform-specific adjustments for iOS and Android
 */

const baseFontSize = Platform.select({
  ios: 14,
  android: 13,
});

export const typography = {
  // Font families
  fontFamily: {
    regular: Platform.select({
      ios: 'System',
      android: 'Roboto',
    }),
    medium: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    semibold: Platform.select({
      ios: 'System',
      android: 'Roboto-Medium',
    }),
    bold: Platform.select({
      ios: 'System',
      android: 'Roboto-Bold',
    }),
  },
  
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: baseFontSize,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Text styles
  textStyles: {
    // Headings
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      color: colors.textPrimary,
    } as TextStyle,
    
    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 38,
      color: colors.textPrimary,
    } as TextStyle,
    
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      color: colors.textPrimary,
    } as TextStyle,
    
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 28,
      color: colors.textPrimary,
    } as TextStyle,
    
    // Body text
    body: {
      fontSize: baseFontSize,
      fontWeight: '400' as const,
      lineHeight: 22,
      color: colors.textPrimary,
    } as TextStyle,
    
    bodySmall: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 18,
      color: colors.textSecondary,
    } as TextStyle,
    
    // Labels
    label: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
    } as TextStyle,
    
    // Buttons
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
      color: colors.textInverse,
    } as TextStyle,
    
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 20,
      color: colors.textInverse,
    } as TextStyle,
    
    // Captions
    caption: {
      fontSize: 10,
      fontWeight: '400' as const,
      lineHeight: 14,
      color: colors.textTertiary,
    } as TextStyle,
    
    // Links
    link: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
      color: colors.primary,
    } as TextStyle,
    
    // Code
    code: {
      fontFamily: Platform.select({
        ios: 'Courier',
        android: 'Roboto-Mono',
      }),
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
      color: colors.textPrimary,
    } as TextStyle,
  },
} as const;

export type TypographyKey = keyof typeof typography;
export type TextStyleKey = keyof typeof typography.textStyles;
