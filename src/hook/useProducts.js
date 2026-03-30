import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';
import { database } from '../database/database';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription;

    try {
      const collection = database.get('products');
      subscription = collection
        .query(
          Q.where('deleted', false),
          Q.sortBy('updated_at', Q.desc),
        )
        .observe()
        .subscribe((records) => {
          setProducts(records);
          setLoading(false);
        });
    } catch (error) {
      console.error('Failed to observe products collection:', error);
      setProducts([]);
      setLoading(false);
    }

    return () => subscription?.unsubscribe();
  }, []);

  return {
    products,
    loading,
  };
}
