import React from 'react';
import { X, MapPin, Bed, Bath, Star, Phone, Wifi, Car, Shield } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { Property } from '../../types';

interface PropertyComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({ isOpen, onClose }) => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              Compare Properties ({comparisonList.length}/3)
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearComparison}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {comparisonList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No properties to compare
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add properties to comparison by clicking the "Compare" button on property cards
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-full">
                {comparisonList.map((property) => (
                  <div key={property.id} className="bg-gray-50 dark:bg-slate-700 rounded-xl p-4 relative">
                    <button
                      onClick={() => removeFromComparison(property.id)}
                      className="absolute top-2 right-2 p-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>

                    {/* Property Image */}
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-32 sm:h-40 object-cover rounded-lg mb-3"
                    />

                    {/* Property Details */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base mb-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span className="truncate">{property.location}</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatPrice(property.price, property.type)}
                      </div>

                      {/* Property Stats */}
                      <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Bed className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bath className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          <span>4.8</span>
                        </div>
                      </div>

                      {/* Type Badge */}
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          property.type === 'sale'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : property.type === 'rent'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                        }`}>
                          {property.type === 'sale' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Short Stay'}
                        </span>
                      </div>

                      {/* Amenities */}
                      <div>
                        <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</h4>
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.slice(0, 4).map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center space-x-1 bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded text-xs"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Contact Button */}
                      <button
                        onClick={() => window.open(`https://wa.me/${property.agentWhatsapp}`, '_blank')}
                        className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Agent</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;