import React, { useState } from 'react';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Layout/Header';
import { Search, Filter, Heart, MapPin, Bed, Bath, Car, Wifi, Shield, Star, Phone } from 'lucide-react';

const HomeSeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'all' | 'sale' | 'rent' | 'shortstay'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3-Bedroom Apartment in Victoria Island',
      description: 'Beautiful modern apartment with stunning city views, fully furnished with high-end appliances and finishes.',
      price: 2500000,
      currency: 'NGN',
      type: 'sale',
      location: 'Victoria Island, Lagos',
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
      ],
      agentId: 'agent1',
      agentName: 'John Doe',
      agentWhatsapp: '+2348123456789',
      createdAt: new Date('2024-01-15'),
      views: 45,
      bookmarks: 12
    },
    {
      id: '2',
      title: 'Cozy 2-Bedroom Flat in Lekki',
      description: 'Comfortable and affordable apartment in a serene neighborhood with modern amenities.',
      price: 800000,
      currency: 'NGN',
      type: 'rent',
      location: 'Lekki, Lagos',
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['wifi', 'security'],
      images: [
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
        'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg'
      ],
      agentId: 'agent2',
      agentName: 'Jane Smith',
      agentWhatsapp: '+2348123456790',
      createdAt: new Date('2024-01-20'),
      views: 32,
      bookmarks: 8
    },
    {
      id: '3',
      title: 'Luxury Studio for Short Stay in Ikoyi',
      description: 'Perfect for business travelers and short stays. Fully equipped with modern amenities.',
      price: 25000,
      currency: 'NGN',
      type: 'shortstay',
      location: 'Ikoyi, Lagos',
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg',
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg'
      ],
      agentId: 'agent3',
      agentName: 'Mike Johnson',
      agentWhatsapp: '+2348123456791',
      createdAt: new Date('2024-01-25'),
      views: 67,
      bookmarks: 15
    },
    {
      id: '4',
      title: 'Spacious 4-Bedroom Duplex in Ajah',
      description: 'Family-friendly duplex with a large compound and modern facilities.',
      price: 1200000,
      currency: 'NGN',
      type: 'rent',
      location: 'Ajah, Lagos',
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg',
        'https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg'
      ],
      agentId: 'agent1',
      agentName: 'John Doe',
      agentWhatsapp: '+2348123456789',
      createdAt: new Date('2024-01-30'),
      views: 23,
      bookmarks: 5
    }
  ];

  // Filter properties based on search query and category
  const getFilteredProperties = () => {
    let filtered = mockProperties;
    
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
    
    return filtered;
  };

  const filteredProperties = getFilteredProperties();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
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
              { id: 'all', label: 'All Properties', count: mockProperties.length },
              { id: 'sale', label: 'For Sale', count: mockProperties.filter(p => p.type === 'sale').length },
              { id: 'rent', label: 'For Rent', count: mockProperties.filter(p => p.type === 'rent').length },
              { id: 'shortstay', label: 'Short Stay', count: mockProperties.filter(p => p.type === 'shortstay').length }
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

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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

        {/* No Results */}
        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Try adjusting your search criteria or browse all properties
            </p>
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