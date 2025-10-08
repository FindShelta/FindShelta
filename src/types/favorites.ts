export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  filters: {
    property_type?: 'sale' | 'rent' | 'shortstay';
    min_price?: number;
    max_price?: number;
    location?: string;
    bedrooms?: number;
    bathrooms?: number;
  };
  created_at: string;
}

export interface FavoriteProperty {
  id: string;
  user_id: string;
  property_id: string;
  created_at: string;
}