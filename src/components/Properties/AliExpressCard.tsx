import React, { memo, useMemo } from 'react';
import { Property } from '../../types';
import LazyImage from '../common/LazyImage';
import { MapPin, Bed, Bath, Heart, Play, Scale, MessageCircle, Camera } from 'lucide-react';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';

interface AliExpressCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookmarkToggle: (propertyId: string) => void;
  onTourClick: (property: Property) => void;
  onCompareClick: (property: Property) => void;
  isFavorite: boolean;
  isInComparison: boolean;
}

const typeStyles: Record<Property['type'], { label: string; chip: string }> = {
  sale: { label: 'For Sale', chip: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  rent: { label: 'For Rent', chip: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  shortstay: { label: 'Short Stay', chip: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

const formatPrice = (price: number, type: Property['type']) => {
  const value = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price || 0);

  if (type === 'rent') return `${value}/year`;
  if (type === 'shortstay') return `${value}/night`;
  return value;
};

const AliExpressCard: React.FC<AliExpressCardProps> = memo(
  ({
    property,
    onSelect,
    onBookmarkToggle,
    onTourClick,
    onCompareClick,
    isFavorite,
    isInComparison,
  }) => {
    const compactLocation = useMemo(() => property.location?.split(',')[0]?.trim() || property.location, [property.location]);
    const imageCount = property.images?.length || 0;

    const openWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const whatsappUrl = buildListingWhatsAppUrl(property);
      if (!whatsappUrl) {
        alert('This listing does not have a WhatsApp contact number yet.');
        return;
      }
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
      <article
        className="app-card group overflow-hidden rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)]"
      >
        <div className="relative m-2.5 mb-0 overflow-hidden rounded-[1rem] bg-[color:var(--surface-strong)]">
          <button
            type="button"
            onClick={() => onSelect(property)}
            className="relative block aspect-[4/3] w-full overflow-hidden text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--brand)]"
            aria-label={`View ${property.title}`}
          >
            <LazyImage
              src={property.images[0]}
              alt={property.title}
              className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" aria-hidden="true" />
          </button>

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] shadow-sm backdrop-blur-sm ${typeStyles[property.type].chip}`}>
              {typeStyles[property.type].label}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(property.id);
            }}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
          </button>

          {!!imageCount && (
            <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <Camera className="h-3 w-3" />
              {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>

        <div className="px-4 pb-3 pt-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[color:var(--text-muted)]">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand)]" />
            <span className="truncate">{compactLocation}</span>
          </div>
          <button type="button" onClick={() => onSelect(property)} className="mt-1.5 block w-full text-left focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]">
            <h3 className="line-clamp-2 min-h-11 text-[17px] font-bold leading-[1.3] text-[color:var(--text)] transition group-hover:text-[color:var(--brand)]">
              {property.title}
            </h3>
          </button>

          <div className="mt-3 flex items-end justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3 text-xs font-semibold text-[color:var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-[color:var(--brand)]" />
                {property.bedrooms ?? '-'} bed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-[color:var(--brand)]" />
                {property.bathrooms ?? '-'} bath
              </span>
            </div>
            <p className="shrink-0 text-right text-base font-bold text-[color:var(--text)]">
              {formatPrice(property.price, property.type)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 border-t border-[color:var(--border)] px-3 py-2.5">
          <p className="mr-auto max-w-[36%] truncate px-1 text-[11px] font-medium text-[color:var(--text-muted)]">
            {property.agentName || 'FindShelta host'}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTourClick(property);
            }}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--text-muted)] transition hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--brand)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            aria-label="Open virtual tour"
            title="Virtual tour"
          >
            <Play className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCompareClick(property);
            }}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] ${
              isInComparison
                ? 'bg-[color:var(--brand)] text-white'
                : 'text-[color:var(--text-muted)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--brand)]'
            }`}
            aria-label={isInComparison ? 'Added to comparison' : 'Add to comparison'}
            title={isInComparison ? 'Added to comparison' : 'Add to comparison'}
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            className="brand-button inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold transition"
            aria-label="Contact on WhatsApp"
            title="Contact on WhatsApp"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Contact
          </button>
        </div>
      </article>
    );
  }
);

AliExpressCard.displayName = 'AliExpressCard';

export default AliExpressCard;
