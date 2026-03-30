import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNetworkStatus } from '../hook/useNetworkStatus.ts';

const COLOR_ONLINE  = '#16a34a'; // green-700
const COLOR_OFFLINE = '#dc2626'; // red-600

/**
 * NetworkBanner
 *
 * Self-contained, reusable banner that shows the live network status.
 * Drop it at the top of any screen — it manages its own subscription via
 * the useNetworkStatus hook.
 *
 * @returns {JSX.Element | null}  Returns null while the initial state is
 *                                still being determined to avoid flicker.
 */
export default function NetworkBanner() {
  const { isConnected, isInternetReachable, connectionType, isOnline } =
    useNetworkStatus();

  // Fade-in animation that re-triggers on every status change
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    // Reset and replay entrance animation on each status change
    fadeAnim.setValue(0);
    slideAnim.setValue(-12);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isConnected, isInternetReachable]);

  // Still determining initial state — render nothing to avoid flicker
  if (isConnected === null) return null;

  const bannerColor  = isOnline ? COLOR_ONLINE : COLOR_OFFLINE;
  const dotColor     = isOnline ? '#86efac' : '#fca5a5'; // green-300 / red-300
  const statusLabel  = isOnline ? '● Online' : '● Offline';

  const hint = isOnline
    ? `Connected via ${connectionType ?? 'network'} — tap Push/Pull to sync.`
    : 'No internet connection — changes are saved locally. Sync when back online.';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: bannerColor,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Status row */}
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
        <Text style={styles.statusLabel}>{statusLabel}</Text>
      </View>

      {/* Hint text */}
      <Text style={styles.hint}>{hint}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // Shadow (Android)
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  hint: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    lineHeight: 17,
  },
});
