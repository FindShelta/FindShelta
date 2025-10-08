import React from 'react';
import { Property } from '../../types';
import LazyImage from '../common/LazyImage';
import { MapPin, Bed, Bath, Heart, Play, Scale, Phone } from 'lucide-react';

interface AliExpressCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookmarkToggle: (propertyId: string) => void;
  onTourClick: (property: Property) => void;
  onCompareClick: (property: Property) => void;
  isFavorite: boolean;
  isInComparison: boolean;
  isMobile?: boolean;
}

const AliExpressCard: React.FC<AliExpressCardProps> = ({
  property,
  onSelect,
  onBookmarkToggle,
  onTourClick,
  onCompareClick,
  isFavorite,
  isInComparison,
  isMobile = false
}) => {
  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div
      className="group bg-white dark:bg-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500"
      onClick={() => onSelect(property)}
    >
      {/* Property Image */}
      <div className="relative aspect-square overflow-hidden">
        <LazyImage
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmarkToggle(property.id);
          }}
          className={`absolute top-2 right-2 ${isMobile ? 'p-1' : 'p-1.5'} bg-white/80 rounded-full hover:bg-white transition-colors`}
        >
          <Heart
            className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-600'
            }`}
          />
        </button>
        <div className="absolute top-2 left-2">
          <span className={`${isMobile ? 'px-1.5 py-0.5' : 'px-2 py-1'} rounded text-xs font-medium text-white ${
            property.type === 'sale'
              ? 'bg-blue-500'
              : property.type === 'rent'
              ? 'bg-green-500'
              : 'bg-orange-500'
          }`}>
            {property.type === 'sale' ? 'Sale' : property.type === 'rent' ? 'Rent' : 'Stay'}
          </span>
        </div>
      </div>

      {/* Property Details */}
      <div className="p-2">
        <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-orange-600 dark:text-orange-400 mb-1`}>
          {formatPrice(property.price)}
        </div>
        <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight`}>
          {property.title}
        </h3>
        <div className={`flex items-center text-gray-500 dark:text-gray-400 ${isMobile ? 'text-xs mb-1' : 'text-xs mb-2'}`}>
          <MapPin className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'} mr-1`} />
          <span className="truncate">{isMobile ? property.location.split(',')[0] : property.location}</span>
        </div>
        
        {/* Property Stats */}
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-3'} text-xs text-gray-600 dark:text-gray-300 ${isMobile ? '' : 'mb-2'}`}>
          <div className={`flex items-center ${isMobile ? 'space-x-0.5' : 'space-x-1'}`}>
            <Bed className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
            <span>{property.bedrooms}</span>
          </div>
          <div className={`flex items-center ${isMobile ? 'space-x-0.5' : 'space-x-1'}`}>
            <Bath className={`${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        {/* Action Buttons - Only on Desktop */}
        {!isMobile && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTourClick(property);
                }}
                className="p-1 bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 rounded hover:bg-purple-100 hover:text-purple-600 transition-colors"
                title="Virtual Tour"
              >
                <Play className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCompareClick(property);
                }}
                className={`p-1 rounded transition-colors ${
                  isInComparison
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-600'
                }`}
                title="Compare"
              >
                <Scale className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/${property.agentWhatsapp}`, '_blank');
              }}
              className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition-colors"
            >
              Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AliExpressCard;