import React from 'react';
import { Heart, MapPin, Bed, Bath, Phone, Trash2, Camera, ArrowUpRight } from 'lucide-react';
import { useFavorites } from '../../contexts/FavoritesContext';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';

const FavoritesList: React.FC = () => {
  const { favoriteProperties, loading, removeFromFavorites } = useFavorites();

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    const suffix = type === 'rent' ? '/year' : type === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Loading favorites...</p>
        </div>
      </div>
    );
  }

  if (favoriteProperties.length === 0) {
    return (
      <div className="text-center py-8">
        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No favorites yet</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm">Start adding properties to your favorites</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {favoriteProperties.map((property) => (
        <article key={property.id} className="overflow-hidden rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
          <div className="relative">
            <img
              src={property.images[0]}
              alt={property.title}
              className="h-48 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            <div className="absolute left-3 top-3 flex items-center gap-2">
              <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                {property.type === 'sale' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Short Stay'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Camera className="h-3 w-3" />
                {property.images?.length || 0}
              </span>
            </div>
            <button
              onClick={() => removeFromFavorites(property.id)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/90 text-red-500 shadow-sm backdrop-blur-sm transition hover:bg-white"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Saved Listing</p>
              <p className="text-xl font-bold text-white">{formatPrice(property.price, property.type)}</p>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[color:var(--text)]">
                {property.title}
              </h3>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--text-muted)]" />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand)]" />
              <span className="truncate">{property.location}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Bedrooms</p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text)]">
                  <Bed className="h-3.5 w-3.5 text-[color:var(--brand)]" />
                  {property.bedrooms ?? '-'}
                </div>
              </div>
              <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Bathrooms</p>
                <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[color:var(--text)]">
                  <Bath className="h-3.5 w-3.5 text-[color:var(--brand)]" />
                  {property.bathrooms ?? '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[color:var(--border)] bg-[color:var(--surface-strong)] px-3 py-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Agent</p>
                <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">{property.agentName || 'Agent'}</p>
              </div>
              <button
                onClick={() => {
                  const whatsappUrl = buildListingWhatsAppUrl(property);
                  if (!whatsappUrl) {
                    alert('This listing does not have a WhatsApp contact number yet.');
                    return;
                  }
                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                }}
                className="brand-button inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Contact</span>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

export default FavoritesList;
