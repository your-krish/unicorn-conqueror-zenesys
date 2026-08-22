import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = "h-9 w-9", size }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 500" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <radialGradient id="blCoreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="1" />
          <stop offset="35%" stopColor="#0284c7" stopOpacity="0.8" />
          <stop offset="70%" stopColor="#0369a1" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0c4a6e" stopOpacity="0" />
        </radialGradient>
        
        <linearGradient id="blNeonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>

        <linearGradient id="blGlassTop" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.75" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.1" />
        </linearGradient>

        <linearGradient id="blGlassLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#0369a1" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id="blGlassRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#075985" stopOpacity="0.15" />
        </linearGradient>

        <marker id="blArrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
        </marker>
        <marker id="blArrowCyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#00f2fe" />
        </marker>

        <filter id="blGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="blIntenseGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur1" />
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Dark Isometric Hexagonal Base Container */}
      <rect width="100%" height="100%" rx="90" fill="#040814" />

      {/* Central Ambient Halo */}
      <circle cx="250" cy="250" r="160" fill="url(#blCoreGlow)" opacity="0.6" />

      {/* Isometric Hexagonal Wireframe Cube Frame */}
      <g stroke="#0284c7" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="250,42 430,146 430,354 250,458 70,354 70,146" fill="none" stroke="#0ea5e9" strokeWidth="5.5" filter="url(#blGlow)" />
        
        {/* Isometric Axis Spokes with Arrow Flow */}
        <line x1="250" y1="250" x2="250" y2="46" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
        <line x1="250" y1="250" x2="426" y2="352" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
        <line x1="250" y1="250" x2="74" y2="352" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
        
        <line x1="426" y1="148" x2="252" y2="248" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
        <line x1="74" y1="148" x2="248" y2="248" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
        <line x1="250" y1="454" x2="250" y2="252" stroke="#00f2fe" strokeWidth="4.5" markerEnd="url(#blArrowCyan)" />
      </g>

      {/* Translucent Glass Isometric Diamond Plates */}
      {/* Top Face Plates */}
      <g stroke="#7dd3fc" strokeWidth="2.5">
        <polygon points="250,75 320,115 250,155 180,115" fill="url(#blGlassTop)" />
        <polygon points="340,125 410,165 340,205 270,165" fill="url(#blGlassTop)" />
        <polygon points="160,125 230,165 160,205 90,165" fill="url(#blGlassTop)" />
      </g>

      {/* Left Face Plates */}
      <g stroke="#38bdf8" strokeWidth="2.5">
        <polygon points="90,195 160,235 160,325 90,285" fill="url(#blGlassLeft)" />
        <polygon points="175,245 245,285 245,375 175,335" fill="url(#blGlassLeft)" />
        <polygon points="90,305 160,345 160,435 90,395" fill="url(#blGlassLeft)" opacity="0.6" />
      </g>

      {/* Right Face Plates */}
      <g stroke="#38bdf8" strokeWidth="2.5">
        <polygon points="410,195 340,235 340,325 410,285" fill="url(#blGlassRight)" />
        <polygon points="325,245 255,285 255,375 325,335" fill="url(#blGlassRight)" />
        <polygon points="410,305 340,345 340,435 410,395" fill="url(#blGlassRight)" opacity="0.6" />
      </g>

      {/* Data Flow Direction Arrows */}
      <g stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" fill="none">
        <line x1="210" y1="115" x2="280" y2="115" markerEnd="url(#blArrow)" />
        <line x1="375" y1="165" x2="310" y2="165" markerEnd="url(#blArrow)" />
        <line x1="125" y1="165" x2="195" y2="165" markerEnd="url(#blArrow)" />
        <line x1="125" y1="230" x2="125" y2="300" markerEnd="url(#blArrow)" />
        <line x1="210" y1="365" x2="210" y2="295" markerEnd="url(#blArrow)" />
        <line x1="375" y1="230" x2="375" y2="300" markerEnd="url(#blArrow)" />
        <line x1="290" y1="365" x2="290" y2="295" markerEnd="url(#blArrow)" />
      </g>

      {/* Inner Concentric Hexagonal Cyber Cores */}
      <polygon points="250,170 320,210 320,290 250,330 180,290 180,210" fill="none" stroke="#00f2fe" strokeWidth="3.5" opacity="0.95" filter="url(#blGlow)" />
      <polygon points="250,195 298,223 298,277 250,305 202,277 202,223" fill="none" stroke="#67e8f9" strokeWidth="2.5" opacity="0.8" />

      {/* Central Luminous Quantum Orb */}
      <circle cx="250" cy="250" r="46" fill="url(#blNeonCyan)" filter="url(#blIntenseGlow)" />
      <circle cx="250" cy="250" r="38" fill="#ffffff" opacity="0.95" />
      <circle cx="250" cy="250" r="22" fill="#a5f3fc" opacity="0.9" />

      {/* Cyan Node Junction Points */}
      <g fill="#0284c7" stroke="#38bdf8" strokeWidth="3" filter="url(#blGlow)">
        <circle cx="250" cy="42" r="12" fill="#00f2fe" />
        <circle cx="430" cy="146" r="12" fill="#00f2fe" />
        <circle cx="430" cy="354" r="12" fill="#00f2fe" />
        <circle cx="250" cy="458" r="12" fill="#00f2fe" />
        <circle cx="70" cy="354" r="12" fill="#00f2fe" />
        <circle cx="70" cy="146" r="12" fill="#00f2fe" />

        <circle cx="340" cy="92" r="8" fill="#38bdf8" />
        <circle cx="430" cy="250" r="8" fill="#38bdf8" />
        <circle cx="340" cy="408" r="8" fill="#38bdf8" />
        <circle cx="160" cy="408" r="8" fill="#38bdf8" />
        <circle cx="70" cy="250" r="8" fill="#38bdf8" />
        <circle cx="160" cy="92" r="8" fill="#38bdf8" />

        <circle cx="250" cy="170" r="7" fill="#e0f2fe" />
        <circle cx="320" cy="210" r="7" fill="#e0f2fe" />
        <circle cx="320" cy="290" r="7" fill="#e0f2fe" />
        <circle cx="250" cy="330" r="7" fill="#e0f2fe" />
        <circle cx="180" cy="290" r="7" fill="#e0f2fe" />
        <circle cx="180" cy="210" r="7" fill="#e0f2fe" />
      </g>
    </svg>
  );
};
