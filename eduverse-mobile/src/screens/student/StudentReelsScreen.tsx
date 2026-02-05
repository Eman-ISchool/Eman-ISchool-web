import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { ReelCard } from '@/components/reels';
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/common';
import { useReelsStore } from '@/store/reelsStore';
import { getReelsFeed, updateReelProgress, toggleReelBookmark, markReelUnderstood } from '@/api/reels';
import type { ReelFeedItem } from '@/types/api';

export function StudentReelsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const {
    reels,
    isLoading,
    error,
    hasMore,
    setReels,
    setLoading,
    setError,
    setHasMore,
  } = useReelsStore();

  const [page, setPage] = useState(1);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (reels.length === 0) {
      fetchReels(1);
    }
  }, []);

  const fetchReels = async (pageNum: number) => {
    try {
      setFetching(true);
      setLoading(true);
      setError(null);
      
      const response = await getReelsFeed({ page: pageNum, limit: 20 });
      
      if (pageNum === 1) {
        setReels(response.data);
      } else {
        setReels([...reels, ...response.data]);
      }
      
      setHasMore(response.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
    } finally {
      setFetching(false);
      setLoading(false);
    }
  };

  const handleRefresh = useCallback(() => {
    fetchReels(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore && !fetching) {
      const nextPage = page + 1;
      fetchReels(nextPage);
    }
  }, [isLoading, hasMore, fetching, page]);

  const handleReelPress = useCallback((reel: ReelFeedItem) => {
    (navigation.navigate as any)('ReelDetail', { reelId: reel.id });
  }, [navigation]);

  const handleProgressUpdate = useCallback(async (reelId: string, watchedSeconds: number) => {
    try {
      await updateReelProgress(reelId, watchedSeconds);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }, []);

  const handleBookmarkToggle = useCallback(async (reelId: string, isBookmarked: boolean) => {
    try {
      await toggleReelBookmark(reelId);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  }, []);

  const handleMarkUnderstood = useCallback(async (reelId: string) => {
    try {
      await markReelUnderstood(reelId);
    } catch (err) {
      console.error('Failed to mark as understood:', err);
    }
  }, []);

  const renderFooter = useCallback(() => {
    if (!isLoading && !fetching) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="large" color="#0D9488" />
      </View>
    );
  }, [isLoading, fetching]);

  if (error && reels.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message={error}
          onRetry={handleRefresh}
        />
      </SafeAreaView>
    );
  }

  if (!isLoading && reels.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          title={t('reels.noReels')}
          message={t('reels.noReelsDescription')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={reels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleReelPress(item)}
            activeOpacity={0.7}
          >
            <ReelCard
              reel={item}
              onProgressUpdate={handleProgressUpdate}
              onBookmarkToggle={handleBookmarkToggle}
              onMarkUnderstood={handleMarkUnderstood}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#0D9488']}
            tintColor="#0D9488"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
