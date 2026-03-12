import React, { useMemo, useState, useEffect } from 'react';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useAlerts } from '../../contexts/AlertContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import PropertyComparison from '../Properties/PropertyComparison';
import CreateAlertModal from '../Alerts/CreateAlertModal';
import AlertsList from '../Alerts/AlertsList';
import SaveSearchModal from '../Favorites/SaveSearchModal';
import FavoritesList from '../Favorites/FavoritesList';
import SavedSearchesList from '../Favorites/SavedSearchesList';
import VirtualTour from '../Tours/VirtualTour';
import MapSearch from '../Search/MapSearch';
import LazyImage from '../common/LazyImage';
import AliExpressCard from '../Properties/AliExpressCard';
import usePerformance from '../../hooks/usePerformance';
import { Search, Filter, Heart, MapPin, Bed, Bath, Car, Wifi, Shield, Star, Phone, X, Scale, Bell, Settings, Save, Bookmark, Play, MessageCircle, Map, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';

const HomeSeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  usePerformance('HomeSeekerDashboard');
  const [activeCategory, setActiveCategory] = useState<'all' | 'sale' | 'rent' | 'shortstay'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [selectedTourProperty, setSelectedTourProperty] = useState<Property | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;
  const { comparisonList, addToComparison, isInComparison } = useComparison();
  const { alerts } = useAlerts();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite, favoriteProperties, savedSearches } = useFavorites();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: ''
  });

  // Fetch properties from Supabase
  useEffect(() => {
    fetchProperties(1, true);
  }, []);

  useEffect(() => {
    setPreviewImageIndex(0);
  }, [selectedProperty?.id]);

  const fetchProperties = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE;

      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, price, property_type, location_state, location_city, location_address, amenities, images, agent_id, agent_name, agent_whatsapp, created_at, views_count, bookmarks_count')
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching properties:', error);
        if (reset) setProperties([]);
        return;
      }

      // Transform data to match Property interface
      const pageItems = (data || []).slice(0, ITEMS_PER_PAGE);
      const transformedProperties: Property[] = pageItems.map(listing => ({
        id: listing.id,
        title: listing.title || 'Property Listing',
        description: listing.description || 'No description available',
        price: listing.price || 0,
        currency: 'NGN',
        type: listing.property_type || 'sale',
        location: `${listing.location_city || ''}, ${listing.location_state || 'Nigeria'}`.trim(),
        bedrooms: 2,
        bathrooms: 2,
        amenities: listing.amenities || ['wifi', 'parking'],
        images: listing.images && listing.images.length > 0 ? listing.images : ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
        agentId: listing.agent_id,
        agentName: listing.agent_name || 'Agent',
        agentWhatsapp: listing.agent_whatsapp || '',
        createdAt: new Date(listing.created_at),
        views: listing.views_count || 0,
        bookmarks: listing.bookmarks_count || 0
      }));

      if (reset) {
        setProperties(transformedProperties);
      } else {
        setProperties(prev => [...prev, ...transformedProperties]);
      }

      setHasMore((data || []).length > ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProperties(page + 1, false);
    }
  };

  // Filter properties based on search query, category, and filters
  const getFilteredProperties = () => {
    let filtered = properties;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(property => property.type === activeCategory);
    }

    // Apply additional filters
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms >= parseInt(filters.bedrooms));
    }
    if (filters.bathrooms) {
      filtered = filtered.filter(property => property.bathrooms >= parseInt(filters.bathrooms));
    }
    if (filters.location.trim()) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredProperties = getFilteredProperties();
  const categorizedProperties = useMemo(
    () => ({
      sale: filteredProperties.filter((property) => property.type === 'sale'),
      rent: filteredProperties.filter((property) => property.type === 'rent'),
      shortstay: filteredProperties.filter((property) => property.type === 'shortstay'),
    }),
    [filteredProperties]
  );

  const handleSearch = () => {
    // Search is handled by getFilteredProperties
    // This function can be used for additional search logic if needed
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      location: ''
    });
    setSearchQuery('');
  };

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    const suffix = type === 'rent' ? '/year' : type === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  const handleBookmarkToggle = (propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFromFavorites(propertyId);
    } else {
      addToFavorites(propertyId);
    }
  };

  const getCurrentFilters = () => {
    return {
      activeCategory,
      searchQuery,
      filters
    };
  };

  const applyFilters = (savedFilters: any) => {
    if (savedFilters.activeCategory) {
      setActiveCategory(savedFilters.activeCategory);
    }
    if (savedFilters.searchQuery) {
      setSearchQuery(savedFilters.searchQuery);
    }
    if (savedFilters.filters) {
      setFilters(savedFilters.filters);
    }
    setShowSavedSearches(false);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <div className="section-shell py-6 sm:py-8">
        <section className="enterprise-header">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--text-muted)]">Home Seeker Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold text-[color:var(--text)] sm:text-4xl lg:text-5xl">Discover verified properties faster</h1>
              <p className="mt-3 max-w-2xl text-sm text-[color:var(--text-muted)] sm:text-base">
                Search by city, save filters, and contact agents directly from each listing card.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div className="enterprise-kpi">
                <p className="text-lg font-bold text-[color:var(--text)] sm:text-2xl">{properties.length}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Properties</p>
              </div>
              <div className="enterprise-kpi">
                <p className="text-lg font-bold text-[color:var(--text)] sm:text-2xl">{favorites.size}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Favorites</p>
              </div>
              <div className="enterprise-kpi">
                <p className="text-lg font-bold text-[color:var(--text)] sm:text-2xl">{alerts.filter((a) => a.is_active).length}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Alerts</p>
              </div>
              <div className="enterprise-kpi">
                <p className="text-lg font-bold text-[color:var(--text)] sm:text-2xl">{savedSearches.length}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Saved</p>
              </div>
            </div>
          </div>

          <div className="enterprise-kpi mt-6 p-3 sm:p-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by city, area, or property keyword"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="brand-input w-full rounded-xl py-3 pl-10 pr-3 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="ghost-button rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <span className="inline-flex items-center gap-1"><Filter className="h-4 w-4" /> Filters</span>
                </button>
                <button
                  onClick={() => setShowCreateAlert(true)}
                  className="ghost-button rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <span className="inline-flex items-center gap-1"><Bell className="h-4 w-4" /> Alert</span>
                </button>
                <button
                  onClick={() => setShowSaveSearch(true)}
                  className="ghost-button rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <span className="inline-flex items-center gap-1"><Save className="h-4 w-4" /> Save</span>
                </button>
                <button
                  onClick={() => setShowMapSearch(!showMapSearch)}
                  className="ghost-button rounded-lg px-3 py-2 text-sm font-semibold"
                >
                  <span className="inline-flex items-center gap-1"><Map className="h-4 w-4" /> Map</span>
                </button>
                <button onClick={handleSearch} className="brand-button rounded-lg px-3 py-2 text-sm font-semibold">
                  Search now
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="flex space-x-4 sm:space-x-8 overflow-x-auto py-3 sm:py-4 scrollbar-hide">
            {[
              { id: 'all', label: 'All', fullLabel: 'All Properties', count: properties.length },
              { id: 'sale', label: 'Sale', fullLabel: 'For Sale', count: properties.filter(p => p.type === 'sale').length },
              { id: 'rent', label: 'Rent', fullLabel: 'For Rent', count: properties.filter(p => p.type === 'rent').length },
              { id: 'shortstay', label: 'Stay', fullLabel: 'Short Stay', count: properties.filter(p => p.type === 'shortstay').length }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as typeof activeCategory)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="sm:hidden">{category.label}</span>
                <span className="hidden sm:inline">{category.fullLabel}</span>
                <span className="bg-gray-200 dark:bg-slate-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
            
            {/* Alerts Button */}
            <button
              onClick={() => setShowAlerts(!showAlerts)}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                showAlerts
                  ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="sm:hidden">Alerts</span>
              <span className="hidden sm:inline">My Alerts</span>
              <span className="bg-gray-200 dark:bg-slate-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {alerts.filter(a => a.is_active).length}
              </span>
            </button>
            
            {/* Favorites Button */}
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                showFavorites
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="sm:hidden">Favorites</span>
              <span className="hidden sm:inline">My Favorites</span>
              <span className="bg-gray-200 dark:bg-slate-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {favorites.size}
              </span>
            </button>
            
            {/* Saved Searches Button */}
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm sm:text-base ${
                showSavedSearches
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="sm:hidden">Saved</span>
              <span className="hidden sm:inline">Saved Searches</span>
              <span className="bg-gray-200 dark:bg-slate-600 text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                {savedSearches.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                  Min Price (₦)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Price (₦)
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Bedrooms
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Bathrooms
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="City, State"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Clear All
              </button>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProperties.length} properties found
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Section */}
      {showAlerts && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Property Alerts</h3>
              <button
                onClick={() => setShowCreateAlert(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Create Alert
              </button>
            </div>
            <AlertsList />
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {showFavorites && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Favorite Properties</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{favorites.size} properties</span>
            </div>
            <FavoritesList />
          </div>
        </div>
      )}

      {/* Saved Searches Section */}
      {showSavedSearches && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Searches</h3>
              <button
                onClick={() => setShowSaveSearch(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Save Current
              </button>
            </div>
            <SavedSearchesList onApplySearch={applyFilters} />
          </div>
        </div>
      )}

      {/* Map Search Section */}
      {showMapSearch && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <MapSearch onLocationSelect={(location) => {
              setFilters(prev => ({ ...prev, location: location.address }));
              setShowMapSearch(false);
            }} />
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[color:var(--text)] sm:text-xl">
            {activeCategory === 'all' ? 'Categorized Listings' : 'Available Properties'}
          </h2>
          <p className="text-xs text-[color:var(--text-muted)] sm:text-sm">{filteredProperties.length} results</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading properties...</p>
            </div>
          </div>
        ) : (
          <>
            {activeCategory === 'all' ? (
              <div className="space-y-8">
                {[
                  { key: 'sale', title: 'For Sale', items: categorizedProperties.sale },
                  { key: 'rent', title: 'For Rent', items: categorizedProperties.rent },
                  { key: 'shortstay', title: 'Short Stay', items: categorizedProperties.shortstay },
                ].map((section) =>
                  section.items.length > 0 ? (
                    <section key={section.key}>
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-semibold text-[color:var(--text)] sm:text-lg">{section.title}</h3>
                        <span className="text-xs text-[color:var(--text-muted)]">{section.items.length} listings</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                        {section.items.map((property) => (
                          <AliExpressCard
                            key={property.id}
                            property={property}
                            onSelect={setSelectedProperty}
                            onBookmarkToggle={handleBookmarkToggle}
                            onTourClick={(prop) => {
                              setSelectedTourProperty(prop);
                              setShowVirtualTour(true);
                            }}
                            onCompareClick={addToComparison}
                            isFavorite={isFavorite(property.id)}
                            isInComparison={isInComparison(property.id)}
                          />
                        ))}
                      </div>
                    </section>
                  ) : null
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {filteredProperties.map((property) => (
                  <AliExpressCard
                    key={property.id}
                    property={property}
                    onSelect={setSelectedProperty}
                    onBookmarkToggle={handleBookmarkToggle}
                    onTourClick={(prop) => {
                      setSelectedTourProperty(prop);
                      setShowVirtualTour(true);
                    }}
                    onCompareClick={addToComparison}
                    isFavorite={isFavorite(property.id)}
                    isInComparison={isInComparison(property.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Load More Button */}
        {!loading && hasMore && filteredProperties.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                'Load More Properties'
              )}
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {properties.length === 0 ? 'No properties available yet' : 'No properties found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {properties.length === 0 
                ? 'Be the first agent to list a property on FindShelta!' 
                : 'Try adjusting your search criteria or browse all properties'
              }
            </p>
            {properties.length === 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-40">
          <div className="bg-blue-600 text-white rounded-xl p-3 sm:p-4 shadow-2xl max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">
                  {comparisonList.length} Properties Selected
                </span>
              </div>
              <button
                onClick={() => setShowComparison(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Comparison Modal */}
      <PropertyComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
      />

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveSearch}
        onClose={() => setShowSaveSearch(false)}
        currentFilters={getCurrentFilters()}
      />

      {/* Virtual Tour Modal */}
      {selectedTourProperty && (
        <VirtualTour
          isOpen={showVirtualTour}
          onClose={() => {
            setShowVirtualTour(false);
            setSelectedTourProperty(null);
          }}
          images={selectedTourProperty.images}
          title={selectedTourProperty.title}
        />
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">
          <div className="panel max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl">
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Property Preview</p>
                <h2 className="text-lg font-bold text-[color:var(--text)] sm:text-2xl">{selectedProperty.title}</h2>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="ghost-button inline-flex h-9 w-9 items-center justify-center rounded-lg"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-4 sm:grid-cols-2 sm:gap-6 sm:p-6">
              <div>
                <div className="relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)]">
                  <LazyImage
                    src={selectedProperty.images[previewImageIndex] || selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="h-64 w-full object-cover sm:h-80"
                  />
                  {selectedProperty.images.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setPreviewImageIndex((prev) =>
                            prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                          )
                        }
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setPreviewImageIndex((prev) =>
                            prev === selectedProperty.images.length - 1 ? 0 : prev + 1
                          )
                        }
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/55 p-1.5 text-white"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {selectedProperty.images.length > 1 && (
                  <div className="mt-3 grid grid-cols-5 gap-2">
                    {selectedProperty.images.slice(0, 10).map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setPreviewImageIndex(index)}
                        className={`overflow-hidden rounded-md border ${previewImageIndex === index ? 'border-[color:var(--brand)]' : 'border-[color:var(--border)]'}`}
                        aria-label={`Open image ${index + 1}`}
                      >
                        <img src={image} alt={`${selectedProperty.title} ${index + 1}`} className="h-14 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-[color:var(--surface-strong)] px-2 py-1 text-xs font-semibold uppercase text-[color:var(--text-muted)]">
                    {selectedProperty.type}
                  </span>
                  <p className="text-2xl font-bold text-[color:var(--brand)] sm:text-3xl">
                    {formatPrice(selectedProperty.price, selectedProperty.type)}
                  </p>
                </div>

                <div className="flex items-start gap-2 text-sm text-[color:var(--text-muted)]">
                  <MapPin className="mt-0.5 h-4 w-4 text-[color:var(--brand)]" />
                  <span>{selectedProperty.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="enterprise-kpi flex items-center gap-2"><Bed className="h-4 w-4 text-[color:var(--brand)]" /> {selectedProperty.bedrooms || 'N/A'} Bedrooms</div>
                  <div className="enterprise-kpi flex items-center gap-2"><Bath className="h-4 w-4 text-[color:var(--brand)]" /> {selectedProperty.bathrooms || 'N/A'} Bathrooms</div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Description</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[color:var(--text-muted)]">
                    {selectedProperty.description || 'No description provided for this property yet.'}
                  </p>
                </div>

                {selectedProperty.amenities?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Amenities</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedProperty.amenities.slice(0, 8).map((amenity: string, index: number) => (
                        <span key={index} className="rounded-md bg-[color:var(--surface-strong)] px-2 py-1 text-xs font-medium text-[color:var(--text-muted)]">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSelectedTourProperty(selectedProperty);
                      setShowVirtualTour(true);
                    }}
                    className="ghost-button inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm"
                  >
                    <Play className="h-4 w-4" />
                    Tour
                  </button>
                  <button
                    onClick={() => {
                      addToComparison(selectedProperty);
                      setSelectedProperty(null);
                    }}
                    className="brand-button inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold sm:text-sm"
                  >
                    <Scale className="h-4 w-4" />
                    Compare
                  </button>
                    <button
                      onClick={() => {
                        const whatsappUrl = buildListingWhatsAppUrl(selectedProperty);
                        if (!whatsappUrl) {
                          alert('This listing does not have a WhatsApp contact number yet.');
                          return;
                        }
                        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 sm:text-sm"
                    >
                    <Phone className="h-4 w-4" />
                    Contact
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeSeekerDashboard;

