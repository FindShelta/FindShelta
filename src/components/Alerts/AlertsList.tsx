import React from 'react';
import { Bell, BellOff, Edit, Trash2, MapPin, DollarSign, Home } from 'lucide-react';
import { useAlerts } from '../../contexts/AlertContext';
import { PropertyAlert } from '../../types/alert';

const AlertsList: React.FC = () => {
  const { alerts, loading, toggleAlert, deleteAlert } = useAlerts();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatCriteria = (alert: PropertyAlert) => {
    const criteria = [];
    if (alert.property_type) criteria.push(alert.property_type);
    if (alert.min_price || alert.max_price) {
      const priceRange = `${alert.min_price ? formatPrice(alert.min_price) : '0'} - ${alert.max_price ? formatPrice(alert.max_price) : '∞'}`;
      criteria.push(priceRange);
    }
    if (alert.location_city) criteria.push(alert.location_city);
    if (alert.bedrooms) criteria.push(`${alert.bedrooms}+ beds`);
    return criteria.join(' • ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No alerts yet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Create your first alert to get notified about new properties</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{alert.name}</h3>
                {alert.is_active ? (
                  <Bell className="w-4 h-4 text-green-500" />
                ) : (
                  <BellOff className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{formatCriteria(alert)}</p>
              <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                <span>{alert.email_notifications ? '📧 Email' : '🔕 No email'}</span>
                <span>Created {new Date(alert.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 ml-2">
              <button
                onClick={() => toggleAlert(alert.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  alert.is_active 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-400'
                }`}
              >
                {alert.is_active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => deleteAlert(alert.id)}
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

export default AlertsList;