import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Property } from '../types';

interface ComparisonContextType {
  comparisonList: Property[];
  addToComparison: (property: Property) => void;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
  isInComparison: (propertyId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

interface ComparisonProviderProps {
  children: ReactNode;
}

export const ComparisonProvider: React.FC<ComparisonProviderProps> = ({ children }) => {
  const [comparisonList, setComparisonList] = useState<Property[]>([]);

  const addToComparison = (property: Property) => {
    setComparisonList(prev => {
      if (prev.length >= 3) {
        return [...prev.slice(1), property];
      }
      if (prev.find(p => p.id === property.id)) {
        return prev;
      }
      return [...prev, property];
    });
  };

  const removeFromComparison = (propertyId: string) => {
    setComparisonList(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearComparison = () => {
    setComparisonList([]);
  };

  const isInComparison = (propertyId: string) => {
    return comparisonList.some(p => p.id === propertyId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};