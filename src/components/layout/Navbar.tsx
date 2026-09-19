import React from 'react';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import graphifyIcon from '../../assets/graphify-icon.png';

interface NavbarProps {
  currentView: 'HOME' | 'STUDIO';
  activeSection?: 'home' | 'about' | 'faqs';
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onNavigateHome: () => void;
  onNavigateStudio: () => void;
  onScrollToSection: (sectionId: 'hero' | 'about' | 'faqs') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  activeSection = 'home',
  theme,
  onToggleTheme,
  onNavigateHome,
  onNavigateStudio,
  onScrollToSection,
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

      {/* Center Nav Tabs: Home, About, FAQs */}
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

      {/* Right Controls: Theme Toggle & Get Started Button */}
      <div className="mst-nav-right">
        <button
          className="mst-btn-icon"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="mst-btn-get-started" onClick={onNavigateStudio}>
          <span>Get Started</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </header>
  );
};
