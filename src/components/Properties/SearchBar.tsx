import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onBookmarksClick: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, onBookmarksClick }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Real-time search as user types
    onSearch(e.target.value);
  };

  return (
    <div className="sticky top-16 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center space-x-3">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-slate-600 rounded-lg leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Search to find shelter"
            />
          </div>
        </form>

        {/* Bookmarks Button */}
        <button
          onClick={onBookmarksClick}
          className="flex items-center space-x-2 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-lg transition-all duration-200 border border-gray-300 dark:border-slate-600"
        >
          <Heart className="w-5 h-5" />
          <span className="hidden sm:inline font-medium">Bookmarks</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;