/**
 * Tabs component
 * Horizontal scrollable tab bar, RTL-aware
 */

import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  ViewStyle,
} from 'react-native';
import { colors, spacing, typography } from '@/theme';

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
  style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  style,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const isRTL = I18nManager.isRTL;

  const handleTabPress = useCallback(
    (key: string) => {
      onTabChange(key);
    },
    [onTabChange],
  );

  return (
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRTL,
        ]}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => handleTabPress(tab.key)}
              style={[styles.tab, isActive && styles.tabActive]}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  scrollContent: {
    flexDirection: 'row',
    paddingHorizontal: spacing.padding.lg,
    gap: spacing.gap.sm,
  },
  scrollContentRTL: {
    flexDirection: 'row-reverse',
  },
  tab: {
    paddingVertical: spacing.padding.md,
    paddingHorizontal: spacing.padding.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    ...typography.textStyles.body,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
});
