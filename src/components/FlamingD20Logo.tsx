import React, { useState } from 'react';

interface FlamingD20LogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
  customLogoUrl?: string;
  alt?: string;
}

export const FlamingD20Logo: React.FC<FlamingD20LogoProps> = ({
  className = '',
  size = 34,
  showGlow = true,
  customLogoUrl,
  alt = 'Grimório - Ícone',
}) => {
  const [customFailed, setCustomFailed] = useState(false);
  const activeSrc = customLogoUrl && !customFailed ? customLogoUrl : '/icon.svg';

  return (
    <div
      className={`relative flex items-center justify-center select-none shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title="Grimório — D20 Arcano em Chamas"
    >
      {showGlow && (
        <div
          className="absolute inset-0 rounded-2xl bg-cyan-500/25 blur-md -z-10 animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}
      <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/40 bg-zinc-950 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center">
        <img
          src={activeSrc}
          alt={alt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover select-none pointer-events-none"
          onError={() => {
            if (customLogoUrl) {
              setCustomFailed(true);
            }
          }}
        />
      </div>
    </div>
  );
};
