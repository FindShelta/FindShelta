import React, { memo } from 'react';
import { Property } from '../../types';
import LazyImage from '../Common/LazyImage';
import { MapPin, Bed, Bath, Star, Phone, Play, Scale, Heart } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookmarkToggle: (propertyId: string) => void;
  onTourClick: (property: Property) => void;
  onCompareClick: (property: Property) => void;
  isFavorite: boolean;
  isInComparison: boolean;
  formatPrice: (price: number, type: string) => string;
}

const PropertyCard: React.FC<PropertyCardProps> = memo(({
  property,
  onSelect,
  onBookmarkToggle,
  onTourClick,
  onCompareClick,
  isFavorite,
  isInComparison,
  formatPrice
}) => {
  return (
    <div
      className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer border border-white/20 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50"
      onClick={() => onSelect(property)}
    >
      {/* Property Image */}
      <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden">
        <LazyImage
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(property.id);
          }}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
        >
          <Heart
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
            }`}
          />
        </button>
        <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-lg ${
            property.type === 'sale'
              ? 'bg-blue-500/90 text-white border-blue-400/50'
              : property.type === 'rent'
              ? 'bg-emerald-500/90 text-white border-emerald-400/50'
              : 'bg-orange-500/90 text-white border-orange-400/50'
          }`}>
            <span className="sm:hidden">{property.type === 'sale' ? 'Sale' : property.type === 'rent' ? 'Rent' : 'Stay'}</span>
            <span className="hidden sm:inline">{property.type === 'sale' ? '🏠 For Sale' : property.type === 'rent' ? '🏢 For Rent' : '🏖️ Short Stay'}</span>
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-800 dark:text-white mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {property.title}
          </h3>
          <div className="flex items-center text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-blue-500" />
            <span className="font-medium truncate">{property.location}</span>
          </div>
        </div>

        {/* Property Stats */}
        <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <Bed className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{property.bathrooms}</span>
          </div>

        </div>

        {/* Price and Contact */}
        <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="text-sm sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {formatPrice(property.price, property.type)}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTourClick(property);
              }}
              className="p-1.5 sm:p-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg transition-colors"
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareClick(property);
              }}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                isInComparison
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20'
              }`}
            >
              <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${property.agentWhatsapp}`, '_blank');
              }}
              className="inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg sm:rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl text-xs sm:text-sm"
            >
              <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline lg:hidden">Call</span>
              <span className="hidden lg:inline">Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

export default PropertyCard;