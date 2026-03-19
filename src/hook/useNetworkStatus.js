import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * useNetworkStatus
 *
 * Custom hook that subscribes to real-time network state changes using
 * @react-native-community/netinfo. Returns the full connection state so
 * both the UI banner and individual screens can react immediately.
 *
 * @returns {{
 *   isConnected: boolean | null,
 *   isInternetReachable: boolean | null,
 *   connectionType: string | null,
 *   isOnline: boolean,
 * }}
 */
export function useNetworkStatus() {
  const [networkState, setNetworkState] = useState({
    isConnected: null,          // null = still determining
    isInternetReachable: null,  // null = still determining
    connectionType: null,       // 'wifi' | 'cellular' | 'ethernet' | 'none' | etc.
  });

  useEffect(() => {
    // Eagerly fetch current state before the first event fires
    NetInfo.fetch().then((state) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Subscribe to every subsequent change
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkState({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      });
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Convenience flag: connected AND internet is reachable (not a captive portal)
  const isOnline =
    networkState.isConnected === true &&
    networkState.isInternetReachable !== false;

  return { ...networkState, isOnline };
}
