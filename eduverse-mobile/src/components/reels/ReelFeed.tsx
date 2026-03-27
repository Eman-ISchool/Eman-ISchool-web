/**
 * ReelFeed component
 * Displays infinite scroll of video reels
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useReels, useIsLoadingReels, useHasMoreReels, useReelsStore } from '@/store/reelsStore';
import { ReelCard } from './ReelCard';
import { spacing, colors, typography } from '@/theme';

export const ReelFeed: React.FC = () => {
  const { t } = useTranslation();
  const reels = useReels();
  const isLoading = useIsLoadingReels();
  const hasMore = useHasMoreReels();
  const fetchReels = useReelsStore(state => state.fetchReels);
  const fetchMoreReels = useReelsStore(state => state.fetchMoreReels);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchReels(true).finally(() => {
      setIsRefreshing(false);
    });
  }, [fetchReels]);

  const handleEndReached = useCallback(() => {
    if (!isLoading && !isRefreshing && hasMore) {
      fetchMoreReels();
    }
  }, [fetchMoreReels, isLoading, isRefreshing, hasMore]);

  const renderReelItem = ({ item }: { item: any }) => {
    return (
      <ReelCard
        reel={item}
        onPress={() => console.log('Open reel:', item.id)}
        onBookmark={() => console.log('Bookmark reel:', item.id)}
      />
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('reels.noReels')}</Text>
        <Text style={styles.emptySubtext}>{t('reels.noReelsSubtext')}</Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (isLoading && !isRefreshing) {
      return (
        <View style={styles.footerLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        renderItem={renderReelItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!isLoading ? renderEmptyState : undefined}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        refreshing={isRefreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    ...typography.textStyles.h3,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.textStyles.body,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  footerLoading: {
    paddingVertical: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  footerText: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
});

export default ReelFeed;
