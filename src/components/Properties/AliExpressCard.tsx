import React, { memo, useMemo } from 'react';
import { Property } from '../../types';
import LazyImage from '../common/LazyImage';
import { MapPin, Bed, Bath, Heart, Play, Scale, MessageCircle } from 'lucide-react';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';

interface AliExpressCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  onBookmarkToggle: (propertyId: string) => void;
  onTourClick: (property: Property) => void;
  onCompareClick: (property: Property) => void;
  isFavorite: boolean;
  isInComparison: boolean;
  isMobile?: boolean;
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
    isMobile = false,
  }) => {
    const compactLocation = useMemo(() => property.location?.split(',')[0]?.trim() || property.location, [property.location]);

    const openWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      window.open(buildListingWhatsAppUrl(property), '_blank', 'noopener,noreferrer');
    };

    const onCardKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(property);
      }
    };

    return (
      <article
        role="button"
        tabIndex={0}
        aria-label={`Open property ${property.title}`}
        onClick={() => onSelect(property)}
        onKeyDown={onCardKeyDown}
        className="group overflow-hidden rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden border-b border-[color:var(--border)] bg-[color:var(--surface-strong)]">
          <LazyImage
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          <div className="absolute left-2 top-2">
            <span className={`rounded-md px-2 py-1 text-[11px] font-semibold ${typeStyles[property.type].chip}`}>
              {typeStyles[property.type].label}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(property.id);
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] text-[color:var(--text-muted)] hover:text-rose-500"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
          </button>
        </div>

        <div className={`${isMobile ? 'p-2.5' : 'p-3.5'} space-y-2.5`}>
          <div>
            <p className="text-base font-bold text-[color:var(--text)]">{formatPrice(property.price, property.type)}</p>
            <h3 className={`${isMobile ? 'text-xs' : 'text-sm'} mt-1 line-clamp-2 font-semibold leading-snug text-[color:var(--text)]`}>
              {property.title}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5" />
              <span className="truncate">{isMobile ? compactLocation : property.location}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-[color:var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              {property.bedrooms ?? '-'}
            </span>
            <span className="inline-flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              {property.bathrooms ?? '-'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTourClick(property);
              }}
              className="ghost-button inline-flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold"
              aria-label="Open virtual tour"
              title="Virtual tour"
            >
              <Play className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareClick(property);
              }}
              className={`inline-flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold ${
                isInComparison
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'ghost-button'
              }`}
              aria-label={isInComparison ? 'Added to comparison' : 'Add to comparison'}
              title={isInComparison ? 'Added to comparison' : 'Add to comparison'}
            >
              <Scale className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={openWhatsApp}
              className="brand-button inline-flex items-center justify-center rounded-md px-2 py-1.5 text-xs font-semibold"
              aria-label="Contact on WhatsApp"
              title="Contact on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  }
);

AliExpressCard.displayName = 'AliExpressCard';

export default AliExpressCard;
