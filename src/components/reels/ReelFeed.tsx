'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface Reel {
  id: string;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  teacher_id: string;
  is_bookmarked?: boolean;
  is_understood?: boolean;
  progress?: number;
}

export interface ReelFeedProps {
  reels: Reel[];
  onReelChange?: (reelId: string, index: number) => void;
  onBookmark?: (reelId: string) => Promise<void>;
  onUnderstood?: (reelId: string) => Promise<void>;
  onProgressUpdate?: (reelId: string, progress: number, lastPosition: number) => Promise<void>;
  className?: string;
}

export default function ReelFeed({
  reels,
  onReelChange,
  onBookmark,
  onUnderstood,
  onProgressUpdate,
  className = '',
}: ReelFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const currentReel = reels[currentIndex];

  // Handle reel change
  const handleReelChange = useCallback((index: number) => {
    if (index < 0 || index >= reels.length) return;
    
    setCurrentIndex(index);
    onReelChange?.(reels[index].id, index);

    // Pause previous video
    if (videoRefs.current[currentIndex]) {
      videoRefs.current[currentIndex]?.pause();
    }

    // Play new video
    if (videoRefs.current[index]) {
      videoRefs.current[index]?.play();
    }
  }, [currentIndex, reels, onReelChange]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSwipeDown = distance < -50;
    const isSwipeUp = distance > 50;

    if (isSwipeUp) {
      handleReelChange(currentIndex + 1);
    } else if (isSwipeDown) {
      handleReelChange(currentIndex - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        handleReelChange(currentIndex - 1);
      } else if (e.key === 'ArrowDown') {
        handleReelChange(currentIndex + 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      } else if (e.key === 'm') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, handleReelChange]);

  // Auto-play current video
  useEffect(() => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo && isPlaying) {
      currentVideo.play().catch((error) => {
        console.error('[ReelFeed] Error playing video:', error);
      });
    }
  }, [currentIndex, isPlaying]);

  // Handle video progress update
  const handleTimeUpdate = (reelId: string, video: HTMLVideoElement) => {
    if (!video.duration) return;

    const progress = (video.currentTime / video.duration) * 100;
    onProgressUpdate?.(reelId, progress, video.currentTime);
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      if (currentVideo.paused) {
        currentVideo.play();
        setIsPlaying(true);
      } else {
        currentVideo.pause();
        setIsPlaying(false);
      }
    }
  };

  // Toggle mute
  const toggleMute = () => {
    const currentVideo = videoRefs.current[currentIndex];
    if (currentVideo) {
      currentVideo.muted = !currentVideo.muted;
      setIsMuted(currentVideo.muted);
    }
  };

  // Handle bookmark
  const handleBookmark = async () => {
    if (onBookmark && currentReel) {
      await onBookmark(currentReel.id);
    }
  };

  // Handle understood
  const handleUnderstood = async () => {
    if (onUnderstood && currentReel) {
      await onUnderstood(currentReel.id);
    }
  };

  if (!reels.length) {
    return (
      <div className={`reel-feed-empty ${className}`}>
        <div className="empty-state">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="empty-icon"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <p className="empty-text">No reels available</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`reel-feed ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className={`reel-item ${index === currentIndex ? 'active' : ''}`}
          style={{ transform: `translateY(${(index - currentIndex) * 100}%)` }}
        >
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            className="reel-video"
            src={reel.video_url}
            poster={reel.thumbnail_url}
            loop
            playsInline
            muted={isMuted}
            onClick={togglePlayPause}
            onTimeUpdate={(e) => handleTimeUpdate(reel.id, e.currentTarget)}
            onEnded={() => handleReelChange(currentIndex + 1)}
          />

          {/* Video Controls Overlay */}
          <div className="video-overlay">
            {/* Right Side Actions */}
            <div className="side-actions">
              {/* Bookmark Button */}
              <button
                className="action-button bookmark-button"
                onClick={handleBookmark}
                aria-label={reel.is_bookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={reel.is_bookmarked ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <span className="action-label">Save</span>
              </button>

              {/* Understood Button */}
              <button
                className="action-button understood-button"
                onClick={handleUnderstood}
                aria-label={reel.is_understood ? 'Mark as not understood' : 'Mark as understood'}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={reel.is_understood ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="action-label">Got it!</span>
              </button>

              {/* Mute Button */}
              <button
                className="action-button mute-button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
                    />
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Bottom Info */}
            <div className="reel-info">
              <h3 className="reel-title">{reel.title_en}</h3>
              <p className="reel-description">{reel.description_en}</p>
              {reel.progress !== undefined && reel.progress > 0 && (
                <div className="reel-progress">
                  <div
                    className="reel-progress-bar"
                    style={{ width: `${reel.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Play/Pause Indicator */}
            {!isPlaying && (
              <div className="play-indicator" onClick={togglePlayPause}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="white"
                  stroke="none"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .reel-feed {
          width: 100%;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background: #000;
        }

        .reel-feed-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: #f9fafb;
        }

        .empty-state {
          text-align: center;
          color: #6b7280;
        }

        .empty-icon {
          margin-bottom: 16px;
        }

        .empty-text {
          font-size: 18px;
          font-weight: 500;
        }

        .reel-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease-out;
          opacity: 0;
        }

        .reel-item.active {
          opacity: 1;
          z-index: 1;
        }

        .reel-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          background: #000;
        }

        .video-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          pointer-events: none;
        }

        .side-actions {
          position: absolute;
          right: 16px;
          bottom: 120px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          pointer-events: auto;
        }

        .action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.5);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .action-button:hover {
          background: rgba(0, 0, 0, 0.7);
          transform: scale(1.1);
        }

        .action-button.bookmark-button {
          color: ${currentReel?.is_bookmarked ? '#fbbf24' : 'white'};
        }

        .action-button.understood-button {
          color: ${currentReel?.is_understood ? '#10b981' : 'white'};
        }

        .action-label {
          font-size: 11px;
          font-weight: 600;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        .reel-info {
          position: absolute;
          bottom: 16px;
          left: 16px;
          right: 80px;
          color: white;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          pointer-events: auto;
        }

        .reel-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .reel-description {
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 12px;
          opacity: 0.95;
        }

        .reel-progress {
          width: 100%;
          height: 3px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 2px;
          overflow: hidden;
        }

        .reel-progress-bar {
          height: 100%;
          background: #3b82f6;
          transition: width 0.1s linear;
        }

        .play-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
          pointer-events: auto;
          opacity: 0.8;
          transition: opacity 0.2s ease;
        }

        .play-indicator:hover {
          opacity: 1;
        }

        @media (max-width: 640px) {
          .side-actions {
            right: 12px;
            bottom: 100px;
          }

          .action-button {
            width: 44px;
            height: 44px;
          }

          .reel-info {
            bottom: 12px;
            left: 12px;
            right: 72px;
          }

          .reel-title {
            font-size: 16px;
          }

          .reel-description {
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
}
