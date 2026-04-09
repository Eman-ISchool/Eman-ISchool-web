'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Socket } from 'socket.io-client';
import * as socketService from '../services/socket';

// ─── useSocket Hook ─────────────────────────────────────────────

export interface UseSocketReturn {
  isConnected: boolean;
  connect: (token: string) => void;
  disconnect: () => void;
  socket: Socket | null;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const connect = useCallback((token: string) => {
    const socket = socketService.connect(token);
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // If already connected (reconnection), set immediately
    if (socket.connected) {
      setIsConnected(true);
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    socketRef.current = null;
    setIsConnected(false);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Only clean up listeners, don't disconnect the singleton
      // since other components might still use it
      const socket = socketRef.current;
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
      }
    };
  }, []);

  return {
    isConnected,
    connect,
    disconnect,
    socket: socketRef.current,
  };
}
