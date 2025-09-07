import React from 'react';
import { Home, Calendar, Clock } from 'lucide-react';

interface CategoryTabsProps {
  activeCategory: 'all' | 'sale' | 'rent' | 'shortstay';
  onCategoryChange: (category: 'all' | 'sale' | 'rent' | 'shortstay') => void;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ activeCategory, onCategoryChange }) => {
  const tabs = [
    {
      id: 'all' as const,
      label: 'All',
      icon: Home,
      color: 'gray'
    },
    {
      id: 'sale' as const,
      label: 'Sale',
      icon: Home,
      color: 'blue'
    },
    {
      id: 'rent' as const,
      label: 'Rent',
      icon: Calendar,
      color: 'emerald'
    },
    {
      id: 'shortstay' as const,
      label: 'Short Stay',
      icon: Clock,
      color: 'orange'
    }
  ];

  const getTabClasses = (tabId: string, color: string) => {
    const isActive = activeCategory === tabId;
    
    const baseClasses = 'flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200';
    
    if (isActive) {
      switch (color) {
        case 'gray':
          return `${baseClasses} bg-gray-600 text-white shadow-md`;
        case 'blue':
          return `${baseClasses} bg-blue-600 text-white shadow-md`;
        case 'emerald':
          return `${baseClasses} bg-emerald-600 text-white shadow-md`;
        case 'orange':
          return `${baseClasses} bg-orange-600 text-white shadow-md`;
        default:
          return `${baseClasses} bg-gray-600 text-white shadow-md`;
      }
    } else {
      return `${baseClasses} bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600`;
    }
  };

  return (
    <div className="sticky top-32 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div className="flex space-x-2 max-w-7xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onCategoryChange(tab.id)}
              className={getTabClasses(tab.id, tab.color)}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTabs;