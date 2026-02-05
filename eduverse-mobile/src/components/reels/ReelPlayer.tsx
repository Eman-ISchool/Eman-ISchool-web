/**
 * ReelPlayer component
 * Full-featured video player with react-native-video
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Video, { Slider } from 'react-native-video';
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
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = reel.progress.durationSeconds || 0;
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  const handlePlaybackRateChange = useCallback((rate: number) => {
    // TODO: Implement playback rate change
    console.log('Playback rate:', rate);
  }, []);

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
      } else {
        videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = (value: number) => {
    if (videoRef.current && duration > 0) {
      videoRef.current.seek(value);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    } else if (remainingSeconds > 0) {
      return `0:${remainingSeconds.toString().padStart(2, '0')}`;
    } else {
      return `0:${seconds.toString().padStart(2, '0')}`;
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
      {/* Video Player */}
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

        {/* Controls Overlay */}
        <Pressable 
          onPress={togglePlayPause}
          style={styles.playPauseButton}
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

        <Pressable 
          onPress={toggleFullscreen}
          style={styles.controlButton}
          testID="video-fullscreen"
        >
          <Text style={styles.controlIcon}>{isFullscreen ? '⛶' : '⛶'}</Text>
        </Pressable>

        {/* Progress Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={currentTime}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor={colors.backgroundSecondary}
            maximumTrackTintColor={colors.primary}
            thumbTintColor={colors.primary}
            testID="video-seek-slider"
          />
        </View>

        {/* Time Display */}
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeSeparator}>/</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
          <Text style={styles.progressText}>{getProgressPercentage()}%</Text>
        </View>

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          style={styles.closeButton}
          testID="video-close"
        >
          <Text style={styles.closeButtonText}>{t('reels.close')}</Text>
        </Pressable>
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
  playPauseButton: {
    backgroundColor: colors.primary,
  },
  sliderContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  slider: {
    height: 40,
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
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 2,
    flex: 1,
  },
  progressText: {
    ...typography.textStyles.caption,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  closeButtonText: {
    ...typography.textStyles.button,
    color: colors.textInverse,
  },
});

export default ReelPlayer;
