import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import { Search, Filter, Heart, MapPin, Bed, Bath, Car, Wifi, Shield, Star, Phone, X } from 'lucide-react';

const HomeSeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'all' | 'sale' | 'rent' | 'shortstay'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: ''
  });

  // Fetch properties from Supabase
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select(`
          id,
          title,
          description,
          price,
          category,
          location_city,
          location_state,
          bedrooms,
          bathrooms,
          amenities,
          images,
          video_url,
          agent_id,
          agent_name,
          agent_whatsapp,
          created_at,
          views,
          bookmarks
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        return;
      }

      // Transform data to match Property interface
      const transformedProperties: Property[] = (data || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        currency: 'NGN',
        type: listing.category as 'sale' | 'rent' | 'shortstay',
        location: `${listing.location_city}, ${listing.location_state}`,
        bedrooms: listing.bedrooms,
        bathrooms: listing.bathrooms,
        amenities: listing.amenities || [],
        images: listing.images || ['https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'],
        agentId: listing.agent_id,
        agentName: listing.agent_name || 'Agent',
        agentWhatsapp: listing.agent_whatsapp || '',
        createdAt: new Date(listing.created_at),
        views: listing.views || 0,
        bookmarks: listing.bookmarks || 0
      }));

      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
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
    setBookmarkedProperties(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(propertyId)) {
        newBookmarks.delete(propertyId);
      } else {
        newBookmarks.add(propertyId);
      }
      return newBookmarks;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Your Perfect Home</h1>
            <p className="text-blue-100">Discover amazing properties with video tours and direct agent contact</p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-4 shadow-lg">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by location, property type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
                >
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </button>
                <button 
                  onClick={handleSearch}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto py-4">
            {[
              { id: 'all', label: 'All Properties', count: properties.length },
              { id: 'sale', label: 'For Sale', count: properties.filter(p => p.type === 'sale').length },
              { id: 'rent', label: 'For Rent', count: properties.filter(p => p.type === 'rent').length },
              { id: 'shortstay', label: 'Short Stay', count: properties.filter(p => p.type === 'shortstay').length }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as typeof activeCategory)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span>{category.label}</span>
                <span className="bg-gray-200 dark:bg-slate-600 text-xs px-2 py-1 rounded-full">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Price (₦)
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
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

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading properties...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <div
                key={property.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => setSelectedProperty(property)}
              >
                {/* Property Image */}
                <div className="relative h-48">
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmarkToggle(property.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        bookmarkedProperties.has(property.id)
                          ? 'text-red-500 fill-current'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      property.type === 'sale'
                        ? 'bg-blue-100 text-blue-700'
                        : property.type === 'rent'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {property.type === 'sale' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Short Stay'}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {property.title}
                    </h3>
                    <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{property.location}</span>
                    </div>
                  </div>

                  {/* Property Stats */}
                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex items-center space-x-2 mb-4">
                    {property.amenities.slice(0, 3).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center space-x-1 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300"
                      >
                        {getAmenityIcon(amenity)}
                        <span className="capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and Contact */}
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatPrice(property.price, property.type)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`https://wa.me/${property.agentWhatsapp}`, '_blank');
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                    className="w-full h-64 object-cover rounded-lg"
                  />
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
                  <button
                    onClick={() => window.open(`https://wa.me/${selectedProperty.agentWhatsapp}`, '_blank')}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    <Phone className="w-5 h-5" />
                    <span>Contact Agent via WhatsApp</span>
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