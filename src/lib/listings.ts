import { Property } from '../types';

const PUBLIC_LISTING_BASE_FIELDS = [
  'id',
  'title',
  'description',
  'price',
  'property_type',
  'location_state',
  'location_city',
  'location_address',
  'amenities',
  'video_url',
  'agent_id',
  'agent_name',
  'agent_whatsapp',
  'created_at',
];

export const PUBLIC_LISTING_LEGACY_SELECT = [
  ...PUBLIC_LISTING_BASE_FIELDS,
  'images',
].join(',');

export const PUBLIC_LISTING_SELECT = [
  ...PUBLIC_LISTING_BASE_FIELDS,
  'bedrooms',
  'bathrooms',
  'images',
].join(',');

// Keep the feed fields shared with the legacy fallback. The primary feed also
// includes the Storage-backed image array so property previews can show the
// complete gallery; `cover_image_url` remains the card image and fallback.
export const PUBLIC_LISTING_LEGACY_FEED_SELECT = PUBLIC_LISTING_BASE_FIELDS.join(',');

export const PUBLIC_LISTING_FEED_SELECT = [
  ...PUBLIC_LISTING_BASE_FIELDS,
  'bedrooms',
  'bathrooms',
  'cover_image_url',
  'images',
].join(',');

export const buildCityLocationFilter = (cities: readonly string[]) =>
  cities
    .flatMap((city) => {
      const terms = city.toLowerCase() === 'abuja' ? [city, 'FCT'] : [city];
      return terms.flatMap((term) => [
        `location_state.ilike.%${term}%`,
        `location_city.ilike.%${term}%`,
        `location_address.ilike.%${term}%`,
      ]);
    })
    .join(',');

export const listingMatchesAvailableCity = (
  listing: Pick<ListingRow, 'location_address' | 'location_city' | 'location_state'>,
  cities: readonly string[]
) => {
  const location = [listing.location_address, listing.location_city, listing.location_state]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return cities.some((city) => {
    const terms = city.toLowerCase() === 'abuja' ? ['abuja', 'fct', 'federal capital territory'] : [city.toLowerCase()];
    return terms.some((term) => location.includes(term));
  });
};

export interface ListingRow {
  id: string;
  title?: string | null;
  description?: string | null;
  price?: number | string | null;
  location_address?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  bedrooms?: number | string | null;
  bathrooms?: number | string | null;
  amenities?: string[] | null;
  images?: string[] | null;
  cover_image_url?: string | null;
  video_url?: string | null;
  agent_id?: string | null;
  agent_name?: string | null;
  agent_whatsapp?: string | null;
  created_at?: string | null;
  views_count?: number | string | null;
  views?: number | string | null;
  bookmarks_count?: number | string | null;
  bookmarks?: number | string | null;
}

export const mapListingToProperty = (listing: ListingRow): Property => ({
  id: listing.id,
  title: listing.title || 'Short stay apartment',
  description: listing.description || 'No description available',
  price: Number(listing.price) || 0,
  currency: 'NGN',
  type: 'shortstay',
  location:
    listing.location_address ||
    [listing.location_city, listing.location_state || 'Nigeria'].filter(Boolean).join(', '),
  bedrooms: listing.bedrooms == null ? undefined : Number(listing.bedrooms),
  bathrooms: listing.bathrooms == null ? undefined : Number(listing.bathrooms),
  amenities: Array.isArray(listing.amenities) ? listing.amenities : [],
  images:
    Array.isArray(listing.images) && listing.images.length > 0
      ? listing.images
      : listing.cover_image_url
        ? [listing.cover_image_url]
        : ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'],
  video: listing.video_url || undefined,
  agentId: listing.agent_id || '',
  agentName: listing.agent_name || 'FindShelta host',
  agentWhatsapp: listing.agent_whatsapp || '',
  createdAt: listing.created_at ? new Date(listing.created_at) : new Date(),
  views: Number(listing.views_count ?? listing.views) || 0,
  bookmarks: Number(listing.bookmarks_count ?? listing.bookmarks) || 0,
});

export const formatNightlyPrice = (price: number) =>
  `${new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price)}/night`;
