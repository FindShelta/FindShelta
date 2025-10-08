export interface PropertyAlert {
  id: string;
  user_id: string;
  name: string;
  property_type?: 'sale' | 'rent' | 'shortstay';
  min_price?: number;
  max_price?: number;
  location_city?: string;
  location_state?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  is_active: boolean;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
}