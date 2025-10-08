import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';
import { useAlerts } from '../../contexts/AlertContext';

interface CreateAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAlertModal: React.FC<CreateAlertModalProps> = ({ isOpen, onClose }) => {
  const { createAlert } = useAlerts();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    property_type: '',
    min_price: '',
    max_price: '',
    location_city: '',
    bedrooms: '',
    email_notifications: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      await createAlert({
        name: formData.name,
        property_type: formData.property_type as any,
        min_price: formData.min_price ? Number(formData.min_price) : undefined,
        max_price: formData.max_price ? Number(formData.max_price) : undefined,
        location_city: formData.location_city || undefined,
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        email_notifications: formData.email_notifications,
        is_active: true
      });
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
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
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create Alert</h2>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Alert Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., 3BR Apartments in Lagos"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Property Type</label>
            <select
              value={formData.property_type}
              onChange={(e) => setFormData(prev => ({ ...prev, property_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
            >
              <option value="">Any Type</option>
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
              <option value="shortstay">Short Stay</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Price (₦)</label>
              <input
                type="number"
                value={formData.min_price}
                onChange={(e) => setFormData(prev => ({ ...prev, min_price: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Price (₦)</label>
              <input
                type="number"
                value={formData.max_price}
                onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                placeholder="Any"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
              <input
                type="text"
                value={formData.location_city}
                onChange={(e) => setFormData(prev => ({ ...prev, location_city: e.target.value }))}
                placeholder="Lagos"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Bedrooms</label>
              <select
                value={formData.bedrooms}
                onChange={(e) => setFormData(prev => ({ ...prev, bedrooms: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="email_notifications"
              checked={formData.email_notifications}
              onChange={(e) => setFormData(prev => ({ ...prev, email_notifications: e.target.checked }))}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="email_notifications" className="text-sm text-gray-700 dark:text-gray-300">
              Email notifications
            </label>
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
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
            >
              {loading ? 'Creating...' : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAlertModal;