import React from 'react';

interface FlamingD20LogoProps {
  className?: string;
  size?: number;
  showGlow?: boolean;
}

export const FlamingD20Logo: React.FC<FlamingD20LogoProps> = ({
  className = '',
  size = 34,
  showGlow = true,
}) => {
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
        aria-label="Grimório - D20 em Chamas"
      >
        <defs>
          {/* Flame Gradient */}
          <linearGradient id="fireGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#b45309" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="85%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#fed7aa" />
          </linearGradient>

          {/* D20 Facet Gradients */}
          <linearGradient id="d20FacetGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#18181b" />
          </linearGradient>

          <linearGradient id="d20FacetGrad2" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#3f3f46" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#18181b" stopOpacity="0.8" />
          </linearGradient>

          {/* Amber Glow Filter */}
          {showGlow && (
            <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Outer Flame Contours & Wisps (Subtle & Stylized) */}
        <g
          filter={showGlow ? 'url(#amberGlow)' : undefined}
          stroke="url(#fireGrad)"
          strokeWidth="1.75"
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

        {/* Small ember sparks */}
        <circle cx="21" cy="28" r="1.2" fill="#fbbf24" opacity="0.8" />
        <circle cx="80" cy="26" r="1.4" fill="#f59e0b" opacity="0.85" />
        <circle cx="50" cy="8" r="1.2" fill="#fed7aa" opacity="0.9" />
        <circle cx="17" cy="54" r="1.0" fill="#f59e0b" opacity="0.7" />
        <circle cx="83" cy="52" r="1.1" fill="#fbbf24" opacity="0.75" />

        {/* D20 Body Silhouette Base */}
        <polygon
          points="50,22 77,37 77,69 50,84 23,69 23,37"
          fill="url(#d20FacetGrad1)"
          stroke="#52525b"
          strokeWidth="1.2"
        />

        {/* Central triangular face of D20 */}
        <polygon
          points="50,38 67,66 33,66"
          fill="url(#d20FacetGrad2)"
          stroke="#71717a"
          strokeWidth="1.2"
        />

        {/* Connecting vertices to form the icosahedral geometry */}
        {/* Top vertex to central face */}
        <line x1="50" y1="22" x2="50" y2="38" stroke="#71717a" strokeWidth="1.1" />
        <line x1="50" y1="22" x2="33" y2="37" stroke="#3f3f46" strokeWidth="0.9" strokeDasharray="1.5 1" />
        <line x1="50" y1="22" x2="67" y2="37" stroke="#3f3f46" strokeWidth="0.9" strokeDasharray="1.5 1" />

        {/* Upper lateral connections */}
        <line x1="23" y1="37" x2="50" y2="38" stroke="#71717a" strokeWidth="1.1" />
        <line x1="77" y1="37" x2="50" y2="38" stroke="#71717a" strokeWidth="1.1" />

        {/* Side connections to central triangle base vertices */}
        <line x1="23" y1="37" x2="33" y2="66" stroke="#71717a" strokeWidth="1.1" />
        <line x1="77" y1="37" x2="67" y2="66" stroke="#71717a" strokeWidth="1.1" />

        {/* Lower lateral connections */}
        <line x1="23" y1="69" x2="33" y2="66" stroke="#71717a" strokeWidth="1.1" />
        <line x1="77" y1="69" x2="67" y2="66" stroke="#71717a" strokeWidth="1.1" />

        {/* Bottom vertex connections */}
        <line x1="50" y1="84" x2="33" y2="66" stroke="#71717a" strokeWidth="1.1" />
        <line x1="50" y1="84" x2="67" y2="66" stroke="#71717a" strokeWidth="1.1" />

        {/* The legendary "20" inscribed in central face with fiery golden glow */}
        <text
          x="50"
          y="56"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#fbbf24"
          fontSize="13"
          fontWeight="bold"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
          letterSpacing="-0.5"
          filter={showGlow ? 'url(#amberGlow)' : undefined}
        >
          20
        </text>

        {/* Subtle fiery rim accent on the D20 edges */}
        <path
          d="M 50 22 L 77 37 L 77 50"
          stroke="url(#fireGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.8"
        />
        <path
          d="M 23 52 L 23 69 L 50 84"
          stroke="url(#fireGrad)"
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};
