import React, { useState } from 'react';
import { Property } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../Layout/Header';
import SearchBar from '../Properties/SearchBar';
import CategoryTabs from '../Properties/CategoryTabs';
import PropertyGrid from '../Properties/PropertyGrid';
import PropertyDetail from '../Properties/PropertyDetail';
import AllPropertiesView from '../Properties/AllPropertiesView';

const HomeSeekerDashboard: React.FC = () => {
  const { login } = useAuth();
  const [activeCategory, setActiveCategory] = useState<'all' | 'sale' | 'rent' | 'shortstay'>('all');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarkedProperties, setBookmarkedProperties] = useState<Set<string>>(new Set());
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Mock properties data
  const mockProperties: Property[] = [
    {
      id: '1',
      title: 'Modern 3-Bedroom Apartment in Victoria Island',
      description: 'Beautiful modern apartment with stunning city views, fully furnished with high-end appliances and finishes.',
      price: 2500000,
      currency: 'NGN',
      type: 'sale',
      location: 'Victoria Island, Lagos',
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
      ],
      agentId: 'agent1',
      agentName: 'John Doe',
      agentWhatsapp: '+2348123456789',
      createdAt: new Date('2024-01-15'),
      views: 45,
      bookmarks: 12
    },
    {
      id: '2',
      title: 'Cozy 2-Bedroom Flat in Lekki',
      description: 'Comfortable and affordable apartment in a serene neighborhood with modern amenities.',
      price: 800000,
      currency: 'NGN',
      type: 'rent',
      location: 'Lekki, Lagos',
      bedrooms: 2,
      bathrooms: 1,
      amenities: ['wifi', 'security'],
      images: [
        'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
        'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg'
      ],
      agentId: 'agent2',
      agentName: 'Jane Smith',
      agentWhatsapp: '+2348123456790',
      createdAt: new Date('2024-01-20'),
      views: 32,
      bookmarks: 8
    },
    {
      id: '3',
      title: 'Luxury Studio for Short Stay in Ikoyi',
      description: 'Perfect for business travelers and short stays. Fully equipped with modern amenities.',
      price: 25000,
      currency: 'NGN',
      type: 'shortstay',
      location: 'Ikoyi, Lagos',
      bedrooms: 1,
      bathrooms: 1,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/2631746/pexels-photo-2631746.jpeg',
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg'
      ],
      agentId: 'agent3',
      agentName: 'Mike Johnson',
      agentWhatsapp: '+2348123456791',
      createdAt: new Date('2024-01-25'),
      views: 67,
      bookmarks: 15
    },
    {
      id: '4',
      title: 'Spacious 4-Bedroom Duplex in Ajah',
      description: 'Family-friendly duplex with a large compound and modern facilities.',
      price: 1200000,
      currency: 'NGN',
      type: 'rent',
      location: 'Ajah, Lagos',
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['wifi', 'parking', 'security'],
      images: [
        'https://images.pexels.com/photos/271816/pexels-photo-271816.jpeg',
        'https://images.pexels.com/photos/323775/pexels-photo-323775.jpeg'
      ],
      agentId: 'agent1',
      agentName: 'John Doe',
      agentWhatsapp: '+2348123456789',
      createdAt: new Date('2024-01-30'),
      views: 23,
      bookmarks: 5
    }
  ];

  // Filter properties based on search query and category
  const getFilteredProperties = () => {
    let filtered = mockProperties;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(property => property.type === activeCategory);
    }
    
    // Filter by bookmarks if showing bookmarks
    if (showBookmarks) {
      filtered = filtered.filter(property => bookmarkedProperties.has(property.id));
    }
    
    return filtered;
  };

  const filteredProperties = getFilteredProperties();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleBookmarksClick = () => {
    setShowBookmarks(!showBookmarks);
    if (!showBookmarks) {
      setActiveCategory('all'); // Show all categories when viewing bookmarks
    }
  };

  const handleBookmarkToggle = (propertyId: string) => {
    setBookmarkedProperties(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(propertyId)) {
        newBookmarks.delete(propertyId);
      } else {
        newBookmarks.add(propertyId);
      }
      return newBookmarks;
    });
  };

  if (selectedProperty) {
    return (
      <PropertyDetail
        property={selectedProperty}
        onBack={() => setSelectedProperty(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <SearchBar 
        onSearch={handleSearch}
        onBookmarksClick={handleBookmarksClick}
      />
      <CategoryTabs
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />
      
      {/* Show bookmarks indicator */}
      {showBookmarks && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-700 px-4 py-2">
          <div className="max-w-7xl mx-auto">
            <p className="text-red-700 dark:text-red-300 text-sm font-medium">
              Showing {filteredProperties.length} bookmarked properties
            </p>
          </div>
        </div>
      )}
      
      {activeCategory === 'all' ? (
        <AllPropertiesView
          properties={filteredProperties}
          onPropertyClick={setSelectedProperty}
          bookmarkedProperties={bookmarkedProperties}
          onBookmarkToggle={handleBookmarkToggle}
        />
      ) : (
        <PropertyGrid
          properties={filteredProperties}
          onPropertyClick={setSelectedProperty}
          bookmarkedProperties={bookmarkedProperties}
          onBookmarkToggle={handleBookmarkToggle}
        />
      )}
    </div>
  );
};

export default HomeSeekerDashboard;