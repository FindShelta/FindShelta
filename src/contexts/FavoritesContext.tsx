import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SavedSearch, FavoriteProperty } from '../types/favorites';
import { Property } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Set<string>;
  savedSearches: SavedSearch[];
  favoriteProperties: Property[];
  loading: boolean;
  addToFavorites: (propertyId: string) => Promise<void>;
  removeFromFavorites: (propertyId: string) => Promise<void>;
  isFavorite: (propertyId: string) => boolean;
  saveSearch: (name: string, filters: any) => Promise<void>;
  deleteSavedSearch: (id: string) => Promise<void>;
  applySavedSearch: (search: SavedSearch) => void;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('favorite_properties')
        .select('property_id')
        .eq('user_id', user.id);

      if (!error && data) {
        setFavorites(new Set(data.map(f => f.property_id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedSearches = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSavedSearches(data);
      }
    } catch (error) {
      console.error('Error fetching saved searches:', error);
    }
  };

  const fetchFavoriteProperties = async () => {
    if (!user || favorites.size === 0) {
      setFavoriteProperties([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .in('id', Array.from(favorites))
        .or('is_approved.eq.true,status.eq.approved,status.eq.approve');

      if (!error && data) {
        const transformedProperties: Property[] = data.map(listing => ({
          id: listing.id,
          title: listing.title || 'Property Listing',
          description: listing.description || 'No description available',
          price: listing.price || 0,
          currency: 'NGN',
          type: (listing.category || listing.property_type || 'sale') as 'sale' | 'rent' | 'shortstay',
          location: `${listing.location_city || 'Unknown'}, ${listing.location_state || 'Nigeria'}`,
          bedrooms: 2,
          bathrooms: 2,
          amenities: listing.amenities || ['wifi', 'parking'],
          images: listing.images && listing.images.length > 0 ? listing.images : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
          agentId: listing.agent_id,
          agentName: 'Agent',
          agentWhatsapp: '2347025790877',
          createdAt: new Date(listing.created_at),
          views: 0,
          bookmarks: 0
        }));
        setFavoriteProperties(transformedProperties);
      }
    } catch (error) {
      console.error('Error fetching favorite properties:', error);
    }
  };

  const addToFavorites = async (propertyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorite_properties')
        .insert([{ user_id: user.id, property_id: propertyId }]);

      if (!error) {
        setFavorites(prev => new Set(prev).add(propertyId));
      }
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorite_properties')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (!error) {
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(propertyId);
          return newSet;
        });
      }
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (propertyId: string) => {
    return favorites.has(propertyId);
  };

  const saveSearch = async (name: string, filters: any) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .insert([{ user_id: user.id, name, filters }])
        .select()
        .single();

      if (!error && data) {
        setSavedSearches(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (!error) {
        setSavedSearches(prev => prev.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error deleting saved search:', error);
    }
  };

  const applySavedSearch = (search: SavedSearch) => {
    // This will be handled by the parent component
    console.log('Applying saved search:', search);
  };

  const refreshFavorites = async () => {
    await fetchFavorites();
    await fetchFavoriteProperties();
  };

  useEffect(() => {
    if (user) {
      fetchFavorites();
      fetchSavedSearches();
    }
  }, [user]);

  useEffect(() => {
    fetchFavoriteProperties();
  }, [favorites]);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      savedSearches,
      favoriteProperties,
      loading,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      saveSearch,
      deleteSavedSearch,
      applySavedSearch,
      refreshFavorites
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};