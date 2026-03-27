/**
 * ReelControls component
 * Video playback controls (play/pause/seek/volume/mute/fullscreen)
 */

import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, colors, typography } from '@/theme';

interface ReelControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  onPlayPause?: () => void;
  onSeek?: (value: number) => void;
  onVolumeChange?: (value: number) => void;
  onMute?: () => void;
  onFullscreen?: () => void;
}

export const ReelControls: React.FC<ReelControlsProps> = ({
  isPlaying,
  isMuted,
  isFullscreen,
  currentTime,
  duration,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMute,
  onFullscreen,
}) => {
  const { t } = useTranslation();

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return t('reels.durationMinutes', { minutes, seconds: remainingSeconds });
    } else if (remainingSeconds > 0) {
      return t('reels.durationSeconds', { seconds: remainingSeconds });
    } else {
      return t('reels.durationLessThanMinute', { seconds });
    }
  };

  const getProgressPercentage = () => {
    if (duration > 0) {
      return Math.round((currentTime / duration) * 100);
    }
    return 0;
  };

  return (
    <View style={styles.container}>
      {/* Left Controls */}
      <View style={styles.leftControls}>
        <Pressable
          onPress={onPlayPause}
          style={styles.controlButton}
          testID="video-play-pause"
        >
          <Text style={styles.controlIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </Pressable>

        <View style={styles.volumeContainer}>
          <Pressable
            onPress={onMute}
            style={styles.volumeButton}
            testID="video-mute"
          >
            <Text style={styles.controlIcon}>{isMuted ? '🔇' : '🔊'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Right Controls */}
      <View style={styles.rightControls}>
        <Pressable
          onPress={onFullscreen}
          style={styles.controlButton}
          testID="video-fullscreen"
        >
          <Text style={styles.controlIcon}>{isFullscreen ? '⛶' : '⛶'}</Text>
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getProgressPercentage()}%` }]} />
        </View>
        <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
      </View>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{formatTime(currentTime)}</Text>
        <Text style={styles.timeSeparator}>/</Text>
        <Text style={styles.time}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.sm,
  },
  controlIcon: {
    fontSize: 20,
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.sm,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    flex: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    ...typography.textStyles.caption,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  time: {
    ...typography.textStyles.caption,
    color: colors.textInverse,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  timeSeparator: {
    color: colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
});

export default ReelControls;
