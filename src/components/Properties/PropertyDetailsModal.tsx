import React, { useEffect, useMemo, useState } from 'react';
import {
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  MessageCircle,
  Play,
  Scale,
  Share2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Property } from '../../types';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';
import LazyImage from '../common/LazyImage';

interface PropertyDetailsModalProps {
  property: Property;
  onClose: () => void;
  onTour: (property: Property) => void;
  onCompare: (property: Property) => void;
  onFavoriteToggle: (propertyId: string) => void;
  isFavorite: boolean;
  isInComparison: boolean;
}

const typeLabels: Record<Property['type'], string> = {
  sale: 'For sale',
  rent: 'For rent',
  shortstay: 'Short stay',
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

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  onClose,
  onTour,
  onCompare,
  onFavoriteToggle,
  isFavorite,
  isInComparison,
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [shareLabel, setShareLabel] = useState('Share');
  const images = useMemo(() => property.images?.filter(Boolean) || [], [property.images]);
  const whatsappUrl = buildListingWhatsAppUrl(property);

  useEffect(() => {
    setActiveImage(0);
  }, [property.id]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowLeft' && images.length > 1) {
        setActiveImage((current) => (current === 0 ? images.length - 1 : current - 1));
      }
      if (event.key === 'ArrowRight' && images.length > 1) {
        setActiveImage((current) => (current + 1) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [images.length, onClose]);

  const moveImage = (direction: number) => {
    if (images.length < 2) return;
    setActiveImage((current) => (current + direction + images.length) % images.length);
  };

  const handleShare = async () => {
    const shareData = {
      title: property.title,
      text: `${property.title} — ${formatPrice(property.price, property.type)} in ${property.location}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
      setShareLabel('Copied');
      window.setTimeout(() => setShareLabel('Share'), 1800);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') setShareLabel('Try again');
    }
  };

  const contactHost = () => {
    if (whatsappUrl) window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:items-center sm:p-4 lg:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="property-details-title"
        className="mobile-sheet flex max-h-[100dvh] w-full max-w-7xl flex-col overflow-hidden rounded-t-[1.75rem] border border-[color:var(--border)] bg-[color:var(--surface-solid)] shadow-[0_30px_100px_rgba(2,6,23,0.42)] sm:max-h-[94dvh] sm:rounded-[1.75rem]"
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-[color:var(--border)] sm:hidden" aria-hidden="true" />

        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[color:var(--border)] px-3 py-2.5 sm:px-5 sm:py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--brand)]">Listing details</p>
            <p className="truncate text-sm font-bold text-[color:var(--text)] sm:text-base">{property.title}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button type="button" onClick={handleShare} className="ghost-button inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold sm:px-4" aria-label="Share this listing">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{shareLabel}</span>
            </button>
            <button
              type="button"
              onClick={() => onFavoriteToggle(property.id)}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)] ${isFavorite ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300' : 'border-[color:var(--border)] text-[color:var(--text-muted)] hover:text-rose-500'}`}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button type="button" onClick={onClose} className="ghost-button inline-flex h-10 w-10 items-center justify-center rounded-full" aria-label="Close listing details">
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.75fr)]">
            <div className="min-w-0 border-b border-[color:var(--border)] lg:col-start-1 lg:row-start-1 lg:border-b-0 lg:border-r">
              <div className="relative overflow-hidden bg-slate-900">
                {images.length > 0 ? (
                  <LazyImage key={images[activeImage]} src={images[activeImage]} alt={`${property.title}, photo ${activeImage + 1}`} className="aspect-[4/3] w-full object-cover sm:aspect-[16/10] lg:h-[34rem] lg:aspect-auto" />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-[color:var(--surface-strong)] text-[color:var(--text-muted)] sm:aspect-[16/10] lg:h-[34rem] lg:aspect-auto">
                    <div className="text-center">
                      <Building2 className="mx-auto h-10 w-10" />
                      <p className="mt-3 text-sm font-bold">No property photos yet</p>
                    </div>
                  </div>
                )}

                <div className="absolute left-3 top-3 flex items-center gap-2 sm:left-5 sm:top-5">
                  <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-900 shadow-sm backdrop-blur">{typeLabels[property.type]}</span>
                  {images.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/65 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
                      <Camera className="h-3.5 w-3.5" /> {activeImage + 1}/{images.length}
                    </span>
                  )}
                </div>

                {images.length > 1 && (
                  <>
                    <button type="button" onClick={() => moveImage(-1)} className="absolute left-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Previous property photo">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => moveImage(1)} className="absolute right-3 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-900 shadow-lg transition hover:scale-105" aria-label="Next property photo">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>

              {images.length > 1 && (
                <div className="hide-scrollbar flex gap-2 overflow-x-auto border-b border-[color:var(--border)] p-3 sm:p-4">
                  {images.map((image, index) => (
                    <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-28 ${activeImage === index ? 'border-[color:var(--brand)]' : 'border-transparent opacity-70 hover:opacity-100'}`} aria-label={`Show property photo ${index + 1}`} aria-pressed={activeImage === index}>
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

            </div>

            <aside className="min-w-0 border-b border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-6 sm:px-7 sm:py-8 lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start lg:border-b-0 lg:px-8 lg:py-9">
              <div className="flex flex-col gap-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4 lg:block">
                <div className="min-w-0 flex-1">
                  <h2 id="property-details-title" className="text-3xl font-extrabold leading-[1.02] tracking-[-0.045em] text-[color:var(--text)] sm:text-4xl">{property.title}</h2>
                  <p className="mt-3 flex items-start gap-2 text-sm font-medium text-[color:var(--text-muted)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--brand)]" />
                    <span>{property.location}</span>
                  </p>
                </div>
                <div className="w-full border-t border-[color:var(--border)] pt-4 sm:w-auto sm:border-t-0 sm:pt-0 lg:mt-7">
                  <p className="whitespace-nowrap text-2xl font-extrabold tabular-nums text-[color:var(--brand)] sm:text-3xl">{formatPrice(property.price, property.type)}</p>
                  {property.type === 'shortstay' && <p className="mt-1 text-xs font-semibold text-[color:var(--text-muted)]">Confirm dates and total directly with the host</p>}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-3.5">
                  <BedDouble className="h-5 w-5 text-[color:var(--brand)]" />
                  <p className="mt-3 text-lg font-extrabold text-[color:var(--text)]">{property.bedrooms ?? '—'}</p>
                  <p className="text-xs font-semibold text-[color:var(--text-muted)]">Bedrooms</p>
                </div>
                <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-3.5">
                  <Bath className="h-5 w-5 text-[color:var(--brand)]" />
                  <p className="mt-3 text-lg font-extrabold text-[color:var(--text)]">{property.bathrooms ?? '—'}</p>
                  <p className="text-xs font-semibold text-[color:var(--text-muted)]">Bathrooms</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] p-4">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color:var(--brand-strong)] text-sm font-extrabold text-white">
                    {(property.agentName || 'FH').split(' ').slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[color:var(--text-muted)]">Listed by</p>
                    <p className="truncate font-bold text-[color:var(--text)]">{property.agentName || 'FindShelta host'}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300"><ShieldCheck className="h-3.5 w-3.5" /> Direct host contact</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 border-t border-[color:var(--border)] pt-3 text-xs text-[color:var(--text-muted)]">
                  <CalendarDays className="h-4 w-4" /> Listed {new Date(property.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              <div className="mt-6 hidden space-y-2.5 lg:block">
                <button type="button" onClick={contactHost} disabled={!whatsappUrl} className="pressable inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-base font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
                  <MessageCircle className="h-5 w-5" /> {whatsappUrl ? 'Contact host on WhatsApp' : 'Contact unavailable'}
                </button>
                <div className="grid grid-cols-2 gap-2.5">
                  <button type="button" onClick={() => onTour(property)} className="ghost-button inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold"><Play className="h-4 w-4" /> Tour</button>
                  <button type="button" onClick={() => onCompare(property)} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold ${isInComparison ? 'border-[color:var(--brand)] bg-blue-50 text-[color:var(--brand)] dark:bg-blue-950/30' : 'border-[color:var(--border)] text-[color:var(--text)] hover:border-[color:var(--brand)]'}`}>
                    <Scale className="h-4 w-4" /> {isInComparison ? 'Added' : 'Compare'}
                  </button>
                </div>
              </div>

              <p className="mt-5 hidden text-center text-xs leading-5 text-[color:var(--text-muted)] lg:block">FindShelta does not collect payment for this stay. Confirm availability and payment terms with the host.</p>
            </aside>

            <div className="space-y-8 px-4 py-7 sm:px-7 sm:py-9 lg:col-start-1 lg:row-start-2 lg:border-r lg:border-[color:var(--border)] lg:px-9">
              <section>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">About this stay</p>
                <p className="mt-3 whitespace-pre-line text-[15px] leading-7 text-[color:var(--text-muted)] sm:text-base">
                  {property.description || 'The host has not added a description for this property yet. Contact them directly for more information.'}
                </p>
              </section>

              <section>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">What this place offers</p>
                    <h3 className="mt-1 text-2xl font-bold text-[color:var(--text)]">Amenities</h3>
                  </div>
                  <span className="text-xs font-bold text-[color:var(--text-muted)]">{property.amenities?.length || 0} listed</span>
                </div>
                {property.amenities?.length > 0 ? (
                  <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={`${amenity}-${index}`} className="flex min-w-0 items-center gap-2.5 text-sm font-semibold text-[color:var(--text)]">
                        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[color:var(--brand)] dark:bg-blue-950/40"><Check className="h-3.5 w-3.5" /></span>
                        <span className="truncate capitalize">{amenity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[color:var(--text-muted)]">Ask the host which amenities are available.</p>
                )}
              </section>
            </div>
          </div>
        </div>

        <footer className="grid shrink-0 grid-cols-[auto_auto_1fr] gap-2 border-t border-[color:var(--border)] bg-[color:var(--surface-solid)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
          <button type="button" onClick={() => onCompare(property)} className={`inline-flex h-12 w-12 items-center justify-center rounded-xl border ${isInComparison ? 'border-[color:var(--brand)] bg-blue-50 text-[color:var(--brand)] dark:bg-blue-950/30' : 'border-[color:var(--border)] text-[color:var(--text)]'}`} aria-label={isInComparison ? 'Added to comparison' : 'Add to comparison'}><Scale className="h-5 w-5" /></button>
          <button type="button" onClick={() => onTour(property)} className="ghost-button inline-flex h-12 w-12 items-center justify-center rounded-xl" aria-label="Open virtual tour"><Play className="h-5 w-5" /></button>
          <button type="button" onClick={contactHost} disabled={!whatsappUrl} className="pressable inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">
            <MessageCircle className="h-5 w-5" /> {whatsappUrl ? 'Contact host' : 'Contact unavailable'}
          </button>
        </footer>
      </section>
    </div>
  );
};

export default PropertyDetailsModal;
