import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageOff, Pause, Play, X } from 'lucide-react';

interface VirtualTourProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ isOpen, onClose, images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (isOpen && isPlaying && images.length > 1) {
      const interval = window.setInterval(() => {
        setCurrentIndex((previous) => (previous + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [images.length, isOpen, isPlaying]);

  React.useEffect(() => {
    if (currentIndex >= images.length) setCurrentIndex(0);
  }, [currentIndex, images.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-lg font-bold truncate">{title}</h2>
            <button type="button" onClick={onClose} className="inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/20" aria-label="Close virtual tour">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {images.length > 0 ? (
          <img
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-center text-white/70">
            <div><ImageOff className="mx-auto h-10 w-10" /><p className="mt-3 text-sm font-bold">No tour photos available</p></div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <button type="button" onClick={prevImage} disabled={images.length < 2} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 disabled:opacity-40" aria-label="Previous tour photo"><ChevronLeft className="h-5 w-5" /></button>
              <span className="text-sm">{currentIndex + 1} / {images.length}</span>
              <button type="button" onClick={nextImage} disabled={images.length < 2} className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/20 disabled:opacity-40" aria-label="Next tour photo"><ChevronRight className="h-5 w-5" /></button>
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={images.length < 2}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 disabled:opacity-40"
              aria-label={isPlaying ? 'Pause virtual tour' : 'Play virtual tour'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
