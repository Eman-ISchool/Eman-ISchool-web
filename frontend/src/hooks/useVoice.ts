'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { WebRTCManager, type WebRTCCallbacks } from '../lib/webrtc';
import * as socketService from '../services/socket';
import { SocketEvents } from '../../../shared/constants';
import type { WebRTCSignalPayload } from '../../../shared/types';

// ─── useVoice Hook ──────────────────────────────────────────────

export interface UseVoiceReturn {
  isMuted: boolean;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isConnecting: boolean;
  error: string | null;
  initMicrophone: () => Promise<void>;
  toggleMute: () => void;
  cleanup: () => void;
}

export function useVoice(roomId: string | null): UseVoiceReturn {
  const [isMuted, setIsMuted] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebRTC manager with callbacks
  const getWebRTC = useCallback((): WebRTCManager => {
    if (!webrtcRef.current) {
      const callbacks: WebRTCCallbacks = {
        onRemoteStream: (peerId, stream) => {
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.set(peerId, stream);
            return next;
          });
        },
        onIceCandidate: (peerId, candidate) => {
          if (roomId) {
            socketService.sendWebRTCSignal(roomId, peerId, {
              type: 'ice-candidate',
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex,
            });
          }
        },
        onConnectionStateChange: (peerId, state) => {
          if (state === 'failed' || state === 'closed') {
            setRemoteStreams((prev) => {
              const next = new Map(prev);
              next.delete(peerId);
              return next;
            });
          }
        },
      };
      webrtcRef.current = new WebRTCManager(callbacks);
    }
    return webrtcRef.current;
  }, [roomId]);

  // Request microphone access
  const initMicrophone = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      localStreamRef.current = stream;
      setLocalStream(stream);

      // Start muted by default
      for (const track of stream.getAudioTracks()) {
        track.enabled = false;
      }
      setIsMuted(true);

      // Add stream to WebRTC manager
      const webrtc = getWebRTC();
      webrtc.addLocalStream(stream);
    } catch (err) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            setError(
              'Microphone access was denied. Please allow microphone access in your browser settings.',
            );
            break;
          case 'NotFoundError':
            setError(
              'No microphone found. Please connect a microphone and try again.',
            );
            break;
          case 'NotReadableError':
            setError(
              'Microphone is already in use by another application.',
            );
            break;
          default:
            setError(`Microphone error: ${err.message}`);
        }
      } else {
        setError('Failed to access microphone.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [getWebRTC]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const newMuted = !isMuted;
    for (const track of stream.getAudioTracks()) {
      track.enabled = !newMuted;
    }
    setIsMuted(newMuted);

    // Notify server
    if (roomId) {
      socketService.toggleMute(roomId, newMuted);
    }
  }, [isMuted, roomId]);

  // Cleanup
  const cleanup = useCallback(() => {
    // Stop all local tracks
    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) {
        track.stop();
      }
      localStreamRef.current = null;
      setLocalStream(null);
    }

    // Close all peer connections
    if (webrtcRef.current) {
      webrtcRef.current.closeAll();
      webrtcRef.current = null;
    }

    setRemoteStreams(new Map());
    setIsMuted(true);
    setError(null);
  }, []);

  // Handle incoming WebRTC signals
  useEffect(() => {
    const handleSignal = async (data: WebRTCSignalPayload) => {
      const webrtc = getWebRTC();
      const { targetPeerId, signal } = data;
      // In relay, targetPeerId is actually the sender's ID from our perspective
      const peerId = targetPeerId;

      try {
        if (signal.type === 'offer') {
          const answer = await webrtc.handleOffer(peerId, signal.sdp);
          if (roomId && answer.sdp) {
            socketService.sendWebRTCSignal(roomId, peerId, {
              type: 'answer',
              sdp: answer.sdp,
            });
          }
        } else if (signal.type === 'answer') {
          await webrtc.handleAnswer(peerId, signal.sdp);
        } else if (signal.type === 'ice-candidate') {
          await webrtc.handleIceCandidate(peerId, {
            candidate: signal.candidate,
            sdpMid: signal.sdpMid,
            sdpMLineIndex: signal.sdpMLineIndex,
          });
        }
      } catch (err) {
        console.error('WebRTC signal handling error:', err);
      }
    };

    socketService.onEvent(SocketEvents.WEBRTC_SIGNAL_RELAY, handleSignal);

    return () => {
      socketService.offEvent(SocketEvents.WEBRTC_SIGNAL_RELAY, handleSignal);
    };
  }, [roomId, getWebRTC]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isMuted,
    localStream,
    remoteStreams,
    isConnecting,
    error,
    initMicrophone,
    toggleMute,
    cleanup,
  };
}
