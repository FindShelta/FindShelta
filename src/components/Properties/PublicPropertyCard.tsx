import { Bath, Bed, MapPin, MessageCircle } from 'lucide-react';
import { Property } from '../../types';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';
import { formatNightlyPrice } from '../../lib/listings';
import LazyImage from '../common/LazyImage';

interface PublicPropertyCardProps {
  property: Property;
}

const PublicPropertyCard: React.FC<PublicPropertyCardProps> = ({ property }) => {
  const contactHost = () => {
    const url = buildListingWhatsAppUrl(property);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="group overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface-solid)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[color:var(--surface-strong)]">
        <LazyImage
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-800">
          Short stay
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-[color:var(--text)]">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.location}
            </p>
          </div>
          <p className="shrink-0 text-sm font-bold text-[color:var(--brand)]">{formatNightlyPrice(property.price)}</p>
        </div>

        <div className="mt-4 flex items-center gap-4 border-t border-[color:var(--border)] pt-3 text-xs text-[color:var(--text-muted)]">
          <span className="inline-flex items-center gap-1">
            <Bed className="h-4 w-4" /> {property.bedrooms ?? '—'} beds
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath className="h-4 w-4" /> {property.bathrooms ?? '—'} baths
          </span>
        </div>

        <button
          type="button"
          onClick={contactHost}
          disabled={!property.agentWhatsapp}
          className="pressable mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <MessageCircle className="h-4 w-4" />
          {property.agentWhatsapp ? 'Book on WhatsApp' : 'Contact unavailable'}
        </button>
      </div>
    </article>
  );
};

export default PublicPropertyCard;
