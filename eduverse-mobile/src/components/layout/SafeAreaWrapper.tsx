/**
 * SafeAreaWrapper layout component
 * Handles safe area insets and padding
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing } from '@/theme';

export interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: 'top' | 'bottom' | 'left' | 'right';
  disablePadding?: boolean;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges = 'top' | 'bottom',
  disablePadding = false,
}) => {
  const insets = useSafeAreaInsets();
  
  const getPaddingStyle = (): any => {
    const paddingStyles: any = {};
    
    if (!disablePadding) {
      if (edges === 'top' || edges === 'all') {
        paddingStyles.paddingTop = insets.top;
      }
      if (edges === 'bottom' || edges === 'all') {
        paddingStyles.paddingBottom = insets.bottom;
      }
      if (edges === 'left' || edges === 'all') {
        paddingStyles.paddingLeft = insets.left;
      }
      if (edges === 'right' || edges === 'all') {
        paddingStyles.paddingRight = insets.right;
      }
    }
    
    return paddingStyles;
  };

  return (
    <View style={[styles.container, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
