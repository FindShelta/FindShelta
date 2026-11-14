import { Bath, Bed, Eye, MapPin } from 'lucide-react';
import { Property } from '../../types';
import { formatNightlyPrice } from '../../lib/listings';
import LazyImage from '../common/LazyImage';

interface PublicPropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
}

const PublicPropertyCard: React.FC<PublicPropertyCardProps> = ({ property, onViewDetails }) => {
  return (
    <article className="group overflow-hidden border border-[color:var(--border)] bg-[color:var(--surface-solid)]">
      <button
        type="button"
        onClick={() => onViewDetails(property)}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[color:var(--surface-strong)] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
        aria-label={`View details for ${property.title}`}
      >
        <LazyImage
          src={property.images[0]}
          alt={property.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <span className="absolute left-3 top-3 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-800">
          Short stay
        </span>
      </button>

      <div className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-[color:var(--text)]">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.location}
            </p>
          </div>
          <p className="shrink-0 whitespace-nowrap text-lg font-extrabold tabular-nums text-[color:var(--brand)] sm:text-right sm:text-sm sm:font-bold">{formatNightlyPrice(property.price)}</p>
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
          onClick={() => onViewDetails(property)}
          className="pressable mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[color:var(--brand-strong)] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
        >
          <Eye className="h-4 w-4" />
          View full details
        </button>
      </div>
    </article>
  );
};

export default PublicPropertyCard;
