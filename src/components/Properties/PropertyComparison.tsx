import React from 'react';
import { X, MapPin, Bed, Bath, Phone, Wifi, Car, Shield, Camera } from 'lucide-react';
import { useComparison } from '../../contexts/ComparisonContext';
import { Property } from '../../types';
import { buildListingWhatsAppUrl } from '../../lib/whatsapp';

interface PropertyComparisonProps {
  isOpen: boolean;
  onClose: () => void;
}

const PropertyComparison: React.FC<PropertyComparisonProps> = ({ isOpen, onClose }) => {
  const { comparisonList, removeFromComparison, clearComparison } = useComparison();

  const formatPrice = (price: number, type: string) => {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    });
    const suffix = type === 'rent' ? '/year' : type === 'shortstay' ? '/night' : '';
    return formatter.format(price) + suffix;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'parking': return <Car className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              Compare Properties ({comparisonList.length}/3)
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={clearComparison}
                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Clear All
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {comparisonList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <MapPin className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No properties to compare
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Add properties to comparison by clicking the "Compare" button on property cards
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 min-w-full">
                {comparisonList.map((property) => (
                  <div key={property.id} className="relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] shadow-sm">
                    <button
                      onClick={() => removeFromComparison(property.id)}
                      className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/90 text-red-500 shadow-sm backdrop-blur-sm transition hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="relative">
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="h-40 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <div className="absolute left-3 top-3 flex items-center gap-2">
                        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          property.type === 'sale'
                            ? 'bg-blue-100 text-blue-700'
                            : property.type === 'rent'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {property.type === 'sale' ? 'For Sale' : property.type === 'rent' ? 'For Rent' : 'Short Stay'}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                          <Camera className="h-3 w-3" />
                          {property.images?.length || 0}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">Compare</p>
                        <p className="text-xl font-bold text-white">{formatPrice(property.price, property.type)}</p>
                      </div>
                    </div>

                    <div className="space-y-4 p-4">
                      <div>
                        <h3 className="text-base font-semibold text-[color:var(--text)] line-clamp-2">
                          {property.title}
                        </h3>
                        <div className="mt-2 flex items-center text-xs text-[color:var(--text-muted)]">
                          <MapPin className="mr-1 h-3.5 w-3.5 shrink-0 text-[color:var(--brand)]" />
                          <span className="truncate">{property.location}</span>
                        </div>
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

                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--text-muted)]">Amenities</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {property.amenities.slice(0, 4).map((amenity) => (
                            <div
                              key={amenity}
                              className="flex items-center space-x-1 rounded-full bg-[color:var(--surface-strong)] px-2.5 py-1 text-xs text-[color:var(--text-muted)]"
                            >
                              {getAmenityIcon(amenity)}
                              <span className="capitalize">{amenity}</span>
                            </div>
                          ))}
                        </div>
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
                        className="brand-button w-full rounded-xl px-3 py-2.5 text-sm font-semibold"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Contact Agent</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyComparison;
