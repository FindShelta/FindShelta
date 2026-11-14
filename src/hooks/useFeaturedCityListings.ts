import { useEffect, useState } from 'react';
import { Property } from '../types';
import { publicSupabase } from '../lib/supabase';
import { buildCityLocationFilter, ListingRow, mapListingToProperty, PUBLIC_LISTING_LEGACY_SELECT, PUBLIC_LISTING_SELECT } from '../lib/listings';

export interface FeaturedCityListing {
  city: string;
  property: Property;
}

const useFeaturedCityListings = (cities: readonly string[]) => {
  const [listings, setListings] = useState<FeaturedCityListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const cityKey = cities.join('|');

  useEffect(() => {
    let active = true;

    const fetchFeaturedListings = async () => {
      setLoading(true);
      setError('');

      const cityResults = await Promise.all(
        cities.map(async (city) => {
          const buildQuery = (select: string) => publicSupabase
            .from('listings')
            .select(select)
            .eq('is_approved', true)
            .eq('property_type', 'shortstay')
            .or(buildCityLocationFilter([city]))
            .order('created_at', { ascending: false })
            .limit(2);

          let result = await buildQuery(PUBLIC_LISTING_SELECT);
          if (result.error?.code === '42703' || result.error?.code === 'PGRST204') {
            result = await buildQuery(PUBLIC_LISTING_LEGACY_SELECT);
          }
          return { city, ...result };
        })
      );

      if (!active) return;

      if (cityResults.every((result) => result.error)) {
        setListings([]);
        setError('Featured stays are unavailable right now.');
      } else {
        const featured = cityResults.flatMap(({ city, data }) =>
          ((data || []) as ListingRow[]).map((row) => ({ city, property: mapListingToProperty(row) }))
        );
        setListings(featured);
        if (cityResults.some((result) => result.error)) {
          setError('Some featured stays could not be loaded.');
        }
      }

      setLoading(false);
    };

    void fetchFeaturedListings();
    return () => { active = false; };
  // The joined key changes only when the supported city set changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityKey]);

  return { listings, loading, error };
};

export default useFeaturedCityListings;
