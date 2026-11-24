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
    <article className="group min-w-0 overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface-solid)] sm:rounded-none">
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
        <span className="absolute left-2 top-2 bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-[0.06em] text-slate-800 sm:left-3 sm:top-3 sm:px-2.5 sm:text-[11px] sm:tracking-[0.08em]">
          Short stay
        </span>
      </button>

      <div className="p-2.5 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h3 className="line-clamp-2 min-h-9 text-sm font-bold leading-[1.25] text-[color:var(--text)] sm:min-h-0 sm:text-base sm:leading-snug">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-[color:var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {property.location}
            </p>
          </div>
          <p className="max-w-full text-sm font-extrabold leading-tight tabular-nums text-[color:var(--brand)] sm:shrink-0 sm:whitespace-nowrap sm:text-right sm:font-bold">{formatNightlyPrice(property.price)}</p>
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-[color:var(--border)] pt-2.5 text-[11px] font-semibold text-[color:var(--text-muted)] sm:mt-4 sm:gap-4 sm:pt-3 sm:text-xs">
          <span className="inline-flex min-w-0 items-center gap-1">
            <Bed className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> {property.bedrooms ?? '—'} {property.bedrooms === 1 ? 'bed' : 'beds'}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1">
            <Bath className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" /> {property.bathrooms ?? '—'} {property.bathrooms === 1 ? 'bath' : 'baths'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onViewDetails(property)}
          className="pressable mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-[color:var(--brand-strong)] px-2 py-2 text-xs font-bold text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)] sm:mt-4 sm:min-h-11 sm:gap-2 sm:rounded-none sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <Eye className="h-4 w-4" />
          <span className="sm:hidden">Details</span>
          <span className="hidden sm:inline">View full details</span>
        </button>
      </div>
    </article>
  );
};

export default PublicPropertyCard;
