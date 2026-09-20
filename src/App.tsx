import { useState, useMemo, useEffect, useCallback } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MinimalHome } from './components/home/MinimalHome';
import { MinimalStudio } from './components/studio/MinimalStudio';
import { PresetsModal } from './components/education/PresetsModal';
import { GuideModal } from './components/education/GuideModal';
import { EdgeWeightModal } from './components/controls/EdgeWeightModal';
import { useGraphState } from './visualization/useGraphState';
import { usePlayback } from './visualization/usePlayback';
import { runKruskal, runPrim } from './algorithms';
import type { Edge } from './core/types';
import './styles/variables.css';
import './styles/minimal.css';
import './styles/global.css';
import './styles/aiChat.css';

export function App() {
  const [currentView, setCurrentView] = useState<'HOME' | 'STUDIO'>(() => {
    const hash = window.location.hash;
    return hash.startsWith('#studio') || hash.startsWith('#visualizer') ? 'STUDIO' : 'HOME';
  });

  const [activeSection, setActiveSection] = useState<'home' | 'about' | 'faqs'>('home');
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM'>('SIDE_BY_SIDE');
  const [isPresetsOpen, setIsPresetsOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [editingEdge, setEditingEdge] = useState<Edge | null>(null);
  const [startVertexId, setStartVertexId] = useState<string | undefined>(undefined);

  // Theme Management (Default Dark, toggles to Light)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('mst-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mst-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const graphState = useGraphState('preset-standard');
  const {
    graph,
    loadPreset,
    updateEdgeWeight,
    deleteEdge,
    deleteVertex,
    selectedVertexId,
    setSelectedVertexId,
  } = graphState;

  // Sync with browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#studio') || hash.startsWith('#visualizer')) {
        setCurrentView('STUDIO');
      } else if (hash.startsWith('#about')) {
        setCurrentView('HOME');
        setTimeout(() => handleScrollToSection('about'), 50);
      } else if (hash.startsWith('#faqs') || hash.startsWith('#faq')) {
        setCurrentView('HOME');
        setTimeout(() => handleScrollToSection('faqs'), 50);
      } else if (hash === '' || hash === '#' || hash === '#home' || hash === '#hero') {
        setCurrentView('HOME');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update hash when navigating
  const navigateHome = useCallback(() => {
    setCurrentView('HOME');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSection('home');
  }, []);

  const navigateStudio = useCallback(() => {
    setCurrentView('STUDIO');
    window.location.hash = 'studio';
  }, []);

  // Sync body and document element class for studio vs home mode
  useEffect(() => {
    if (currentView === 'STUDIO') {
      document.body.classList.add('is-studio');
      document.documentElement.classList.add('is-studio');
    } else {
      document.body.classList.remove('is-studio');
      document.documentElement.classList.remove('is-studio');
    }
  }, [currentView]);

  // Scroll to section on home page
  const handleScrollToSection = useCallback((sectionId: string) => {
    if (sectionId === 'hero' || sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      const navHeight = 54;
      const targetY = el.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      if (sectionId === 'about' || sectionId === 'faqs') {
        setActiveSection(sectionId as 'about' | 'faqs');
      }
    }
  }, []);

  // Track active section on scroll when on HOME
  useEffect(() => {
    if (currentView !== 'HOME') return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY < 180) {
        setActiveSection('home');
        return;
      }

      // If reached bottom of page, highlight faqs
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80) {
        setActiveSection('faqs');
        return;
      }

      const faqsEl = document.getElementById('faqs');
      const aboutEl = document.getElementById('about');

      if (faqsEl && faqsEl.getBoundingClientRect().top <= 140) {
        setActiveSection('faqs');
      } else if (aboutEl && aboutEl.getBoundingClientRect().top <= 140) {
        setActiveSection('about');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Compute Traces
  const kruskalTrace = useMemo(() => {
    return runKruskal(graph);
  }, [graph]);

  const effectiveStartVertex = startVertexId || graph.vertices[0]?.id;
  const primTrace = useMemo(() => {
    return runPrim(graph, { startVertexId: effectiveStartVertex });
  }, [graph, effectiveStartVertex]);

  // Playback Hooks
  const kruskalPlayback = usePlayback(kruskalTrace);
  const primPlayback = usePlayback(primTrace);

  // Global Keyboard Navigation
  useEffect(() => {
    if (currentView !== 'STUDIO') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts inside text inputs or dialogs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        editingEdge !== null ||
        isPresetsOpen ||
        isGuideOpen
      ) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.code === 'Backspace' || e.code === 'Delete') {
        if (selectedVertexId && graph.vertices.some((v) => v.id === selectedVertexId)) {
          e.preventDefault();
          const targetId = selectedVertexId;
          if (startVertexId === targetId) {
            const remaining = graph.vertices.filter((v) => v.id !== targetId);
            setStartVertexId(remaining.length > 0 ? remaining[0].id : undefined);
          }
          deleteVertex(targetId);
          setSelectedVertexId(null);
          kruskalPlayback.reset();
          primPlayback.reset();
        }
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.togglePlay();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.togglePlay();
        } else {
          if (kruskalPlayback.isPlaying || primPlayback.isPlaying) {
            kruskalPlayback.pause();
            primPlayback.pause();
          } else {
            kruskalPlayback.play();
            primPlayback.play();
          }
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.stepForward();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.stepForward();
        } else {
          kruskalPlayback.stepForward();
          primPlayback.stepForward();
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.stepBackward();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.stepBackward();
        } else {
          kruskalPlayback.stepBackward();
          primPlayback.stepBackward();
        }
      } else if (e.code === 'KeyR' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (viewMode === 'SINGLE_KRUSKAL') {
          kruskalPlayback.reset();
        } else if (viewMode === 'SINGLE_PRIM') {
          primPlayback.reset();
        } else {
          kruskalPlayback.reset();
          primPlayback.reset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentView,
    viewMode,
    selectedVertexId,
    startVertexId,
    graph.vertices,
    deleteVertex,
    setSelectedVertexId,
    kruskalPlayback,
    primPlayback,
    editingEdge,
    isPresetsOpen,
    isGuideOpen,
  ]);

  const handleEdgeClick = (edgeId: string) => {
    const edge = graph.edges.find((e) => e.id === edgeId);
    if (edge) {
      setEditingEdge(edge);
    }
  };

  const handleSaveEdgeWeight = (newWeight: number) => {
    if (editingEdge) {
      updateEdgeWeight(editingEdge.id, newWeight);
      setEditingEdge(null);
      kruskalPlayback.reset();
      primPlayback.reset();
    }
  };

  const handleDeleteEdge = () => {
    if (editingEdge) {
      deleteEdge(editingEdge.id);
      setEditingEdge(null);
      kruskalPlayback.reset();
      primPlayback.reset();
    }
  };

  return (
    <div className={`mst-app-root ${currentView === 'STUDIO' ? 'is-studio' : ''}`}>
      {/* Universal Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        activeSection={activeSection}
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigateHome={navigateHome}
        onNavigateStudio={navigateStudio}
        onScrollToSection={handleScrollToSection}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* View 1: Minimalist Home Screen */}
      {currentView === 'HOME' && (
        <MinimalHome
          onOpenVisualizer={navigateStudio}
          onOpenPresets={() => setIsPresetsOpen(true)}
          onScrollToSection={handleScrollToSection}
        />
      )}

      {/* View 2: Minimalist Visualizer Studio */}
      {currentView === 'STUDIO' && (
        <MinimalStudio
          graphState={graphState}
          kruskalTrace={kruskalTrace}
          primTrace={primTrace}
          kruskalPlayback={kruskalPlayback}
          primPlayback={primPlayback}
          startVertexId={effectiveStartVertex}
          onStartVertexChange={(vertexId) => {
            setStartVertexId(vertexId);
            primPlayback.reset();
          }}
          onEdgeClick={handleEdgeClick}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {/* Modals */}
      <PresetsModal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        onSelectPreset={(presetId) => {
          loadPreset(presetId);
          kruskalPlayback.reset();
          primPlayback.reset();
        }}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      {editingEdge && (
        <EdgeWeightModal
          edge={editingEdge}
          onClose={() => setEditingEdge(null)}
          onUpdateWeight={(_edgeId, weight) => handleSaveEdgeWeight(weight)}
          onDeleteEdge={handleDeleteEdge}
        />
      )}
    </div>
  );
}

export default App;
