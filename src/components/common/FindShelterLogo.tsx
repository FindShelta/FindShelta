import React from 'react';

interface FindSheltaLogoProps {
  size?: number;
  className?: string;
}

const FindSheltaLogo: React.FC<FindSheltaLogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-center overflow-hidden rounded-xl ${className}`}>
      <img
        src="/findshelta-logo.png"
        alt="FindShelta Logo"
        width={size}
        height={size}
        className="object-contain"
        style={{
          width: size,
          height: size
        }}
      />
    </div>
  );
};

export default FindSheltaLogo;
