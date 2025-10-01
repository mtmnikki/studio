'use client';

import { useEffect, useState } from 'react';
import { createClient } from './client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface UseCollectionResult<T> {
  data: T[] | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to subscribe to a Supabase table with real-time updates
 * @param tableName - The name of the table to subscribe to
 * @param orderBy - Optional: column to order by (defaults to 'created_at')
 * @param ascending - Optional: sort direction (defaults to false)
 */
export function useCollection<T extends { id: string }>(
  tableName: string,
  orderBy: string = 'created_at',
  ascending: boolean = false
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    let channel: RealtimeChannel;

    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: items, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .order(orderBy, { ascending });

        if (fetchError) throw fetchError;

        setData(items as T[]);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${tableName}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    // Initial fetch
    fetchData();

    // Subscribe to real-time updates
    channel = supabase
      .channel(`${tableName}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          // Refetch data on any change
          fetchData();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, [tableName, orderBy, ascending]);

  return { data, isLoading, error };
}

/**
 * Hook to fetch a single document from Supabase
 * @param tableName - The name of the table
 * @param id - The document ID
 */
export function useDocument<T extends { id: string }>(
  tableName: string,
  id: string | null
): UseCollectionResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    let channel: RealtimeChannel;

    async function fetchData() {
      try {
        setIsLoading(true);
        const { data: item, error: fetchError } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setData(item ? [item as T] : null);
        setError(null);
      } catch (err) {
        console.error(`Error fetching ${tableName}/${id}:`, err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null);
      } finally {
        setIsLoading(false);
      }
    }

    // Initial fetch
    fetchData();

    // Subscribe to real-time updates
    channel = supabase
      .channel(`${tableName}_${id}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
          filter: `id=eq.${id}`,
        },
        (payload) => {
          fetchData();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      channel.unsubscribe();
    };
  }, [tableName, id]);

  return { data, isLoading, error };
}
