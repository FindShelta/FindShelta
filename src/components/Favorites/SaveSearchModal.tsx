import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: any;
}

const SaveSearchModal: React.FC<SaveSearchModalProps> = ({ isOpen, onClose, currentFilters }) => {
  const { saveSearch } = useFavorites();
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchName.trim()) return;

    setLoading(true);
    try {
      await saveSearch(searchName, currentFilters);
      onClose();
      setSearchName('');
    } catch (error) {
      console.error('Error saving search:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Save className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Save Search</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Name *</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., 3BR Houses in Lagos"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !searchName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
            >
              {loading ? 'Saving...' : 'Save Search'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveSearchModal;