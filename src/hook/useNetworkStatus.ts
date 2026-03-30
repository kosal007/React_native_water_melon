import NetInfo, { type NetInfoStateType } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

interface NetworkState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: NetInfoStateType | null;
}

interface UseNetworkStatusResult extends NetworkState {
  isOnline: boolean;
}

/**
 * useNetworkStatus
 *
 * Custom hook that subscribes to real-time network state changes using
 * @react-native-community/netinfo. Returns the full connection state so
 * both the UI banner and individual screens can react immediately.
 */
export function useNetworkStatus(): UseNetworkStatusResult {
  const [networkState, setNetworkState] = useState<NetworkState>({
    isConnected: null,
    isInternetReachable: null,
    connectionType: null,
  });

  useEffect(() => {
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    return () => unsubscribe();
  }, []);

  const isOnline =
    networkState.isConnected === true &&
    networkState.isInternetReachable !== false;

  return { ...networkState, isOnline };
}
