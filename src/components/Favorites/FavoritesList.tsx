import React from 'react';
import { Heart, MapPin, Bed, Bath, Star, Phone, Trash2 } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';

const FavoritesList: React.FC = () => {
  const { favoriteProperties, loading, removeFromFavorites } = useFavorites();

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    const suffix = type === 'rent' ? '/year' : type === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favoriteProperties.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Start adding properties to your favorites</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favoriteProperties.map((property) => (
        <div key={property.id} className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700">
          <div className="relative">
            <img
              src={property.images[0]}
              alt={property.title}
              className="w-full h-40 object-cover"
            />
            <button
              onClick={() => removeFromFavorites(property.id)}
              className="absolute top-2 right-2 p-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 rounded-full transition-colors"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
              {property.title}
            </h3>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300 text-xs mb-2">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{property.location}</span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-300 mb-3">
              <div className="flex items-center space-x-1">
                <Bed className="w-3 h-3" />
                <span>{property.bedrooms}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bath className="w-3 h-3" />
                <span>{property.bathrooms}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-400 fill-current" />
                <span>4.8</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(property.price, property.type)}
              </div>
              <button
                onClick={() => window.open(`https://wa.me/${property.agentWhatsapp}`, '_blank')}
                className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FavoritesList;