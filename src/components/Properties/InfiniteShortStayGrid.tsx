import { useEffect, useRef, useState } from 'react';
import { Building2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useShortStayListings from '../../hooks/useShortStayListings';
import { useAuth } from '../../contexts/AuthContext';
import { Property } from '../../types';
import PublicPropertyCard from './PublicPropertyCard';
import PropertyDetailsModal from './PropertyDetailsModal';

interface InfiniteShortStayGridProps {
  city?: string;
  limit?: number;
  emptyTitle?: string;
  emptyMessage?: string;
}

const InfiniteShortStayGrid: React.FC<InfiniteShortStayGridProps> = ({
  city,
  limit,
  emptyTitle = 'New stays are on the way',
  emptyMessage = 'Join FindShelta and be the first to know when a short stay becomes available.',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { properties, loading, loadingMore, hasMore, error, loadMore } = useShortStayListings(city);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const displayedProperties = limit ? properties.slice(0, limit) : properties;

  useEffect(() => {
    if (limit || !hasMore || loading) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '320px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, limit, loadMore, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-[color:var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin text-[color:var(--brand)]" /> Loading available stays…
      </div>
    );
  }

  if (error) {
    return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">{error}</div>;
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-14 text-center">
        <Building2 className="mx-auto h-9 w-9 text-[color:var(--brand)]" />
        <h3 className="mt-3 text-xl font-bold text-[color:var(--text)]">{emptyTitle}</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[color:var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {displayedProperties.map((property, index) => (
          <div key={property.id} style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }} className="app-card">
            <PublicPropertyCard property={property} onViewDetails={setSelectedProperty} />
          </div>
        ))}
      </div>
      {!limit && <div ref={sentinelRef} className="h-4" aria-hidden="true" />}
      {!limit && loadingMore && (
        <div className="flex items-center justify-center gap-2 py-8 text-sm text-[color:var(--text-muted)]">
          <Loader2 className="h-5 w-5 animate-spin text-[color:var(--brand)]" /> Loading more stays…
        </div>
      )}
      {!limit && !hasMore && (
        <p className="py-8 text-center text-sm font-medium text-[color:var(--text-muted)]">
          You’ve seen all available properties.
        </p>
      )}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onRequireAuth={!user ? () => {
            setSelectedProperty(null);
            navigate('/register');
          } : undefined}
        />
      )}
    </>
  );
};

export default InfiniteShortStayGrid;
