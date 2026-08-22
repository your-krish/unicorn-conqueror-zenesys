import React, { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';

interface ThemeSelectorProps {
  compact?: boolean;
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  compact = false,
  className = '' 
}) => {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 3, width: 32 });
  const [isHovered, setIsHovered] = useState(false);

  const themeOptions: { mode: ThemeMode; label: string; icon: React.FC<{ className?: string }>; tooltip: string }[] = [
    { 
      mode: 'light', 
      label: 'Light', 
      icon: Sun, 
      tooltip: 'Pristine Light Theme (#FBFBFA)' 
    },
    { 
      mode: 'system', 
      label: 'Auto', 
      icon: Laptop, 
      tooltip: `System Default (Auto-detect: ${resolvedTheme === 'dark' ? 'Dark' : 'Light'})` 
    },
    { 
      mode: 'dark', 
      label: 'Dark', 
      icon: Moon, 
      tooltip: 'Obsidian Dark Theme (#0C0D10)' 
    },
  ];

  // Update liquid glass pill indicator coordinates when active mode changes
  useEffect(() => {
    if (!containerRef.current) return;
    const activeButton = containerRef.current.querySelector<HTMLButtonElement>(`button[data-mode="${themeMode}"]`);
    if (activeButton) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      setIndicatorStyle({
        left: buttonRect.left - containerRect.left,
        width: buttonRect.width,
      });
    }
  }, [themeMode, compact]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const activeButton = containerRef.current.querySelector<HTMLButtonElement>(`button[data-mode="${themeMode}"]`);
      if (activeButton) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();
        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [themeMode]);

  return (
    <div 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`liquid-glass-container ${isHovered ? 'emerald-glow' : ''} ${className}`}
      role="radiogroup"
      aria-label="Theme selection mode"
    >
      {/* Fluid Liquid Refraction Indicator */}
      <div 
        className="liquid-glass-indicator"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
        }}
        aria-hidden="true"
      />

      {/* 3 Theme Mode Buttons */}
      {themeOptions.map((opt) => {
        const Icon = opt.icon;
        const isActive = themeMode === opt.mode;

        return (
          <button
            key={opt.mode}
            data-mode={opt.mode}
            onClick={() => setThemeMode(opt.mode)}
            role="radio"
            aria-checked={isActive}
            title={opt.tooltip}
            className={`liquid-glass-btn ${isActive ? 'active' : ''} ${compact ? 'px-2 py-1.5' : 'px-2.5 sm:px-3 py-1.5'}`}
          >
            <Icon 
              className={`h-3.5 w-3.5 transition-transform duration-300 ${
                isActive 
                  ? opt.mode === 'light' 
                    ? 'text-amber-500 scale-110 rotate-12' 
                    : opt.mode === 'dark' 
                    ? 'text-emerald-500 scale-110 -rotate-12' 
                    : 'text-indigo-500 scale-110'
                  : 'text-[var(--text-metadata)] group-hover:text-[var(--text-primary)]'
              }`} 
            />

            {!compact && (
              <span className={`text-[11px] tracking-tight font-medium ${
                isActive 
                  ? 'text-[var(--text-primary)] font-bold' 
                  : 'text-[var(--text-muted)]'
              }`}>
                {opt.label}
              </span>
            )}

            {/* If in system mode and active, show small dynamic dot indicating resolved theme */}
            {opt.mode === 'system' && isActive && (
              <span 
                className="h-1.5 w-1.5 rounded-full bg-indigo-500 ring-1 ring-[var(--bg-surface)] animate-pulse" 
                title={`System active: ${resolvedTheme}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
