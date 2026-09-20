import React from 'react';
import { ArrowRight, Columns } from 'lucide-react';
import graphifyIcon from '../../assets/graphify-icon.png';
import { ThemeToggleSwitch } from '../common/ThemeToggleSwitch';

interface NavbarProps {
  currentView: 'HOME' | 'STUDIO';
  activeSection?: 'home' | 'about' | 'faqs';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateStudio: () => void;
  onScrollToSection: (sectionId: 'hero' | 'about' | 'faqs') => void;
  viewMode?: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM';
  onViewModeChange?: (mode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeSection = 'home',
  theme,
  onToggleTheme,
  onNavigateHome,
  onNavigateStudio,
  onScrollToSection,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <header className="mst-navbar">
      {/* Left Brand */}
      <div
        className="mst-brand"
        onClick={onNavigateHome}
        role="button"
        tabIndex={0}
        title="Graphify Home"
        onKeyDown={(e) => e.key === 'Enter' && onNavigateHome()}
      >
        <div className="mst-brand-logo">
          <img src={graphifyIcon} alt="Graphify" className="mst-brand-img" />
        </div>
        <span className="mst-brand-name">Graphify</span>
      </div>

      {/* Center Navigation: Home Tabs vs Studio View Mode Switcher */}
      {currentView === 'STUDIO' && onViewModeChange && viewMode ? (
        <div className="mst-view-pill-group" aria-label="Studio View Switcher">
          <button
            className={`mst-pill-btn ${viewMode === 'SIDE_BY_SIDE' ? 'active' : ''}`}
            onClick={() => onViewModeChange('SIDE_BY_SIDE')}
            title="Compare both algorithms side by side"
          >
            <Columns size={13} />
            <span>Side-by-Side</span>
          </button>

          <button
            className={`mst-pill-btn ${viewMode === 'SINGLE_KRUSKAL' ? 'active' : ''}`}
            onClick={() => onViewModeChange('SINGLE_KRUSKAL')}
            title="Focus on Kruskal's algorithm"
          >
            <span>Kruskal</span>
          </button>

          <button
            className={`mst-pill-btn ${viewMode === 'SINGLE_PRIM' ? 'active' : ''}`}
            onClick={() => onViewModeChange('SINGLE_PRIM')}
            title="Focus on Prim's algorithm"
          >
            <span>Prim</span>
          </button>
        </div>
      ) : (
        <nav className="mst-nav-center" aria-label="Main Navigation">
          <button
            className={`mst-nav-tab ${currentView === 'HOME' && activeSection === 'home' ? 'active' : ''}`}
            onClick={() => {
              if (currentView !== 'HOME') onNavigateHome();
              onScrollToSection('hero');
            }}
          >
            Home
          </button>

          <button
            className={`mst-nav-tab ${currentView === 'HOME' && activeSection === 'about' ? 'active' : ''}`}
            onClick={() => {
              if (currentView !== 'HOME') {
                onNavigateHome();
                setTimeout(() => onScrollToSection('about'), 100);
              } else {
                onScrollToSection('about');
              }
            }}
          >
            About
          </button>

          <button
            className={`mst-nav-tab ${currentView === 'HOME' && activeSection === 'faqs' ? 'active' : ''}`}
            onClick={() => {
              if (currentView !== 'HOME') {
                onNavigateHome();
                setTimeout(() => onScrollToSection('faqs'), 100);
              } else {
                onScrollToSection('faqs');
              }
            }}
          >
            FAQs
          </button>
        </nav>
      )}

      {/* Right Controls: Theme Toggle & Get Started Button (Only on Home) */}
      <div className="mst-nav-right">
        <ThemeToggleSwitch
          theme={theme}
          onToggle={onToggleTheme}
        />

        {currentView === 'HOME' && (
          <button className="mst-btn-get-started" onClick={onNavigateStudio}>
            <span>Get Started</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </header>
  );
};
