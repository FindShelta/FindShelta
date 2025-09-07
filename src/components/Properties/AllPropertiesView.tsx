import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Bed, Bath, Wifi, Car, Shield, Clock, Heart } from 'lucide-react';
import { Property } from '../../types';

interface AllPropertiesViewProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  bookmarkedProperties?: Set<string>;
  onBookmarkToggle?: (propertyId: string) => void;
}

const AllPropertiesView: React.FC<AllPropertiesViewProps> = ({ 
  properties, 
  onPropertyClick, 
  bookmarkedProperties = new Set(),
  onBookmarkToggle 
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Group properties by category
  const categorizedProperties = {
    sale: properties.filter(p => p.type === 'sale'),
    rent: properties.filter(p => p.type === 'rent'),
    shortstay: properties.filter(p => p.type === 'shortstay')
  };

  // Get recent uploads (last 10 properties sorted by creation date)
  const recentUploads = [...properties]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    
    const suffix = type === 'rent' ? '/year' : type === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sale':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'rent':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'shortstay':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-3 h-3" />;
      case 'parking':
        return <Car className="w-3 h-3" />;
      case 'security':
        return <Shield className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft = direction === 'left' 
        ? scrollContainerRef.current.scrollLeft - scrollAmount
        : scrollContainerRef.current.scrollLeft + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent, propertyId: string) => {
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(propertyId);
    }
  };

  const PropertyCard: React.FC<{ property: Property }> = ({ property }) => (
    <div
      onClick={() => onPropertyClick(property)}
      className="flex-shrink-0 w-64 bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(property.type)}`}>
            {property.type === 'shortstay' && <Clock className="w-3 h-3 inline mr-1" />}
            {property.type === 'sale' ? 'Sale' : 
             property.type === 'rent' ? 'Rent' : 
             'Short Stay'}
          </span>
        </div>

        {/* Bookmark Button */}
        {onBookmarkToggle && (
          <button
            onClick={(e) => handleBookmarkClick(e, property.id)}
            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-slate-800 transition-all duration-200 group"
          >
            <Heart 
              className={`w-4 h-4 transition-all duration-200 ${
                bookmarkedProperties.has(property.id)
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-600 dark:text-gray-300 group-hover:text-red-500'
              }`} 
            />
          </button>
        )}

        {/* Price */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-semibold">
          {formatPrice(property.price, property.type)}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 leading-tight">
          {property.title}
        </h3>
        
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">{property.location}</span>
        </div>

        {/* Property Details */}
        <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-300">
          {property.bedrooms && (
            <div className="flex items-center">
              <Bed className="w-3 h-3 mr-1" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="w-3 h-3 mr-1" />
              <span>{property.bathrooms}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div className="flex items-center space-x-2 pt-1">
            {property.amenities.slice(0, 3).map((amenity, index) => (
              <div key={index} className="text-gray-400 dark:text-gray-500">
                {getAmenityIcon(amenity)}
              </div>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ScrollableSection: React.FC<{ title: string; properties: Property[]; icon: React.ReactNode }> = ({ title, properties, icon }) => (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-4 px-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">({properties.length})</span>
      </div>
      
      {properties.length === 0 ? (
        <div className="px-4">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No properties available in this category</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Scroll Buttons */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          )}

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen">
      <div className="max-w-7xl mx-auto py-6">
        {/* Recent Uploads Section */}
        <ScrollableSection
          title="Recent Uploads"
          properties={recentUploads}
          icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        />

        {/* Sale Properties */}
        <ScrollableSection
          title="For Sale"
          properties={categorizedProperties.sale}
          icon={<div className="w-5 h-5 bg-blue-600 rounded-full" />}
        />

        {/* Rent Properties */}
        <ScrollableSection
          title="For Rent"
          properties={categorizedProperties.rent}
          icon={<div className="w-5 h-5 bg-emerald-600 rounded-full" />}
        />

        {/* Short Stay Properties */}
        <ScrollableSection
          title="Short Stay"
          properties={categorizedProperties.shortstay}
          icon={<div className="w-5 h-5 bg-orange-600 rounded-full" />}
        />
      </div>
    </div>
  );
};

export default AllPropertiesView;