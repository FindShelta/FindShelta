import React, { useState } from 'react';
import { Map, MapPin, School, ShoppingCart, Clock } from 'lucide-react';

interface MapSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

const MapSearch: React.FC<MapSearchProps> = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const popularLocations = [
    { name: 'Victoria Island, Lagos', lat: 6.4281, lng: 3.4219 },
    { name: 'Ikoyi, Lagos', lat: 6.4474, lng: 3.4553 },
    { name: 'Lekki, Lagos', lat: 6.4698, lng: 3.5852 },
    { name: 'Abuja Central', lat: 9.0765, lng: 7.3986 }
  ];

  const handleLocationClick = (location: any) => {
    setSelectedLocation(location.name);
    onLocationSelect({
      lat: location.lat,
      lng: location.lng,
      address: location.name
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center space-x-2 mb-4">
        <Map className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Map Search</h3>
      </div>

      <div className="space-y-2">
        {popularLocations.map((location) => (
          <button
            key={location.name}
            onClick={() => handleLocationClick(location)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
              selectedLocation === location.name
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{location.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapSearch;