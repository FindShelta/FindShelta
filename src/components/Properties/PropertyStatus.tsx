import React from 'react';
import { TrendingDown, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface PropertyStatusProps {
  price: number;
  originalPrice?: number;
  daysOnMarket: number;
  status: 'available' | 'sold' | 'reduced' | 'pending';
  priceHistory?: Array<{ price: number; date: string; change: 'increase' | 'decrease' }>;
}

const PropertyStatus: React.FC<PropertyStatusProps> = ({
  price,
  originalPrice,
  daysOnMarket,
  status,
  priceHistory = []
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'sold':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Sold</span>
          </div>
        );
      case 'reduced':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-medium">
            <TrendingDown className="w-3 h-3" />
            <span>Price Reduced</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 rounded-full text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            <span>Pending</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Available</span>
          </div>
        );
    }
  };

  const priceReduction = originalPrice && originalPrice > price ? originalPrice - price : 0;
  const reductionPercentage = originalPrice && priceReduction > 0 ? ((priceReduction / originalPrice) * 100).toFixed(1) : 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Status</h4>
        {getStatusBadge()}
      </div>

      <div className="space-y-3">
        {/* Current Price */}
        <div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            {formatPrice(price)}
          </div>
          {originalPrice && originalPrice > price && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500 dark:text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="text-red-600 dark:text-red-400 font-medium">
                -{reductionPercentage}%
              </span>
            </div>
          )}
        </div>

        {/* Days on Market */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4" />
          <span>{daysOnMarket} days on market</span>
        </div>

        {/* Price History */}
        {priceHistory.length > 0 && (
          <div>
            <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Price History</h5>
            <div className="space-y-1">
              {priceHistory.slice(0, 3).map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatPrice(entry.price)}
                    </span>
                    {entry.change === 'decrease' ? (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyStatus;