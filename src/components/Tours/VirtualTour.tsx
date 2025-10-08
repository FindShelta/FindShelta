import React, { useState } from 'react';
import { X, Play, Pause, ZoomIn, ZoomOut } from 'lucide-react';

interface VirtualTourProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
}

const VirtualTour: React.FC<VirtualTourProps> = ({ isOpen, onClose, images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!isOpen) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(nextImage, 3000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <h2 className="text-lg font-bold truncate">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <img
          src={images[currentIndex]}
          alt={`${title} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-2">
              <button onClick={prevImage} className="p-2 bg-white/20 rounded-lg">←</button>
              <span className="text-sm">{currentIndex + 1} / {images.length}</span>
              <button onClick={nextImage} className="p-2 bg-white/20 rounded-lg">→</button>
            </div>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 bg-blue-600 rounded-lg"
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