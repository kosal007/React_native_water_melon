import { useCallback, useEffect, useRef, useState } from 'react';
import { getStoredLastPulledAt, syncProducts } from '../sync/productSync';

type SyncResult = {
  success?: boolean;
  skipped?: boolean;
  reason?: string;
  lastPulledAt?: number;
  error?: unknown;
};

interface UseProductSyncResult {
  syncing: boolean;
  lastSyncAt: number | null;
  syncError: Error | null;
  syncNow: () => Promise<SyncResult>;
}

function toError(value: unknown): Error {
  if (value instanceof Error) return value;
  return new Error(String(value || 'Unknown sync error'));
}

export function useProductSync(isOnline: boolean): UseProductSyncResult {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);
  const syncingRef = useRef(false);

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline || syncingRef.current) {
      return { skipped: true };
    }

    syncingRef.current = true;
    setSyncing(true);

    try {
      const result = (await syncProducts({ isOnline: true })) as SyncResult;
      if (result?.success) {
        setLastSyncAt(result.lastPulledAt || Date.now());
        setSyncError(null);
      } else if (!result?.skipped) {
        setSyncError(toError(result?.error || 'Sync failed'));
      }

      return result;
    } catch (error) {
      console.error('syncNow failed:', error);
      const err = toError(error);
      setSyncError(err);
      return { success: false, error: err };
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
