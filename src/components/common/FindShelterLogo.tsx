import React from 'react';

interface FindSheltaLogoProps {
  size?: number;
  className?: string;
}

const FindSheltaLogo: React.FC<FindSheltaLogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <img
        src="/WhatsApp Image 2025-07-25 at 11.53.18 AM.jpeg"
        alt="FindShelta Logo"
        width={size}
        height={size}
        className="object-contain drop-shadow-lg rounded-lg"
        style={{
          maxWidth: size,
          maxHeight: size,
          width: 'auto',
          height: 'auto'
        }}
      />
    </div>
  );
};

export default FindSheltaLogo;