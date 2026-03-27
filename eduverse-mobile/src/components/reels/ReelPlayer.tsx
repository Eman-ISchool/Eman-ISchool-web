/**
 * ReelPlayer component
 * Full-featured video player with react-native-video
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Video from 'react-native-video';
import { spacing, colors, typography } from '@/theme';
import type { ReelDetailResponse } from '@/types/api';

interface ReelPlayerProps {
  reel: ReelDetailResponse;
  onClose?: () => void;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({
  reel,
  onClose,
}) => {
  const { t } = useTranslation();
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(reel.durationSeconds || 0);

  const handleLoad = (meta: any) => {
    if (meta.duration) {
      setDuration(meta.duration);
    }
  };

  const handleProgress = (data: any) => {
    if (data.currentTime) {
      setCurrentTime(data.currentTime);
    }
  };

  const handleEnd = () => {
    setIsPlaying(false);
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && duration > 0) {
      videoRef.current.seek(value);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (duration > 0) {
      return Math.round((currentTime / duration) * 100);
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={styles.video}
          resizeMode="contain"
          onLoad={handleLoad}
          onProgress={handleProgress}
          onEnd={handleEnd}
          paused={!isPlaying}
          muted={isMuted}
          volume={isMuted ? 0 : 1.0}
          controls={false}
          repeat={false}
        />
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <Pressable
          onPress={togglePlayPause}
          style={styles.controlButton}
          testID="video-play-pause"
        >
          <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>

        <Pressable
          onPress={toggleMute}
          style={styles.controlButton}
          testID="video-mute"
        >
          <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
        </Pressable>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        {/* Progress */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
        </View>

        {onClose && (
          <Pressable
            onPress={onClose}
            style={styles.controlButton}
            testID="video-close"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  videoContainer: {
    aspectRatio: 16 / 9,
    backgroundColor: 'black',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.xs,
  },
  controlIcon: {
    fontSize: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.textSecondary,
  },
  timeSeparator: {
    color: colors.textSecondary,
    marginHorizontal: 2,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: spacing.sm,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.textPrimary,
    fontWeight: '600' as const,
  },
});

export default ReelPlayer;
