/**
 * Common Modal component
 * Reusable modal with backdrop and animations
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Pressable,
  Dimensions,
} from 'react-native';
import { colors, spacing } from '@/theme';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  style,
}) => {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 375;

  return (
    <RNModal
      visible={visible}
      onRequestClose={onClose}
      transparent
      animationType="fade"
      statusBarTranslucent
      style={[styles.modal, isSmallScreen && styles.modalSmall, style]}
    >
      <View style={styles.container}>
        {title && (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.content}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: spacing.margin.lg,
    justifyContent: 'flex-end',
  },
  modalSmall: {
    margin: spacing.margin.md,
  },
  container: {
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.padding.lg,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.margin.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  closeButton: {
    padding: spacing.padding.sm,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  content: {
    flexGrow: 1,
  },
  footer: {
    marginTop: spacing.margin.md,
    paddingTop: spacing.margin.md,
  },
});
