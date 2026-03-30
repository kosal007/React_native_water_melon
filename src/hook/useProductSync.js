import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoredLastPulledAt, syncProducts } from '../sync/productSync';

export function useProductSync(isOnline) {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const syncingRef = useRef(false);

  const syncNow = useCallback(async () => {
    if (!isOnline || syncingRef.current) {
      return { skipped: true };
    }

    syncingRef.current = true;
    setSyncing(true);

    try {
      const result = await syncProducts({ isOnline: true });
      if (result?.success) {
        setLastSyncAt(result.lastPulledAt || Date.now());
        setSyncError(null);
      } else if (!result?.skipped) {
        setSyncError(result?.error || new Error('Sync failed'));
      }

      return result;
    } catch (error) {
      console.error('syncNow failed:', error);
      setSyncError(error);
      return { success: false, error };
    } finally {
      syncingRef.current = false;
      setSyncing(false);
    }
  }, [isOnline]);

  useEffect(() => {
    getStoredLastPulledAt().then((value) => {
      if (value) {
        setLastSyncAt(value);
      }
    });
  }, []);

  return {
    syncing,
    lastSyncAt,
    syncError,
    syncNow,
  };
}
