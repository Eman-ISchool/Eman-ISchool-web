import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ReelPlayer } from '@/components/reels';
import { LoadingSpinner, ErrorState, Button } from '@/components/common';
import { useReelsStore } from '@/store/reelsStore';
import { getReelById, updateReelProgress, toggleReelBookmark, markReelUnderstood, reportReel } from '@/api/reels';
import type { ReelDetailResponse } from '@/types/api';
import { useLanguage } from '@/hooks/useLanguage';

interface RouteParams {
  reelId: string;
}

export function ReelDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { reelId } = route.params as RouteParams;
  
  const [reel, setReel] = useState<ReelDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isUnderstood, setIsUnderstood] = useState(false);

  const { setReels } = useReelsStore();

  useEffect(() => {
    loadReel();
  }, [reelId]);

  const loadReel = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getReelById(reelId);
      setReel(data);
      setIsBookmarked(data.isBookmarked || false);
      setIsUnderstood(data.isUnderstood || false);
      setCurrentTime(data.watchedSeconds || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = useCallback(async (time: number) => {
    setCurrentTime(time);
    try {
      await updateReelProgress(reelId, time);
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  }, [reelId]);

  const handleBookmarkToggle = useCallback(async () => {
    const newBookmarkStatus = !isBookmarked;
    setIsBookmarked(newBookmarkStatus);
    try {
      await toggleReelBookmark(reelId);
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
      setIsBookmarked(!newBookmarkStatus);
    }
  }, [reelId, isBookmarked]);

  const handleMarkUnderstood = useCallback(async () => {
    setIsUnderstood(true);
    try {
      await markReelUnderstood(reelId);
      Alert.alert(t('reels.understood'), t('reels.markedAsUnderstood'));
    } catch (err) {
      console.error('Failed to mark as understood:', err);
      setIsUnderstood(false);
    }
  }, [reelId, t]);

  const handleReport = useCallback(() => {
    Alert.alert(
      t('reels.report'),
      t('reels.reportConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await reportReel(reelId, 'inappropriate');
              Alert.alert(t('reels.reported'), t('reels.reportedMessage'));
            } catch (err) {
              Alert.alert(t('errors.error'), t('errors.reportFailed'));
            }
          },
        },
      ]
    );
  }, [reelId, t]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error || !reel) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorState
          message={error || t('errors.reelNotFound')}
          onRetry={loadReel}
        />
      </SafeAreaView>
    );
  }

  const title = language === 'ar' ? reel.titleAr : reel.titleEn;
  const description = language === 'ar' ? reel.descriptionAr : reel.descriptionEn;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView}>
        <ReelPlayer
          reel={reel}
          currentTime={currentTime}
          onProgressUpdate={handleProgressUpdate}
          onBookmarkToggle={handleBookmarkToggle}
          onMarkUnderstood={handleMarkUnderstood}
        />
        
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.metaRow}>
            {reel.subject && (
              <Text style={styles.subject}>{reel.subject}</Text>
            )}
            <Text style={styles.duration}>{formatDuration(reel.durationSeconds)}</Text>
          </View>
          
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          
          <View style={styles.actions}>
            <Button
              title={isUnderstood ? t('reels.understood') : t('reels.markAsUnderstood')}
              onPress={handleMarkUnderstood}
              variant={isUnderstood ? 'secondary' : 'primary'}
              disabled={isUnderstood}
              style={styles.actionButton}
            />
            
            <Button
              title={t('reels.report')}
              onPress={handleReport}
              variant="outline"
              style={styles.actionButton}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  subject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0D9488',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
    marginBottom: 24,
  },
  actions: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
});
