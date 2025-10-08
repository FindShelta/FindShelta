import React from 'react';
import { Search, Trash2, Play } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';

interface SavedSearchesListProps {
  onApplySearch: (filters: any) => void;
}

const SavedSearchesList: React.FC<SavedSearchesListProps> = ({ onApplySearch }) => {
  const { savedSearches, deleteSavedSearch } = useFavorites();

  const formatFilters = (filters: any) => {
    const parts = [];
    if (filters.activeCategory && filters.activeCategory !== 'all') {
      parts.push(filters.activeCategory);
    }
    if (filters.filters?.minPrice || filters.filters?.maxPrice) {
      const min = filters.filters.minPrice ? `₦${Number(filters.filters.minPrice).toLocaleString()}` : '0';
      const max = filters.filters.maxPrice ? `₦${Number(filters.filters.maxPrice).toLocaleString()}` : '∞';
      parts.push(`${min} - ${max}`);
    }
    if (filters.filters?.location) {
      parts.push(filters.filters.location);
    }
    if (filters.filters?.bedrooms) {
      parts.push(`${filters.filters.bedrooms}+ beds`);
    }
    return parts.join(' • ') || 'All properties';
  };

  if (savedSearches.length === 0) {
    return (
      <div className="text-center py-8">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No saved searches</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Save your search filters for quick access</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedSearches.map((search) => (
        <div key={search.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{search.name}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{formatFilters(search.filters)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Saved {new Date(search.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => onApplySearch(search.filters)}
                className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteSavedSearch(search.id)}
                className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedSearchesList;