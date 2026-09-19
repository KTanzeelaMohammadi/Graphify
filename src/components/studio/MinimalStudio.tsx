import React, { useState, useEffect, useCallback } from 'react';
import {
  MousePointer,
  PlusCircle,
  Link,
  Target,
  Shuffle,
  RotateCcw,
  Trash2,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCw,
  Columns,
} from 'lucide-react';
import { SVGCanvas } from '../graph/SVGCanvas';
import { PRESET_GRAPHS } from '../../core/presets';
import { StepExplanationView } from '../education/StepExplanationView';
import { DataStructuresView } from '../education/DataStructuresView';
import { MetricComparisonTable } from '../comparison/MetricComparisonTable';
import { VerticalSplitResizeHandle } from '../layout/VerticalSplitResizeHandle';
import { HorizontalSplitResizeHandle } from '../layout/HorizontalSplitResizeHandle';
import { MasterToolbar } from '../controls/MasterToolbar';
import { InspectorDock } from '../education/InspectorDock';
import { GraphAIChatbot } from '../ai/GraphAIChatbot';
import { AIChatToggleBtn } from '../ai/AIChatToggleBtn';
import type { GraphStateControls } from '../../visualization/useGraphState';
import type { ExecutionTrace } from '../../core/types';
import type { PlaybackControls } from '../../visualization/usePlayback';

interface MinimalStudioProps {
  graphState: GraphStateControls;
  kruskalTrace: ExecutionTrace;
  primTrace: ExecutionTrace;
  kruskalPlayback: PlaybackControls;
  primPlayback: PlaybackControls;
  startVertexId?: string;
  onStartVertexChange: (vertexId: string) => void;
  onEdgeClick: (edgeId: string) => void;
  viewMode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM';
  onViewModeChange: (mode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM') => void;
}

export const MinimalStudio: React.FC<MinimalStudioProps> = ({
  graphState,
  kruskalTrace,
  primTrace,
  kruskalPlayback,
  primPlayback,
  startVertexId,
  onStartVertexChange,
  onEdgeClick,
  viewMode,
  onViewModeChange,
}) => {
  const {
    graph,
    mode,
    selectedVertexId,
    setMode,
    setSelectedVertexId,
    loadPreset,
    generateRandom,
    addVertex,
    deleteVertex,
    addEdge,
    moveVertex,
    resetGraph,
    clearGraph,
  } = graphState;

  const [isPresetsMenuOpen, setIsPresetsMenuOpen] = useState<boolean>(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState<boolean>(false);
  const [splitWidth, setSplitWidth] = useState<number>(460);
  const [inspectorHeight, setInspectorHeight] = useState<number>(250);

  // Tab selections in side-by-side mode cards
  const [kruskalTab, setKruskalTab] = useState<'EXPLANATION' | 'DSU' | 'METRICS'>('EXPLANATION');
  const [primTab, setPrimTab] = useState<'EXPLANATION' | 'QUEUE' | 'METRICS'>('EXPLANATION');

  const speeds = [0.5, 1, 2, 4];

  // Current steps
  const kruskalStep = kruskalTrace.steps[kruskalPlayback.currentStepIndex] || kruskalTrace.steps[0];
  const primStep = primTrace.steps[primPlayback.currentStepIndex] || primTrace.steps[0];

  // Minimal and intuitive vertex deletion handler
  const handleDeleteVertex = useCallback((vertexId?: string | null) => {
    const targetId = vertexId || selectedVertexId;
    if (!targetId) return;

    // If removing the currently selected Prim start node, pick another remaining node
    if (startVertexId === targetId) {
      const remaining = graph.vertices.filter((v) => v.id !== targetId);
      onStartVertexChange(remaining.length > 0 ? remaining[0].id : '');
    }

    deleteVertex(targetId);
    setSelectedVertexId(null);
    kruskalPlayback.reset();
    primPlayback.reset();
  }, [selectedVertexId, startVertexId, graph.vertices, deleteVertex, setSelectedVertexId, onStartVertexChange, kruskalPlayback, primPlayback]);

  // Keyboard shortcut: Backspace or Delete to remove the currently selected vertex
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAIChatOpen) {
          setIsAIChatOpen(false);
          return;
        }
      }

      // Do not delete vertex if typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete' || e.code === 'Backspace' || e.code === 'Delete') {
        if (selectedVertexId) {
          e.preventDefault();
          handleDeleteVertex(selectedVertexId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedVertexId, handleDeleteVertex]);

  const handleVertexClick = (vertexId: string) => {
    if (mode === 'ADD_EDGE') {
      if (selectedVertexId === null) {
        setSelectedVertexId(vertexId);
      } else if (selectedVertexId !== vertexId) {
        addEdge(selectedVertexId, vertexId, 5);
        setSelectedVertexId(null);
      } else {
        setSelectedVertexId(null);
      }
    } else {
      setSelectedVertexId(vertexId);
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (mode === 'ADD_VERTEX') {
      addVertex(x, y);
    } else {
      setSelectedVertexId(null);
    }
  };

  const handleResetBoth = () => {
    resetGraph();
    kruskalPlayback.reset();
    primPlayback.reset();
  };

  const handleClearGraph = () => {
    clearGraph();
    onStartVertexChange('');
    setSelectedVertexId(null);
    kruskalPlayback.reset();
    primPlayback.reset();
  };

  return (
    <div className="mst-studio-layout">
      {/* Secondary Sub-toolbar */}
      <div className="mst-subtoolbar">
        {/* Left: View Switcher & Canvas Edit Modes */}
        <div className="mst-subtoolbar-left">
          {/* View Mode Switcher Pills */}
          <div className="mst-view-pill-group">
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

          <div className="mst-subtoolbar-divider" />

          {/* Edit Modes */}
          <span className="mst-subtoolbar-label">Edit:</span>

          <button
            className={`mst-pill-btn ${mode === 'SELECT' ? 'active' : ''}`}
            onClick={() => setMode('SELECT')}
            title="Select and drag vertices"
          >
            <MousePointer size={13} />
            <span>Select & Move</span>
          </button>

          <button
            className={`mst-pill-btn ${mode === 'ADD_VERTEX' ? 'active' : ''}`}
            onClick={() => setMode('ADD_VERTEX')}
            title="Click on canvas to add a new vertex"
          >
            <PlusCircle size={13} />
            <span>Add Vertex</span>
          </button>

          <button
            className={`mst-pill-btn ${mode === 'ADD_EDGE' ? 'active' : ''}`}
            onClick={() => setMode('ADD_EDGE')}
            title="Click two vertices to connect with a weighted edge"
          >
            <Link size={13} />
            <span>Add Edge</span>
          </button>

          {/* Prim Start Node Selector */}
          <button
            className="mst-pill-btn"
            onClick={() => {
              if (graph.vertices.length > 0) {
                const currentIdx = graph.vertices.findIndex((v) => v.id === startVertexId);
                const nextVertex = graph.vertices[(currentIdx + 1) % graph.vertices.length];
                onStartVertexChange(nextVertex.id);
              }
            }}
            title="Click to cycle Prim starting vertex"
          >
            <Target size={13} />
            <span>
              Start: {graph.vertices.find((v) => v.id === startVertexId)?.label || graph.vertices[0]?.label || 'None'}
            </span>
          </button>

          {/* Selected Vertex Quick Remove Pill */}
          {selectedVertexId && (
            <button
              className="mst-pill-btn danger-action"
              onClick={() => handleDeleteVertex(selectedVertexId)}
              title={`Remove Node ${graph.vertices.find((v) => v.id === selectedVertexId)?.label || ''} from canvas (Backspace)`}
            >
              <Trash2 size={13} />
              <span>
                Delete Node {graph.vertices.find((v) => v.id === selectedVertexId)?.label}
              </span>
              <kbd style={{ fontSize: '0.65rem', padding: '1px 5px', background: 'rgba(239, 68, 68, 0.25)', borderRadius: '3px', marginLeft: '2px' }}>⌫</kbd>
            </button>
          )}
        </div>

        {/* Right: Graph Presets & Mutation Actions */}
        <div className="mst-subtoolbar-right">
          {/* Graph AI Assistant Button */}
          <AIChatToggleBtn
            variant="SUBTOOLBAR"
            isOpen={isAIChatOpen}
            onToggle={() => setIsAIChatOpen((prev) => !prev)}
          />

          <div className="mst-subtoolbar-divider" />

          {/* Preset Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="mst-pill-btn"
              onClick={() => setIsPresetsMenuOpen(!isPresetsMenuOpen)}
              title="Load textbook graph presets"
            >
              <span>Preset Graphs</span>
              <ChevronDown size={13} />
            </button>

            {isPresetsMenuOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-card)',
                  zIndex: 40,
                  minWidth: '240px',
                  overflow: 'hidden',
                }}
              >
                {PRESET_GRAPHS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      loadPreset(p.id);
                      setIsPresetsMenuOpen(false);
                      kruskalPlayback.reset();
                      primPlayback.reset();
                    }}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      textAlign: 'left',
                      fontSize: '0.78rem',
                      color: 'var(--text-primary)',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 600 }}>{p.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                      {p.graph.vertices.length} vertices &bull; {p.graph.edges.length} edges
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="mst-pill-btn"
            onClick={() => {
              generateRandom();
              kruskalPlayback.reset();
              primPlayback.reset();
            }}
            title="Generate a connected random graph"
          >
            <Shuffle size={13} />
            <span>Random Graph</span>
          </button>

          <button
            className="mst-pill-btn"
            onClick={handleResetBoth}
            title="Reset playback timeline and graph states"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            className="mst-pill-btn danger"
            onClick={handleClearGraph}
            title="Clear all graph nodes and edges"
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Studio Work Area */}

      {/* 1. Side-by-Side Dual View (Matches bottom half of mockup image) */}
      {viewMode === 'SIDE_BY_SIDE' && (
        <div className="mst-dual-stage">
          {/* Kruskal Algorithm Card */}
          <div className="mst-algo-card">
            <div className="mst-algo-card-header">
              <div className="mst-algo-card-title-group">
                <span className="mst-algo-title">Kruskal's Algorithm</span>
                <span className="mst-algo-badge">Edge-Centric DSU</span>
              </div>
            </div>

            {/* Kruskal Canvas */}
            <div className="mst-algo-canvas-wrap">
              <SVGCanvas
                graph={graph}
                currentStep={kruskalStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            </div>

            {/* Draggable Slidebar between Canvas and Information Panel */}
            <HorizontalSplitResizeHandle
              inspectorHeight={inspectorHeight}
              onInspectorHeightChange={setInspectorHeight}
            />

            {/* In-Card Playback Toolbar */}
            <div className="mst-card-playback-bar">
              <div className="mst-playback-left">
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.reset}
                  title="Restart (R)"
                  aria-label="Restart"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.stepBackward}
                  disabled={kruskalPlayback.currentStepIndex === 0}
                  title="Step Back (Left Arrow)"
                  aria-label="Previous step"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  className="mst-btn-play-card"
                  onClick={kruskalPlayback.togglePlay}
                  title="Play / Pause (Space)"
                  aria-label={kruskalPlayback.isPlaying ? 'Pause' : 'Play'}
                >
                  {kruskalPlayback.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={kruskalPlayback.stepForward}
                  disabled={kruskalPlayback.currentStepIndex >= kruskalTrace.steps.length - 1}
                  title="Step Forward (Right Arrow)"
                  aria-label="Next step"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Scrubber & Step Tracker */}
              <div className="mst-playback-center">
                <span className="mst-step-counter">
                  Step {kruskalPlayback.currentStepIndex + 1} / {kruskalTrace.steps.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, kruskalTrace.steps.length - 1)}
                  value={kruskalPlayback.currentStepIndex}
                  onChange={(e) => kruskalPlayback.goToStep(Number(e.target.value))}
                  className="mst-scrubber-slider"
                  aria-label="Scrub through Kruskal execution steps"
                />
              </div>

              {/* Speed Multiplier */}
              <div className="mst-playback-right">
                <span className="mst-speed-label">Speed:</span>
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`mst-speed-btn ${kruskalPlayback.speed === s ? 'active' : ''}`}
                    onClick={() => kruskalPlayback.setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* In-Card Inspector Tabs */}
            <div className="mst-card-tabs-bar">
              <button
                className={`mst-card-tab ${kruskalTab === 'EXPLANATION' ? 'active' : ''}`}
                onClick={() => setKruskalTab('EXPLANATION')}
              >
                Step Explanation
              </button>
              <button
                className={`mst-card-tab ${kruskalTab === 'DSU' ? 'active' : ''}`}
                onClick={() => setKruskalTab('DSU')}
              >
                DSU State
              </button>
              <button
                className={`mst-card-tab ${kruskalTab === 'METRICS' ? 'active' : ''}`}
                onClick={() => setKruskalTab('METRICS')}
              >
                Metrics
              </button>

              {/* Right: Height Slide Presets */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '2px' }}>Height:</span>
                <button
                  className={`mst-height-pill ${inspectorHeight <= 180 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(160)}
                  title="Compact information view (160px)"
                >
                  Compact
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 180 && inspectorHeight <= 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(250)}
                  title="Normal information view (250px)"
                >
                  Normal
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(380)}
                  title="Expanded information view (380px)"
                >
                  Expanded
                </button>
              </div>
            </div>

            {/* In-Card Tab Body */}
            <div className="mst-card-inspector-content" style={{ height: `${inspectorHeight}px` }}>
              {kruskalTab === 'EXPLANATION' && (
                <StepExplanationView
                  graph={graph}
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  kruskalStepIndex={kruskalPlayback.currentStepIndex}
                  primStepIndex={primPlayback.currentStepIndex}
                  algorithm="KRUSKAL"
                />
              )}
              {kruskalTab === 'DSU' && (
                <DataStructuresView
                  graph={graph}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  algorithm="KRUSKAL"
                />
              )}
              {kruskalTab === 'METRICS' && (
                <MetricComparisonTable
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  algorithm="KRUSKAL"
                />
              )}
            </div>
          </div>

          {/* Prim Algorithm Card */}
          <div className="mst-algo-card">
            <div className="mst-algo-card-header">
              <div className="mst-algo-card-title-group">
                <span className="mst-algo-title">Prim's Algorithm</span>
                <span className="mst-algo-badge">Vertex-Centric Cut</span>
              </div>
              <span className="mst-algo-start-chip">
                Start: {graph.vertices.find((v) => v.id === startVertexId)?.label || graph.vertices[0]?.label || 'A'}
              </span>
            </div>

            {/* Prim Canvas */}
            <div className="mst-algo-canvas-wrap">
              <SVGCanvas
                graph={graph}
                currentStep={primStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            </div>

            {/* Draggable Slidebar between Canvas and Information Panel */}
            <HorizontalSplitResizeHandle
              inspectorHeight={inspectorHeight}
              onInspectorHeightChange={setInspectorHeight}
            />

            {/* In-Card Playback Toolbar */}
            <div className="mst-card-playback-bar">
              <div className="mst-playback-left">
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.reset}
                  title="Restart (R)"
                  aria-label="Restart"
                >
                  <RotateCw size={14} />
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.stepBackward}
                  disabled={primPlayback.currentStepIndex === 0}
                  title="Step Back (Left Arrow)"
                  aria-label="Previous step"
                >
                  <SkipBack size={14} />
                </button>
                <button
                  className="mst-btn-play-card"
                  onClick={primPlayback.togglePlay}
                  title="Play / Pause (Space)"
                  aria-label={primPlayback.isPlaying ? 'Pause' : 'Play'}
                >
                  {primPlayback.isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  className="mst-btn-icon"
                  onClick={primPlayback.stepForward}
                  disabled={primPlayback.currentStepIndex >= primTrace.steps.length - 1}
                  title="Step Forward (Right Arrow)"
                  aria-label="Next step"
                >
                  <SkipForward size={14} />
                </button>
              </div>

              {/* Scrubber & Step Tracker */}
              <div className="mst-playback-center">
                <span className="mst-step-counter">
                  Step {primPlayback.currentStepIndex + 1} / {primTrace.steps.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, primTrace.steps.length - 1)}
                  value={primPlayback.currentStepIndex}
                  onChange={(e) => primPlayback.goToStep(Number(e.target.value))}
                  className="mst-scrubber-slider"
                  aria-label="Scrub through Prim execution steps"
                />
              </div>

              {/* Speed Multiplier */}
              <div className="mst-playback-right">
                <span className="mst-speed-label">Speed:</span>
                {speeds.map((s) => (
                  <button
                    key={s}
                    className={`mst-speed-btn ${primPlayback.speed === s ? 'active' : ''}`}
                    onClick={() => primPlayback.setSpeed(s)}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* In-Card Inspector Tabs */}
            <div className="mst-card-tabs-bar">
              <button
                className={`mst-card-tab ${primTab === 'EXPLANATION' ? 'active' : ''}`}
                onClick={() => setPrimTab('EXPLANATION')}
              >
                Step Explanation
              </button>
              <button
                className={`mst-card-tab ${primTab === 'QUEUE' ? 'active' : ''}`}
                onClick={() => setPrimTab('QUEUE')}
              >
                Priority Queue
              </button>
              <button
                className={`mst-card-tab ${primTab === 'METRICS' ? 'active' : ''}`}
                onClick={() => setPrimTab('METRICS')}
              >
                Metrics
              </button>

              {/* Right: Height Slide Presets */}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginRight: '2px' }}>Height:</span>
                <button
                  className={`mst-height-pill ${inspectorHeight <= 180 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(160)}
                  title="Compact information view (160px)"
                >
                  Compact
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 180 && inspectorHeight <= 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(250)}
                  title="Normal information view (250px)"
                >
                  Normal
                </button>
                <button
                  className={`mst-height-pill ${inspectorHeight > 300 ? 'active' : ''}`}
                  onClick={() => setInspectorHeight(380)}
                  title="Expanded information view (380px)"
                >
                  Expanded
                </button>
              </div>
            </div>

