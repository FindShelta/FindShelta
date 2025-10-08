import React, { useState, useEffect } from 'react';
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
import { Search, Filter, Heart, MapPin, Bed, Bath, Car, Wifi, Shield, Star, Phone, X, Scale, Bell, Settings, Save, Bookmark, Play, MessageCircle, Map, TrendingDown } from 'lucide-react';

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

  const fetchProperties = async (pageNum: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const from = (pageNum - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('listings')
        .select(`
          id, title, description, price, category, property_type,
          location_city, location_state, amenities, images, agent_id, created_at
        `, { count: 'exact' })
        .or('is_approved.eq.true,status.eq.approved,status.eq.approve')
        .neq('status', 'rejected')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('Error fetching properties:', error);
        if (reset) setProperties([]);
        return;
      }

      // Transform data to match Property interface
      const transformedProperties: Property[] = (data || []).map(listing => ({
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

      if (reset) {
        setProperties(transformedProperties);
      } else {
        setProperties(prev => [...prev, ...transformedProperties]);
      }

      setHasMore(transformedProperties.length === ITEMS_PER_PAGE && (count || 0) > pageNum * ITEMS_PER_PAGE);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      {/* Hero Section */}
      <div className="relative bg-white dark:bg-slate-900 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-pink-200 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-8 sm:py-16 lg:py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8">
              <span className="mr-1 sm:mr-2">🏡</span>
              <span className="hidden sm:inline">Nigeria's Leading Property Platform</span>
              <span className="sm:hidden">Find Your Home</span>
            </div>
            
            {/* Main Heading */}
            <h1 className="text-2xl sm:text-4xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-4 sm:mb-6">
              <span className="block sm:inline">Discover Your</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Perfect Home
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-xl lg:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              <span className="hidden sm:inline">Connect with verified agents, explore premium properties, and find your ideal living space across Nigeria</span>
              <span className="sm:hidden">Find verified properties and connect with trusted agents</span>
            </p>
            
            {/* Search Section */}
            <div className="max-w-4xl mx-auto px-2">
              <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                    <input
                      type="text"
                      placeholder="Search location or property type..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-lg transition-all duration-200"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-semibold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Filters</span>
                    </button>
                    <button
                      onClick={() => setShowCreateAlert(true)}
                      className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-900/20 rounded-xl sm:rounded-2xl hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200 font-semibold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Alert</span>
                    </button>
                    <button
                      onClick={() => setShowSaveSearch(true)}
                      className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-green-300 dark:border-green-600 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 rounded-xl sm:rounded-2xl hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 font-semibold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Save</span>
                    </button>
                    <button
                      onClick={() => setShowMapSearch(!showMapSearch)}
                      className="px-3 sm:px-4 py-3 sm:py-4 border-2 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-xl sm:rounded-2xl hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 font-semibold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <Map className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Map</span>
                    </button>
                    <button
                      onClick={handleSearch}
                      className="flex-1 px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-bold shadow-lg hover:shadow-xl text-sm sm:text-base"
                    >
                      <span className="sm:hidden">Search</span>
                      <span className="hidden sm:inline">Search Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-8 md:grid-cols-4 mt-8 sm:mt-16 px-4">
              <div className="text-center">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">{properties.length}+</div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Properties</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">50+</div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Agents</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">25+</div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">1000+</div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 dark:text-slate-400 font-medium">Clients</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading properties...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile Grid - AliExpress Style */}
            <div className="block sm:hidden">
              <div className="grid grid-cols-2 gap-2">
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
                    isMobile={true}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid - AliExpress Style */}
            <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-3">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedProperty.title}
                </h2>
                <button
                  onClick={() => setSelectedProperty(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedProperty.images[0]}
                    alt={selectedProperty.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  {selectedProperty.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProperty.images.slice(1, 9).map((image: string, index: number) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${selectedProperty.title} ${index + 2}`}
                          className="w-full h-16 object-cover rounded cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => {
                            // Swap main image with clicked thumbnail
                            const newImages = [...selectedProperty.images];
                            [newImages[0], newImages[index + 1]] = [newImages[index + 1], newImages[0]];
                            setSelectedProperty({...selectedProperty, images: newImages});
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <MapPin className="w-5 h-5 mr-2" />
                    <span>{selectedProperty.location}</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(selectedProperty.price, selectedProperty.type)}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedProperty.description}
                  </p>
                  <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5" />
                      <span>{selectedProperty.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Bath className="w-5 h-5" />
                      <span>{selectedProperty.bathrooms} Bathrooms</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => {
                        setSelectedTourProperty(selectedProperty);
                        setShowVirtualTour(true);
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                    >
                      <Play className="w-4 h-4" />
                      <span>Tour</span>
                    </button>
                    <button
                      onClick={() => {
                        addToComparison(selectedProperty);
                        setSelectedProperty(null);
                      }}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Compare</span>
                    </button>
                    <button
                      onClick={() => window.open(`https://wa.me/${selectedProperty.agentWhatsapp}`, '_blank')}
                      className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                  

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