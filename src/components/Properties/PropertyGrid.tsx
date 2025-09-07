import React from 'react';
import { Property } from '../../types';
import PropertyCard from './PropertyCard';

interface PropertyGridProps {
  properties: Property[];
  onPropertyClick: (property: Property) => void;
  bookmarkedProperties?: Set<string>;
  onBookmarkToggle?: (propertyId: string) => void;
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ 
  properties, 
  onPropertyClick, 
  bookmarkedProperties = new Set(),
  onBookmarkToggle 
}) => {
  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">🏠</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No properties found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm">
          There are no properties available in this category at the moment. Check back later!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 p-4">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onClick={() => onPropertyClick(property)}
          isBookmarked={bookmarkedProperties.has(property.id)}
          onBookmarkToggle={onBookmarkToggle}
        />
      ))}
    </div>
  );
};

export default PropertyGrid;