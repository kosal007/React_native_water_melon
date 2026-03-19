import { useEffect, useState } from 'react';
import { database } from '../database/database';

/**
 * useSales
 *
 * Reactive hook that subscribes to the entire `sales` collection.
 * Any add / update / delete triggers an automatic re-render — no manual
 * refresh needed. This is the WatermelonDB offline-first pattern.
 *
 * @returns {{ sales: Sale[], loading: boolean }}
 */
export function useSales() {
  const [sales, setSales]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // .observe() returns an RxJS Observable that emits on every DB change
    const subscription = database
      .get('sales')
      .query()
      .observe()
      .subscribe((results) => {
        setSales(results);
        setLoading(false);
      });

    // Unsubscribe on unmount to avoid memory leaks
    return () => subscription.unsubscribe();
  }, []);

  return { sales, loading };
}
