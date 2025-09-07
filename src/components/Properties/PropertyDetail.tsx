import React, { useState } from 'react';
import { ArrowLeft, Share2, Bookmark, MessageCircle, MapPin, Bed, Bath, Wifi, Car, Shield, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Property } from '../../types';

interface PropertyDetailProps {
  property: Property;
  onBack: () => void;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ property, onBack }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
    switch (amenity.toLowerCase()) {
      case 'wifi':
        return <Wifi className="w-4 h-4" />;
      case 'parking':
        return <Car className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      default:
        return <span className="w-4 h-4 flex items-center justify-center text-xs">•</span>;
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent(`Hi! I'm interested in your property: ${property.title} listed at ${formatPrice(property.price, property.type)}`);
    const whatsappUrl = `https://wa.me/${property.agentWhatsapp.replace(/[^0-9]/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const mediaItems = [...property.images];
  if (property.video) {
    mediaItems.push(property.video);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-300'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Media Carousel */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-slate-800">
        {mediaItems.length > 0 && (
          <>
            {currentImageIndex < property.images.length ? (
              <img
                src={property.images[currentImageIndex]}
                alt={`${property.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="relative w-full h-full bg-black flex items-center justify-center">
                <video
                  src={property.video}
                  controls
                  className="w-full h-full object-cover"
                  poster={property.images[0]}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/50 rounded-full p-4">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Arrows */}
            {mediaItems.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {mediaItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentImageIndex === index ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Price and Basic Info */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
              {property.title}
            </h1>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(property.price, property.type)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{property.location}</span>
          </div>

          {/* Property Details */}
          <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-300">
            {property.bedrooms && (
              <div className="flex items-center">
                <Bed className="w-4 h-4 mr-1" />
                <span>{property.bedrooms} Bed{property.bedrooms > 1 ? 's' : ''}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex items-center">
                <Bath className="w-4 h-4 mr-1" />
                <span>{property.bathrooms} Bath{property.bathrooms > 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>

        {/* Amenities */}
        {property.amenities.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Amenities
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                  {getAmenityIcon(amenity)}
                  <span className="capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Description
          </h3>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {property.description}
          </p>
        </div>

        {/* Agent Info */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Listed by
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {property.agentName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Listed {new Date(property.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="sticky bottom-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 p-4">
        <button
          onClick={handleWhatsAppContact}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Chat with Agent on WhatsApp</span>
        </button>
      </div>
    </div>
  );
};

export default PropertyDetail;