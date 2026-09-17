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
  const [imgFailed, setImgFailed] = useState(false);

  // If custom logo URL is provided and has not failed loading, display it
  if (customLogoUrl && !imgFailed) {
    return (
      <div
        className={`relative flex items-center justify-center select-none shrink-0 ${className}`}
        style={{ width: size, height: size }}
      >
        {showGlow && (
          <div
            className="absolute inset-0 rounded-xl bg-cyan-500/25 blur-md -z-10 animate-pulse"
            aria-hidden="true"
          />
        )}
        <div className="relative w-full h-full rounded-xl overflow-hidden border border-cyan-500/40 bg-zinc-950/90 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center">
          <img
            src={customLogoUrl}
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain p-0.5"
            onError={() => setImgFailed(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        aria-label="Grimório - D20 Arcano em Chamas Azuis"
      >
        <defs>
          {/* Azure Cyan Arcane Fire Gradient */}
          <linearGradient id="azureFireGrad" x1="50%" y1="100%" x2="50%" y2="0%">
            <stop offset="0%" stopColor="#0284c7" />
            <stop offset="35%" stopColor="#0ea5e9" />
            <stop offset="70%" stopColor="#00e5ff" />
            <stop offset="100%" stopColor="#e0f2fe" />
          </linearGradient>

          {/* D20 Dark Navy/Midnight Facet Gradients */}
          <linearGradient id="d20FacetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f2238" />
            <stop offset="100%" stopColor="#07111c" />
          </linearGradient>

          <linearGradient id="d20FacetGrad2" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#173557" />
            <stop offset="100%" stopColor="#0b1b2d" />
          </linearGradient>

          {/* Arcane Book Frame Gradient */}
          <linearGradient id="bookLeather" x1="0" y1="0" x2="100" y2="100">
            <stop offset="0%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#0c1017" />
          </linearGradient>

          {/* Cyan Glow Filter */}
          {showGlow && (
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Outer Squircle / Grimoire Base when large enough */}
        {size >= 28 && (
          <g>
            <rect x="3" y="3" width="94" height="94" rx="20" fill="url(#bookLeather)" stroke="#222d3d" strokeWidth="1.5" />
            <rect x="7" y="7" width="86" height="86" rx="17" fill="none" stroke="#161f2c" strokeDasharray="2.5 2" strokeWidth="1" />
            <circle cx="50" cy="50" r="36" stroke="#1c2838" strokeWidth="1.2" strokeDasharray="3 2" fill="none" />
          </g>
        )}

        {/* Outer Azure Flame Contours & Wisps */}
        <g
          filter={showGlow ? 'url(#cyanGlow)' : undefined}
          stroke="url(#azureFireGrad)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.95"
        >
          {/* Flame tip left */}
          <path d="M 28 44 C 22 36 24 24 33 19 C 31 25 35 29 37 32" />
          {/* Main top flame tongue */}
          <path d="M 43 25 C 44 14 50 6 52 4 C 54 11 58 18 56 26 C 60 20 66 18 68 12 C 70 20 67 27 63 32" />
          {/* Flame tip right */}
          <path d="M 72 42 C 78 35 80 26 76 18 C 74 24 71 27 69 31" />
          {/* Lower swirling embers */}
          <path d="M 23 60 C 18 68 22 78 28 84 C 27 77 30 73 34 70" />
          <path d="M 77 62 C 83 70 80 81 73 87 C 73 80 70 76 66 72" />
          {/* Bottom gentle root fire */}
          <path d="M 45 88 C 48 94 52 97 53 96 C 54 92 52 89 50 87" />
        </g>

        {/* Small cyan ember sparks */}
        <circle cx="21" cy="28" r="1.2" fill="#38bdf8" opacity="0.9" />
        <circle cx="80" cy="26" r="1.4" fill="#00e5ff" opacity="0.95" />
        <circle cx="50" cy="8" r="1.3" fill="#e0f2fe" opacity="0.95" />
        <circle cx="17" cy="54" r="1.0" fill="#0284c7" opacity="0.75" />
        <circle cx="83" cy="52" r="1.1" fill="#38bdf8" opacity="0.8" />

        {/* D20 Body Silhouette Base */}
        <polygon
          points="50,22 77,37 77,69 50,84 23,69 23,37"
          fill="url(#d20FacetGrad1)"
          stroke="#0284c7"
          strokeWidth="1.4"
        />

        {/* Central triangular face of D20 */}
        <polygon
          points="50,38 67,66 33,66"
          fill="url(#d20FacetGrad2)"
          stroke="#00e5ff"
          strokeWidth="1.3"
        />

        {/* Connecting vertices to form the icosahedral geometry */}
        <line x1="50" y1="22" x2="50" y2="38" stroke="#0ea5e9" strokeWidth="1.1" />
        <line x1="50" y1="22" x2="33" y2="37" stroke="#0369a1" strokeWidth="0.9" strokeDasharray="1.5 1" />
        <line x1="50" y1="22" x2="67" y2="37" stroke="#0369a1" strokeWidth="0.9" strokeDasharray="1.5 1" />

        <line x1="23" y1="37" x2="50" y2="38" stroke="#0ea5e9" strokeWidth="1.1" />
        <line x1="77" y1="37" x2="50" y2="38" stroke="#0ea5e9" strokeWidth="1.1" />

        <line x1="23" y1="37" x2="33" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />
        <line x1="77" y1="37" x2="67" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />

        <line x1="23" y1="69" x2="33" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />
        <line x1="77" y1="69" x2="67" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />

        <line x1="50" y1="84" x2="33" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />
        <line x1="50" y1="84" x2="67" y2="66" stroke="#0ea5e9" strokeWidth="1.1" />

        {/* Numbers on visible facets */}
        <text x="30" y="52" fill="#38bdf8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">2</text>
        <text x="66" y="52" fill="#38bdf8" fontSize="6" fontWeight="bold" fontFamily="sans-serif">14</text>
        <text x="50" y="77" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">8</text>

        {/* The radiant "20" inscribed in central face with electric cyan/azure glow */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#e0f2fe"
          fontSize="13.5"
          fontWeight="900"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
          filter={showGlow ? 'url(#cyanGlow)' : undefined}
        >
          20
        </text>
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#38bdf8"
          fontSize="13.5"
          fontWeight="900"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          letterSpacing="-0.5"
        >
          20
        </text>

        {/* Electric flame accent along outer edges */}
        <path
          d="M 50 22 L 77 37 L 77 50"
          stroke="url(#azureFireGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M 23 52 L 23 69 L 50 84"
          stroke="url(#azureFireGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
