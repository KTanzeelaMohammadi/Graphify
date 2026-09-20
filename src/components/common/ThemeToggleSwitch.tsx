import React, { useState } from 'react';

interface ThemeToggleSwitchProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export const ThemeToggleSwitch: React.FC<ThemeToggleSwitchProps> = ({
  theme,
  onToggle,
  className = '',
}) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleClick = () => {
    setIsToggling(true);
    onToggle();
    setTimeout(() => {
      setIsToggling(false);
    }, 650);
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`mst-graph-theme-toggle ${isDark ? 'mode-dark' : 'mode-light'} ${isToggling ? 'is-toggling' : ''} ${className}`}
      onClick={handleClick}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Graph Edge Connector Track (Active traversal beam during switch) */}
      <svg className="mst-toggle-graph-edge" viewBox="0 0 56 28" fill="none">
        {/* Background baseline edge */}
        <line
          x1="14"
          y1="14"
          x2="42"
          y2="14"
          className="mst-graph-edge-base"
        />
        {/* Animated traversal beam that draws when toggling */}
        <line
          x1="14"
          y1="14"
          x2="42"
          y2="14"
          className="mst-graph-edge-traversal"
        />
      </svg>

      {/* Sun Icon (Left Side) */}
      <div className="mst-toggle-icon mst-toggle-sun" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          {/* Sun center core node */}
          <circle cx="8" cy="8" r="3.2" />
          {/* Radiating vertex rays with node endpoints */}
          <g stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
            <line x1="8" y1="1.5" x2="8" y2="3.2" />
            <line x1="8" y1="12.8" x2="8" y2="14.5" />
            <line x1="1.5" y1="8" x2="3.2" y2="8" />
            <line x1="12.8" y1="8" x2="14.5" y2="8" />
            <line x1="3.4" y1="3.4" x2="4.6" y2="4.6" />
            <line x1="11.4" y1="11.4" x2="12.6" y2="12.6" />
            <line x1="3.4" y1="12.6" x2="4.6" y2="11.4" />
            <line x1="11.4" y1="4.6" x2="12.6" y2="3.4" />
          </g>
        </svg>
      </div>

      {/* Moon & Stars Icon (Right Side) */}
      <div className="mst-toggle-icon mst-toggle-moon" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          {/* Crescent Moon */}
          <path d="M7.8 2.2a5.8 5.8 0 1 0 6 6 4.6 4.6 0 0 1-6-6Z" />
          {/* Primary Star Node */}
          <path
            d="M13 1.5l.4 1.1 1.1.4-1.1.4-.4 1.1-.4-1.1-1.1-.4 1.1-.4.4-1.1Z"
            className="mst-moon-star-1"
          />
          {/* Secondary Star Node */}
          <path
            d="M14.5 5.5l.25.7.7.25-.7.25-.25.7-.25-.7-.7-.25.7-.25.25-.7Z"
            className="mst-moon-star-2"
          />
        </svg>
      </div>

      {/* Sliding Vertex Knob (The moving graph node) */}
      <div className="mst-toggle-knob">
        {/* Inner vertex core */}
        <div className="mst-knob-core" />
        {/* Graph node pulse ripple ring */}
        <div className="mst-knob-pulse" />
      </div>
    </button>
  );
};
