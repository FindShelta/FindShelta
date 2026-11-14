import { useCallback, useEffect, useState } from 'react';
import { publicSupabase } from '../lib/supabase';
import { buildCityLocationFilter, mapListingToProperty, PUBLIC_LISTING_LEGACY_SELECT, PUBLIC_LISTING_SELECT } from '../lib/listings';
import { Property } from '../types';
import { AVAILABLE_CITIES } from '../lib/cities';

const PAGE_SIZE = 12;

const useShortStayListings = (city?: string) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState('');

  const fetchPage = useCallback(
    async (pageNumber: number, reset = false) => {
      if (reset) setLoading(true);
      else setLoadingMore(true);
      setError('');

      const from = pageNumber * PAGE_SIZE;
      const to = from + PAGE_SIZE;

      const buildQuery = (select: string) => {
        let query = publicSupabase
          .from('listings')
          .select(select)
          .eq('is_approved', true)
          .eq('property_type', 'shortstay')
          .order('created_at', { ascending: false })
          .range(from, to);

        query = query.or(buildCityLocationFilter(city ? [city] : AVAILABLE_CITIES));
        return query;
      };

      let { data, error: fetchError } = await buildQuery(PUBLIC_LISTING_SELECT);

      if (fetchError?.code === '42703' || fetchError?.code === 'PGRST204') {
        const legacyResult = await buildQuery(PUBLIC_LISTING_LEGACY_SELECT);
        data = legacyResult.data;
        fetchError = legacyResult.error;
      }

      if (fetchError) {
        setError('We could not load stays right now. Please try again shortly.');
        if (reset) setProperties([]);
      } else {
        const rows = data || [];
        const nextProperties = rows.slice(0, PAGE_SIZE).map(mapListingToProperty);
        setProperties((current) => (reset ? nextProperties : [...current, ...nextProperties]));
        setHasMore(rows.length > PAGE_SIZE);
        setPage(pageNumber);
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [city]
  );

  useEffect(() => {
    setProperties([]);
    setPage(0);
    setHasMore(true);
    void fetchPage(0, true);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!loading && !loadingMore && hasMore) {
      void fetchPage(page + 1);
    }
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  return { properties, loading, loadingMore, hasMore, error, loadMore };
};

export default useShortStayListings;