            {/* In-Card Tab Body */}
            <div className="mst-card-inspector-content" style={{ height: `${inspectorHeight}px` }}>
              {primTab === 'EXPLANATION' && (
                <StepExplanationView
                  graph={graph}
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  kruskalStepIndex={kruskalPlayback.currentStepIndex}
                  primStepIndex={primPlayback.currentStepIndex}
                  algorithm="PRIM"
                />
              )}
              {primTab === 'QUEUE' && (
                <DataStructuresView
                  graph={graph}
                  kruskalStep={kruskalStep}
                  primStep={primStep}
                  algorithm="PRIM"
                />
              )}
              {primTab === 'METRICS' && (
                <MetricComparisonTable
                  kruskalTrace={kruskalTrace}
                  primTrace={primTrace}
                  algorithm="PRIM"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Single Algorithm Split View (Canvas on Left, Controls & Info on Right) */}
      {(viewMode === 'SINGLE_KRUSKAL' || viewMode === 'SINGLE_PRIM') && (
        <div className="studio-split-layout">
          {/* Left Column: Full-Height Interactive Canvas */}
          <div className="studio-split-canvas">
            {viewMode === 'SINGLE_KRUSKAL' ? (
              <SVGCanvas
                graph={graph}
                currentStep={kruskalStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                title="Kruskal's Algorithm View"
                badge="Edge-Centric DSU"
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            ) : (
              <SVGCanvas
                graph={graph}
                currentStep={primStep}
                mode={mode}
                selectedVertexId={selectedVertexId}
                title="Prim's Algorithm View"
                badge="Vertex-Centric Min-Heap Cut"
                onCanvasClick={handleCanvasClick}
                onVertexClick={handleVertexClick}
                onVertexMove={moveVertex}
                onEdgeClick={onEdgeClick}
                onVertexDelete={handleDeleteVertex}
              />
            )}
          </div>

          {/* Draggable Horizontal Splitter Handle */}
          <VerticalSplitResizeHandle
            splitWidth={splitWidth}
            onSplitWidthChange={setSplitWidth}
            position="right"
          />

          {/* Right Column: Dedicated Playback Toolbar + Inspector Panel */}
          <div
            className="studio-split-panel"
            style={{ width: `${splitWidth}px`, flex: `0 0 ${splitWidth}px` }}
          >
            {/* Playback Controls Toolbar for the active algorithm */}
            <MasterToolbar
              kruskalPlayback={kruskalPlayback}
              primPlayback={primPlayback}
              totalSteps={
                viewMode === 'SINGLE_KRUSKAL'
                  ? kruskalTrace.steps.length
                  : primTrace.steps.length
              }
              currentAlgorithm={viewMode === 'SINGLE_KRUSKAL' ? 'KRUSKAL' : 'PRIM'}
            />

            {/* Individual Algorithm Inspector Panel */}
            <div className="studio-split-dock">
              <InspectorDock
                graph={graph}
                kruskalTrace={kruskalTrace}
                primTrace={primTrace}
                kruskalStep={kruskalStep}
                primStep={primStep}
                kruskalStepIndex={kruskalPlayback.currentStepIndex}
                primStepIndex={primPlayback.currentStepIndex}
                viewMode={viewMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* Graph-Aware AI Chatbot Assistant Drawer */}
      <GraphAIChatbot
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        graph={graph}
        kruskalTrace={kruskalTrace}
        primTrace={primTrace}
        kruskalStepIndex={kruskalPlayback.currentStepIndex}
        primStepIndex={primPlayback.currentStepIndex}
        viewMode={viewMode}
        startVertexId={startVertexId}
      />
    </div>
  );
};
