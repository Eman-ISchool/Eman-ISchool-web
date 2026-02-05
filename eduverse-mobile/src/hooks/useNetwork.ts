/**
 * Network status hook using NetInfo
 * Monitors connectivity and internet reachability
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { NetworkState } from '@/types/models';

export function useNetwork(): NetworkState {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: (state.type as any) ?? 'unknown',
      });
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setNetworkState({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable ?? false,
        type: (state.type as any) ?? 'unknown',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkState;
}
