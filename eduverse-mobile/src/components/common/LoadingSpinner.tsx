/**
 * LoadingSpinner component
 * Activity indicator for loading states
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '@/theme';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = colors.primary,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'medium':
        return 36;
      case 'large':
        return 48;
      default:
        return 36;
    }
  };

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size={getSize()}
        color={color}
        animating={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
