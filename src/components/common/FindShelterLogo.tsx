import React from 'react';

interface FindSheltaLogoProps {
  size?: number;
  className?: string;
}

const FindSheltaLogo: React.FC<FindSheltaLogoProps> = ({ size = 64, className = '' }) => {
  return (
    <div className={`inline-flex shrink-0 items-center justify-center ${className}`}>
      <img
        src="/findshelta-logo.png"
        alt="FindShelta"
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
