import React, { memo, useMemo } from 'react';
import { Property } from '../../types';
import LazyImage from '../common/LazyImage';
import { MapPin, Bed, Bath, Heart, Play, Scale, MessageCircle, Camera, ArrowUpRight } from 'lucide-react';
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
    const imageCount = property.images?.length || 0;
    const shortId = property.id?.slice(0, 8)?.toUpperCase();

    const openWhatsApp = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const whatsappUrl = buildListingWhatsAppUrl(property);
      if (!whatsappUrl) {
        alert('This listing does not have a WhatsApp contact number yet.');
        return;
      }
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
        className="group overflow-hidden rounded-[1.25rem] border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface-strong)]">
          <LazyImage
            src={property.images[0]}
            alt={property.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-2">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm ${typeStyles[property.type].chip}`}>
              {typeStyles[property.type].label}
            </span>
            {!!imageCount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                <Camera className="h-3 w-3" />
                {imageCount}
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(property.id);
            }}
            className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/90 text-[color:var(--text-muted)] shadow-sm backdrop-blur-sm hover:text-rose-500"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current text-rose-500' : ''}`} />
          </button>

          <div className="absolute bottom-0 left-0 right-0 p-3">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Listing</p>
                <p className="truncate text-lg font-bold text-white sm:text-xl">{formatPrice(property.price, property.type)}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/14 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                ID {shortId}
              </span>
            </div>
          </div>
        </div>

        <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-3`}>
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className={`${isMobile ? 'text-sm' : 'text-[15px]'} line-clamp-2 font-semibold leading-snug text-[color:var(--text)]`}>
                {property.title}
              </h3>
              <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--text-muted)] transition group-hover:text-[color:var(--brand)]" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[color:var(--brand)]" />
              <span className="truncate">{isMobile ? compactLocation : property.location}</span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-[color:var(--text-muted)]">
              {property.description || 'No description provided for this property yet.'}
            </p>
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
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Quick Actions</p>
              <p className="mt-0.5 text-xs text-[color:var(--text-muted)]">Preview, compare, or contact instantly</p>
            </div>
            <p className="text-sm font-bold text-[color:var(--brand)]">{formatPrice(property.price, property.type)}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTourClick(property);
              }}
              className="ghost-button inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold"
              aria-label="Open virtual tour"
              title="Virtual tour"
            >
              <Play className="h-3.5 w-3.5" />
              <span className={isMobile ? 'hidden' : 'inline'}>Tour</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCompareClick(property);
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold ${
                isInComparison
                  ? 'bg-[color:var(--brand)] text-white'
                  : 'ghost-button'
              }`}
              aria-label={isInComparison ? 'Added to comparison' : 'Add to comparison'}
              title={isInComparison ? 'Added to comparison' : 'Add to comparison'}
            >
              <Scale className="h-3.5 w-3.5" />
              <span className={isMobile ? 'hidden' : 'inline'}>{isInComparison ? 'Added' : 'Compare'}</span>
            </button>
            <button
              onClick={openWhatsApp}
              className="brand-button inline-flex items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold"
              aria-label="Contact on WhatsApp"
              title="Contact on WhatsApp"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className={isMobile ? 'hidden' : 'inline'}>Contact</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[color:var(--text-muted)]">
            <span className="truncate">Agent: {property.agentName || 'Agent'}</span>
            <span className="font-medium">{property.type === 'shortstay' ? 'Ready to book' : 'Verified listing'}</span>
          </div>
        </div>
      </article>
    );
  }
);

AliExpressCard.displayName = 'AliExpressCard';

export default AliExpressCard;
