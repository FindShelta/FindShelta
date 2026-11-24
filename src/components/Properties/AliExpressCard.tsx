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
        className="app-card group min-w-0 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[color:var(--brand)] hover:shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:rounded-[1.35rem]"
      >
        <div className="relative m-1.5 mb-0 overflow-hidden rounded-xl bg-[color:var(--surface-strong)] sm:m-2.5 sm:mb-0 sm:rounded-[1rem]">
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

          <div className="absolute left-2 top-2 flex items-center gap-2 sm:left-3 sm:top-3">
            <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] shadow-sm backdrop-blur-sm sm:px-2.5 sm:text-[10px] sm:tracking-[0.08em] ${typeStyles[property.type].chip}`}>
              {typeStyles[property.type].label}
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(property.id);
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/90 text-slate-600 shadow-sm backdrop-blur-sm transition hover:scale-105 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-3 sm:top-3 sm:h-9 sm:w-9"
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
          </button>

          {!!imageCount && (
            <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 text-[9px] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:gap-1.5 sm:px-2.5 sm:text-[11px]">
              <Camera className="h-3 w-3" />
              {imageCount} {imageCount === 1 ? 'photo' : 'photos'}
            </span>
          )}
        </div>

        <div className="px-2.5 pb-2.5 pt-3 sm:px-4 sm:pb-3 sm:pt-4">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-[color:var(--text-muted)] sm:gap-1.5 sm:text-xs">
            <MapPin className="h-3 w-3 shrink-0 text-[color:var(--brand)] sm:h-3.5 sm:w-3.5" />
            <span className="truncate">{compactLocation}</span>
          </div>
          <button type="button" onClick={() => onSelect(property)} className="mt-1.5 block w-full text-left focus:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]">
            <h3 className="line-clamp-2 min-h-9 text-sm font-bold leading-[1.25] text-[color:var(--text)] transition group-hover:text-[color:var(--brand)] sm:min-h-11 sm:text-[17px] sm:leading-[1.3]">
              {property.title}
            </h3>
          </button>

          <div className="mt-2.5 flex flex-col items-start gap-2 sm:mt-3 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-[color:var(--text-muted)] sm:gap-3 sm:text-xs">
              <span className="inline-flex items-center gap-1">
                <Bed className="h-3.5 w-3.5 text-[color:var(--brand)] sm:h-4 sm:w-4" />
                {property.bedrooms ?? '—'} {property.bedrooms === 1 ? 'bed' : 'beds'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-[color:var(--brand)] sm:h-4 sm:w-4" />
                {property.bathrooms ?? '—'} {property.bathrooms === 1 ? 'bath' : 'baths'}
              </span>
            </div>
            <p className="max-w-full text-left text-sm font-bold leading-tight text-[color:var(--text)] sm:shrink-0 sm:text-right sm:text-base">
              {formatPrice(property.price, property.type)}
            </p>
          </div>
        </div>

        <div className="border-t border-[color:var(--border)] p-2 sm:flex sm:items-center sm:gap-1 sm:px-3 sm:py-2.5">
          <button type="button" onClick={() => onSelect(property)} className="brand-button inline-flex min-h-9 w-full items-center justify-center rounded-xl px-2 text-[11px] font-bold sm:hidden">
            View details
          </button>
          <div className="hidden w-full items-center gap-1 sm:flex">
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
        </div>
      </article>
    );
  }
);

AliExpressCard.displayName = 'AliExpressCard';

export default AliExpressCard;
