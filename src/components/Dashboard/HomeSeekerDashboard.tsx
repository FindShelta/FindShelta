import React, { useState, useEffect } from 'react';
import { Property } from '../../types';
import { useComparison } from '../../contexts/ComparisonContext';
import { useAlerts } from '../../contexts/AlertContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { publicSupabase } from '../../lib/supabase';
import Header from '../Layout/Header';
import PropertyComparison from '../Properties/PropertyComparison';
import CreateAlertModal from '../Alerts/CreateAlertModal';
import AlertsList from '../Alerts/AlertsList';
import SaveSearchModal from '../Favorites/SaveSearchModal';
import FavoritesList from '../Favorites/FavoritesList';
import SavedSearchesList from '../Favorites/SavedSearchesList';
import VirtualTour from '../Tours/VirtualTour';
import MapSearch from '../Search/MapSearch';
import AliExpressCard from '../Properties/AliExpressCard';
import PropertyDetailsModal from '../Properties/PropertyDetailsModal';
import usePerformance from '../../hooks/usePerformance';
import { Search, Filter, Heart, X, Scale, Bell, Bookmark, Map, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { AVAILABLE_CITIES } from '../../lib/cities';
import { ListingRow, listingMatchesAvailableCity, mapListingToProperty, PUBLIC_LISTING_FEED_SELECT } from '../../lib/listings';

type DashboardFilters = {
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  location: string;
};

type SavedDashboardFilters = {
  searchQuery?: string;
  filters?: Partial<DashboardFilters>;
};

const ITEMS_PER_PAGE = 8;

const HomeSeekerDashboard: React.FC = () => {
  usePerformance('HomeSeekerDashboard');
  const activeCategory = 'shortstay' as const;
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const [showMapSearch, setShowMapSearch] = useState(false);
  const [selectedTourProperty, setSelectedTourProperty] = useState<Property | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const { comparisonList, addToComparison, isInComparison } = useComparison();
  const { alerts } = useAlerts();
  const { favorites, addToFavorites, removeFromFavorites, isFavorite, savedSearches } = useFavorites();
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    location: ''
  });

  // Fetch properties from Supabase
  useEffect(() => {
    void fetchProperties();
  }, []);

  const fetchProperties = async () => {
    const requestController = new AbortController();
    const requestTimeout = window.setTimeout(() => requestController.abort(), 15000);

    try {
      setLoading(true);
      setLoadError('');

      const { data, error } = await publicSupabase
        .from('listings')
        .select(PUBLIC_LISTING_FEED_SELECT)
        .eq('is_approved', true)
        .eq('property_type', 'shortstay')
        .order('created_at', { ascending: false })
        .abortSignal(requestController.signal);

      if (error) {
        console.error('Error fetching properties:', error);
        setLoadError('We could not load the available stays. Check your connection and try again.');
        setProperties([]);
        return;
      }

      const transformedProperties: Property[] = ((data || []) as unknown as ListingRow[])
        .filter((listing) => listingMatchesAvailableCity(listing, AVAILABLE_CITIES))
        .map(mapListingToProperty);
      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoadError('We could not load the available stays. Check your connection and try again.');
      setProperties([]);
    } finally {
      window.clearTimeout(requestTimeout);
      setLoading(false);
    }
  };

  // Filter properties based on search query, category, and filters
  const getFilteredProperties = () => {
    let filtered = properties;
    
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

    // Apply additional filters
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }
    if (filters.bedrooms) {
      filtered = filtered.filter(property => (property.bedrooms ?? 0) >= parseInt(filters.bedrooms));
    }
    if (filters.bathrooms) {
      filtered = filtered.filter(property => (property.bathrooms ?? 0) >= parseInt(filters.bathrooms));
    }
    if (filters.location.trim()) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredProperties = getFilteredProperties();
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / ITEMS_PER_PAGE));
  const paginatedProperties = filteredProperties.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const activeFilterCount = Object.values(filters).filter((value) => value.trim()).length;
  const activeAlertCount = alerts.filter((alert) => alert.is_active).length;

  useEffect(() => {
    setPage(1);
  }, [searchQuery, filters.minPrice, filters.maxPrice, filters.bedrooms, filters.bathrooms, filters.location]);

  const changePage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    setPage(nextPage);
    window.requestAnimationFrame(() => {
      document.getElementById('dashboard-listings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      location: ''
    });
    setSearchQuery('');
  };

  const handleBookmarkToggle = (propertyId: string) => {
    if (isFavorite(propertyId)) {
      removeFromFavorites(propertyId);
    } else {
      addToFavorites(propertyId);
    }
  };

  const getCurrentFilters = () => {
    return {
      activeCategory,
      searchQuery,
      filters
    };
  };

  const applyFilters = (savedFilters: SavedDashboardFilters) => {
    if (savedFilters.searchQuery) {
      setSearchQuery(savedFilters.searchQuery);
    }
    if (savedFilters.filters) {
      setFilters((current) => ({ ...current, ...savedFilters.filters }));
    }
    setShowSavedSearches(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      <Header />

      <div className="section-shell py-4 sm:py-6">
        <section className="panel rounded-2xl border border-[color:var(--border)] p-2.5 shadow-sm sm:p-3">
          <div className="flex items-stretch gap-2">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">Search stays</span>
              <span className="absolute left-2 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl bg-blue-50 text-[color:var(--brand)] dark:bg-blue-950/40">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="search"
                placeholder="Search city or area"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-14 min-h-14 w-full rounded-xl border-0 bg-[color:var(--surface-strong)] py-3 pl-14 pr-11 text-base font-semibold text-[color:var(--text)] outline-none ring-1 ring-inset ring-[color:var(--border)] placeholder:font-medium placeholder:text-[color:var(--text-muted)] focus:ring-2 focus:ring-[color:var(--brand)]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-1.5 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[color:var(--text-muted)] hover:bg-[color:var(--surface)]" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              )}
            </label>
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`relative inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold transition ${showFilters ? 'border-[color:var(--brand)] bg-[color:var(--brand-strong)] text-white' : 'border-[color:var(--border)] bg-[color:var(--surface-strong)] text-[color:var(--text)] hover:border-[color:var(--brand)]'}`}
              aria-label="Open filters"
              aria-expanded={showFilters}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
              {activeFilterCount > 0 && <span className="absolute -right-1.5 -top-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-bold text-slate-950">{activeFilterCount}</span>}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-end gap-1 border-t border-[color:var(--border)] pt-2">
            <button type="button" title="Map" onClick={() => setShowMapSearch((current) => !current)} className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${showMapSearch ? 'bg-[color:var(--brand-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'}`} aria-label="Map search" aria-pressed={showMapSearch}><Map className="h-4 w-4" /></button>
            <button type="button" title="Wishlist" onClick={() => setShowFavorites((current) => !current)} className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${showFavorites ? 'bg-[color:var(--brand-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'}`} aria-label={`Wishlist, ${favorites.size} items`} aria-pressed={showFavorites}><Heart className="h-4 w-4" /></button>
            <button type="button" title="Alerts" onClick={() => setShowAlerts((current) => !current)} className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${showAlerts ? 'bg-[color:var(--brand-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'}`} aria-label={`Alerts, ${activeAlertCount} active`} aria-pressed={showAlerts}><Bell className="h-4 w-4" /></button>
            <button type="button" title="Saved searches" onClick={() => setShowSavedSearches((current) => !current)} className={`relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${showSavedSearches ? 'bg-[color:var(--brand-strong)] text-white' : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text)]'}`} aria-label={`Saved searches, ${savedSearches.length} saved`} aria-pressed={showSavedSearches}><Bookmark className="h-4 w-4" /></button>
          </div>
        </section>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="section-shell pb-5">
          <section className="panel rounded-2xl border border-[color:var(--border)] p-4 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[color:var(--brand)]">Refine</p>
                <h2 className="mt-1 text-xl font-bold text-[color:var(--text)]">Narrow the list</h2>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-xl"
                aria-label="Close filters"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Min price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="brand-input min-h-12 w-full rounded-xl px-3 text-sm"
                  placeholder="₦0"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Max price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="brand-input min-h-12 w-full rounded-xl px-3 text-sm"
                  placeholder="Any"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Beds
                </label>
                <select
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                  className="brand-input min-h-12 w-full rounded-xl px-3 text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Baths
                </label>
                <select
                  value={filters.bathrooms}
                  onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  className="brand-input min-h-12 w-full rounded-xl px-3 text-sm"
                >
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.08em] text-[color:var(--text-muted)]">
                  Area
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="brand-input min-h-12 w-full rounded-xl px-3 text-sm"
                  placeholder="City or area"
                />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border)] pt-4">
              <button
                onClick={clearFilters}
                className="text-sm font-bold text-[color:var(--text-muted)] hover:text-[color:var(--text)]"
              >
                Reset
              </button>
              <div className="text-sm font-bold text-[color:var(--brand)]">
                {filteredProperties.length} stays
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Alerts Section */}
      {showAlerts && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Property Alerts</h3>
              <button
                onClick={() => setShowCreateAlert(true)}
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Create Alert
              </button>
            </div>
            <AlertsList />
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {showFavorites && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Wishlist</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{favorites.size} properties</span>
            </div>
            <FavoritesList />
          </div>
        </div>
      )}

      {/* Saved Searches Section */}
      {showSavedSearches && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Saved Searches</h3>
              <button
                onClick={() => setShowSaveSearch(true)}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Save Current
              </button>
            </div>
            <SavedSearchesList onApplySearch={applyFilters} />
          </div>
        </div>
      )}

      {/* Map Search Section */}
      {showMapSearch && (
        <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <MapSearch onLocationSelect={(location) => {
              setSearchQuery(location.address);
              setShowMapSearch(false);
            }} />
          </div>
        </div>
      )}

      {/* Properties Grid */}
      <div id="dashboard-listings" className="section-shell scroll-mt-24 py-4 sm:py-6 lg:py-8">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-[-0.03em] text-[color:var(--text)] sm:text-3xl">
            Available stays
          </h2>
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text-muted)] sm:text-sm">{filteredProperties.length} results</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading properties...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedProperties.map((property) => (
              <AliExpressCard
                key={property.id}
                property={property}
                onSelect={setSelectedProperty}
                onBookmarkToggle={handleBookmarkToggle}
                onTourClick={(prop) => {
                  setSelectedTourProperty(prop);
                  setShowVirtualTour(true);
                }}
                onCompareClick={addToComparison}
                isFavorite={isFavorite(property.id)}
                isInComparison={isInComparison(property.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && loadError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-10 text-center dark:border-rose-900/50 dark:bg-rose-950/20">
            <h3 className="text-xl font-bold text-[color:var(--text)]">Stays could not be loaded</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-[color:var(--text-muted)]">{loadError}</p>
            <button type="button" onClick={() => void fetchProperties()} className="brand-button mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold">
              <RefreshCw className="h-4 w-4" /> Try again
            </button>
          </div>
        )}

        {!loading && !loadError && filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {properties.length === 0 ? 'No properties available yet' : 'No properties found'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {properties.length === 0 
                ? 'New short stays are being added. Please check back soon.'
                : 'Try adjusting your search criteria or browse all properties'
              }
            </p>
            {properties.length === 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {!loading && filteredProperties.length > 0 && totalPages > 1 && (
          <nav className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-[color:var(--border)] pt-6" aria-label="Listing pages">
            <button
              type="button"
              onClick={() => changePage(page - 1)}
              disabled={page === 1}
              className="ghost-button inline-flex min-h-12 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            <p className="text-sm font-bold text-[color:var(--text)]">
              Page <span className="text-[color:var(--brand)]">{page}</span> of {totalPages}
            </p>
            <button
              type="button"
              onClick={() => changePage(page + 1)}
              disabled={page === totalPages}
              className="brand-button inline-flex min-h-12 items-center justify-center gap-1 rounded-xl px-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </div>

      <nav className="mobile-bottom-nav md:hidden" aria-label="Dashboard navigation">
        <div className="mobile-bottom-nav__inner">
          <button
            type="button"
            onClick={() => {
              setShowFavorites(false);
              setShowAlerts(false);
              setShowFilters(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`mobile-bottom-nav__item ${!showFavorites && !showAlerts && !showFilters ? 'is-active' : ''}`}
          >
            <span className="mobile-bottom-nav__icon"><Search className="h-5 w-5" /></span>
            <span>Finds</span>
          </button>
          <button type="button" onClick={() => setShowFavorites((current) => !current)} className={`mobile-bottom-nav__item ${showFavorites ? 'is-active' : ''}`}>
            <span className="mobile-bottom-nav__icon"><Heart className="h-5 w-5" /></span>
            <span>Wishlist</span>
          </button>
          <button type="button" onClick={() => setShowAlerts((current) => !current)} className={`mobile-bottom-nav__item ${showAlerts ? 'is-active' : ''}`}>
            <span className="mobile-bottom-nav__icon"><Bell className="h-5 w-5" /></span>
            <span>Alerts</span>
          </button>
          <button type="button" onClick={() => setShowFilters((current) => !current)} className={`mobile-bottom-nav__item ${showFilters ? 'is-active' : ''}`}>
            <span className="mobile-bottom-nav__icon"><Filter className="h-5 w-5" /></span>
            <span>Filters</span>
          </button>
        </div>
      </nav>

      {/* Floating Comparison Bar */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-20 left-3 right-3 z-40 md:bottom-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:transform">
          <div className="bg-blue-600 text-white rounded-xl p-3 sm:p-4 shadow-2xl max-w-md mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5" />
                <span className="font-medium text-sm sm:text-base">
                  {comparisonList.length} Properties Selected
                </span>
              </div>
              <button
                onClick={() => setShowComparison(true)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm sm:text-base"
              >
                Compare
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Comparison Modal */}
      <PropertyComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
      />

      {/* Create Alert Modal */}
      <CreateAlertModal
        isOpen={showCreateAlert}
        onClose={() => setShowCreateAlert(false)}
      />

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveSearch}
        onClose={() => setShowSaveSearch(false)}
        currentFilters={getCurrentFilters()}
      />

      {/* Virtual Tour Modal */}
      {selectedTourProperty && (
        <VirtualTour
          isOpen={showVirtualTour}
          onClose={() => {
            setShowVirtualTour(false);
            setSelectedTourProperty(null);
          }}
          images={selectedTourProperty.images}
          title={selectedTourProperty.title}
        />
      )}

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onTour={(property) => {
            setSelectedTourProperty(property);
            setShowVirtualTour(true);
          }}
          onCompare={addToComparison}
          onFavoriteToggle={handleBookmarkToggle}
          isFavorite={isFavorite(selectedProperty.id)}
          isInComparison={isInComparison(selectedProperty.id)}
        />
      )}
    </div>
  );
};

export default HomeSeekerDashboard;

