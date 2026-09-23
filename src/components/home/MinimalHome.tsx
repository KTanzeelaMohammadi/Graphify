import React, { useState } from 'react';
import {
  ArrowRight,
  Edit3,
  PlayCircle,
  BookOpen,
  Sliders,
  Layers,
  Cpu,
  ExternalLink,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { HeroGraphGraphic } from './HeroGraphGraphic';
import graphifyLogoFull from '../../assets/graphify-logo-full.png';
import graphifyLogoFullDark from '../../assets/graphify-logo-full-dark.png';

interface MinimalHomeProps {
  onOpenVisualizer: () => void;
  onOpenPresets: () => void;
  onScrollToSection: (sectionId: string) => void;
}

interface FAQItem {
  question: string;
  category: 'Basics' | 'Algorithms' | 'Theory' | 'Applications';
  answer: React.ReactNode;
}

export const MinimalHome: React.FC<MinimalHomeProps> = ({
  onOpenVisualizer,
  onOpenPresets,
  onScrollToSection,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeFaqFilter, setActiveFaqFilter] = useState<'ALL' | 'Basics' | 'Algorithms' | 'Theory' | 'Applications'>('ALL');

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex((prev) => (prev === idx ? null : idx));
  };

  const faqs: FAQItem[] = [
    {
      category: 'Basics',
      question: 'What is a Minimum Spanning Tree (MST)?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            Given a connected, undirected, weighted graph <code>G = (V, E)</code>, a <strong>Spanning Tree</strong> is an
            acyclic subgraph that connects all <code>|V|</code> vertices together using exactly <code>|V| - 1</code> edges.
          </p>
          <p style={{ marginBottom: '0.6rem' }}>
            A <strong>Minimum Spanning Tree (MST)</strong> is the spanning tree whose total sum of edge weights is minimal:
          </p>
          <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 14px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
            weight(T) = &Sigma;<sub>(u, v) &isin; T</sub> w(u, v) &rarr; Minimum
          </div>
          <p>
            If all edge weights in the graph are distinct, the graph is guaranteed to possess a <strong>unique</strong> Minimum Spanning Tree.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "How does Kruskal's Algorithm work?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Kruskal's algorithm</strong> is a global, edge-centric greedy algorithm designed by Joseph Kruskal in 1956.
          </p>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><strong>Sort all edges</strong> in the graph in non-decreasing order of weight (<code>O(E log E)</code>).</li>
            <li><strong>Initialize Disjoint Set Union (DSU)</strong>: place each vertex into its own independent set.</li>
            <li><strong>Iterate through sorted edges</strong>: For each edge <code>(u, v)</code>, check whether <code>find(u) == find(v)</code>.</li>
            <li><strong>Accept or Reject</strong>: If <code>find(u) &ne; find(v)</code>, accept the edge and call <code>union(u, v)</code>. If they belong to the same component, reject the edge to prevent a cycle.</li>
            <li><strong>Termination</strong>: Stop when exactly <code>|V| - 1</code> edges have been accepted.</li>
          </ol>
          <p>
            Total Time Complexity: <strong><code>O(E log E)</code></strong> or equivalently <strong><code>O(E log V)</code></strong>.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "How does Prim's Algorithm work?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Prim's algorithm</strong> is a local, vertex-centric cut-growing algorithm designed by Vojt&#283;ch Jarn&iacute;k (1930) and rediscovered by Robert Prim (1957).
          </p>
          <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><strong>Pick an arbitrary root vertex <code>s</code></strong> and mark it as visited (placed in cut <code>S</code>).</li>
            <li><strong>Initialize a Binary Min-Heap (Priority Queue)</strong> with all incident edges of <code>s</code>.</li>
            <li><strong>Extract Min Edge</strong>: Pop the lowest-weight edge <code>(u, v)</code> from the queue where <code>u &isin; S</code> and <code>v &notin; S</code>.</li>
            <li><strong>Grow Tree</strong>: Add <code>(u, v)</code> to the MST, mark <code>v</code> as visited (move to <code>S</code>), and insert all edges from <code>v</code> into unvisited neighbors into the priority queue.</li>
            <li><strong>Repeat</strong> until all <code>|V|</code> vertices are visited.</li>
          </ol>
          <p>
            Total Time Complexity with Binary Min-Heap: <strong><code>O(E log V)</code></strong>. (Can reach <strong><code>O(E + V log V)</code></strong> with a Fibonacci Heap).
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: "Kruskal's vs. Prim's: Key differences & When to choose which?",
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            While both compute an identical minimum spanning tree weight, their execution paradigms differ fundamentally:
          </p>
          <div style={{ overflowX: 'auto', marginBottom: '0.8rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-card-subtle)' }}>
                  <th style={{ padding: '8px 12px' }}>Feature</th>
                  <th style={{ padding: '8px 12px' }}>Kruskal's Algorithm</th>
                  <th style={{ padding: '8px 12px' }}>Prim's Algorithm</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Design Paradigm</td>
                  <td style={{ padding: '8px 12px' }}>Global Edge-Centric Greedy</td>
                  <td style={{ padding: '8px 12px' }}>Local Vertex-Centric Cut Growing</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Primary Data Structure</td>
                  <td style={{ padding: '8px 12px' }}>Disjoint Set Union (DSU / Union-Find)</td>
                  <td style={{ padding: '8px 12px' }}>Binary Min-Heap / Priority Queue</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Time Complexity</td>
                  <td style={{ padding: '8px 12px' }}><code>O(E log E)</code></td>
                  <td style={{ padding: '8px 12px' }}><code>O(E log V)</code></td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Optimal Graph Topology</td>
                  <td style={{ padding: '8px 12px' }}><strong>Sparse Graphs</strong> (<code>E &ll; V<sup>2</sup></code>)</td>
                  <td style={{ padding: '8px 12px' }}><strong>Dense Graphs</strong> (<code>E &approx; V<sup>2</sup></code>)</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 12px', fontWeight: 600 }}>Intermediate State</td>
                  <td style={{ padding: '8px 12px' }}>Forest of merging subtrees</td>
                  <td style={{ padding: '8px 12px' }}>Single connected expanding tree</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            <strong>Rule of Thumb:</strong> Choose Kruskal for sparse networks (e.g., roads, pipelines) because sorting few edges is very fast. Choose Prim for dense or complete networks (e.g., all-to-all communication meshes).
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'What are the Cut Property and the Cycle Property?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            These two mathematical theorems establish the theoretical correctness of greedy MST algorithms:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li>
              <strong>The Cut Property (Prim's Foundation)</strong>: For any partition (cut) of the graph's vertices into two subsets
              <code>S</code> and <code>V \ S</code>, the edge with the minimal weight that crosses the cut is guaranteed to belong to at least one MST.
              Prim repeatedly applies this property to the cut <code>(Visited, Unvisited)</code>.
            </li>
            <li>
              <strong>The Cycle Property (Kruskal's Foundation)</strong>: For any simple cycle <code>C</code> in the graph, the edge with the
              strictly largest weight in <code>C</code> cannot belong to any MST. Kruskal avoids adding cycle-forming edges, effectively
              excluding the heaviest cycle edges.
            </li>
          </ul>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'Can a graph have multiple different Minimum Spanning Trees?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Yes.</strong> If multiple edges share the same weight, a graph can have multiple distinct spanning trees that each yield the identical minimum total cost.
          </p>
          <p>
            However, the <strong>total weight</strong> of the MST is always unique. Furthermore, if every edge in the graph has a strictly distinct weight, the MST is mathematically guaranteed to be unique.
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'Do Kruskal and Prim work with negative edge weights or zero weights?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            <strong>Yes!</strong> Unlike shortest path algorithms such as Dijkstra's algorithm (which fails with negative edges), both Kruskal's and Prim's algorithms work <strong>correctly with negative edge weights</strong> and zero weights.
          </p>
          <p>
            This is because MST algorithms only rely on the <em>relative ordering</em> of edge weights (via the Cut and Cycle properties) and spanning connectivity, rather than path accumulation.
          </p>
        </div>
      ),
    },
    {
      category: 'Theory',
      question: 'What happens if the input graph is disconnected?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            If a graph contains multiple disconnected components, no single spanning tree can span all vertices.
          </p>
          <p>
            In this case, both algorithms naturally compute a <strong>Minimum Spanning Forest (MSF)</strong>—an optimal MST for each independent connected component. MST Lab automatically detects disconnected graphs and indicates the MSF status.
          </p>
        </div>
      ),
    },
    {
      category: 'Algorithms',
      question: 'How do Disjoint Set Union (DSU) and Path Compression work in Kruskal?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            The <strong>Disjoint Set Union (DSU)</strong> structure tracks partitions of vertices in near-constant amortized time:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
            <li><code>find(u)</code>: Traverses parent pointers to locate the representative root of vertex <code>u</code>'s set. With <strong>Path Compression</strong>, every node visited during <code>find</code> points directly to the root, flattening the tree.</li>
            <li><code>union(u, v)</code>: Merges the sets containing <code>u</code> and <code>v</code> by attaching the shallower tree under the deeper tree (<strong>Union by Rank</strong>).</li>
          </ul>
          <p>
            With both optimizations, operations execute in <code>O(&alpha;(V))</code> time, where <code>&alpha;</code> is the inverse Ackermann function (effectively &le; 4 for all practical inputs).
          </p>
        </div>
      ),
    },
    {
      category: 'Applications',
      question: 'Where are Minimum Spanning Trees applied in the real world?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            MST algorithms are applied extensively across technology, engineering, and data science:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.6rem' }}>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>🌐 Fiber & Telecom Networks</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Minimizing fiber-optic trenching length to connect regional data centers.</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>⚡ Electrical Power Grids</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Linking power generation plants and substations with minimal high-voltage wiring cost.</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>🤖 Machine Learning Clustering</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Single-linkage hierarchical clustering partitions clusters by severing heavy MST edges.</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>🔌 VLSI Microchip Routing</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Interconnecting semiconductor pins on silicon chips with minimal wire length and capacitance.</div>
            </div>
            <div style={{ background: 'var(--bg-card-subtle)', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <strong>📍 Metric TSP 2-Approximation</strong>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Doubling MST edges and creating an Eulerian tour yields a proven 2-approximation for the Traveling Salesperson Problem.</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      category: 'Applications',
      question: 'How do I build custom graphs and edit edge weights in MST Lab?',
      answer: (
        <div>
          <p style={{ marginBottom: '0.6rem' }}>
            MST Lab provides an interactive graph editor directly in the Visualizer Studio:
          </p>
          <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <li><strong>Select & Move</strong>: Drag nodes to position them cleanly on the grid.</li>
            <li><strong>Add Vertex</strong>: Click anywhere on the canvas to place a new vertex.</li>
            <li><strong>Add Edge</strong>: Click the first node, then click the second node to create a weighted connection.</li>
            <li><strong>Edit Weight</strong>: Click any edge or its weight label to open the weight editor modal.</li>
            <li><strong>Set Start Node</strong>: In Prim mode, choose any vertex to observe how the cut frontier expands from that root.</li>
            <li><strong>Preset Graphs</strong>: Load textbook topologies like Complete K5, Ring Cycles, or Disconnected Forests.</li>
          </ul>
        </div>
      ),
    },
  ];

  const filteredFaqs =
    activeFaqFilter === 'ALL'
      ? faqs
      : faqs.filter((f) => f.category === activeFaqFilter);

  return (
    <main className="mst-home-page">
      {/* 2-Column Hero Section matching mockup top */}
      <section className="mst-hero-section" id="hero">
        {/* Left Hero Content */}
        <div className="mst-hero-left">
          <div className="mst-hero-brand-wrap">
            <img
              src={graphifyLogoFullDark}
              alt="Graphify"
              className="mst-hero-full-logo dark-only"
            />
            <img
              src={graphifyLogoFull}
              alt="Graphify"
              className="mst-hero-full-logo light-only"
            />
          </div>

          <div className="mst-hero-tag">VISUALIZE • EXPLORE • UNDERSTAND</div>

          <h1 className="mst-hero-title">
            Minimum Spanning Trees,<br />
            <span className="mst-hero-title-accent">Made Visual</span>
          </h1>

          <p className="mst-hero-subtitle">
            An interactive platform to visualize and compare Kruskal's and Prim's algorithms
            step by step. Build your own graphs, explore algorithm decisions, and strengthen
            your understanding of MSTs.
          </p>

          <div className="mst-hero-cta-group">
            <button className="mst-btn-primary" onClick={onOpenVisualizer}>
              <span>Open Visualizer</span>
              <ArrowRight size={15} />
            </button>

            <button className="mst-btn-secondary" onClick={() => onScrollToSection('workflow')}>
              <span>Learn MST Theory</span>
            </button>
          </div>
        </div>

        {/* Right Hero Graphic */}
        <div className="mst-hero-right">
          <HeroGraphGraphic />
        </div>
      </section>

      {/* 3 Highlight Feature Cards matching mockup top */}
      <section className="mst-features-section" id="features">
        <div
          className="mst-feature-card"
          onClick={onOpenPresets}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenPresets()}
        >
          <div className="mst-feature-icon-box">
            <Edit3 size={18} />
          </div>
          <h3 className="mst-feature-title">Build or Generate Graphs</h3>
          <p className="mst-feature-desc">
            Create custom graphs, use presets, or generate random graphs.
          </p>
        </div>

        <div
          className="mst-feature-card"
          onClick={onOpenVisualizer}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onOpenVisualizer()}
        >
          <div className="mst-feature-icon-box">
            <PlayCircle size={18} />
          </div>
          <h3 className="mst-feature-title">Step Through Algorithms</h3>
          <p className="mst-feature-desc">
            Watch algorithm decisions with clear explanations.
          </p>
        </div>

        <div
          className="mst-feature-card"
          onClick={() => onScrollToSection('about')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onScrollToSection('about')}
        >
          <div className="mst-feature-icon-box">
            <BookOpen size={18} />
          </div>
          <h3 className="mst-feature-title">Compare and Learn</h3>
          <p className="mst-feature-desc">
            See Kruskal's and Prim's algorithms side by side.
          </p>
        </div>
      </section>

      {/* Minimal Step-Wise Working of the Platform */}
      <section className="mst-content-section" id="workflow">
        <div className="mst-section-header">
          <span className="mst-section-tag">Platform Workflow</span>
          <h2 className="mst-section-title">Minimal Step-Wise Working of the Platform</h2>
          <p className="mst-section-desc">
            Follow this streamlined 3-stage interactive pipeline to construct, step through, and analyze graph algorithms.
          </p>
        </div>

        <div className="mst-workflow-grid">
          {/* Step 1 */}
          <div className="mst-workflow-card">
            <div className="mst-workflow-header-row">
              <div className="mst-feature-icon-box">
                <Sliders size={18} />
              </div>
              <span className="mst-workflow-step-badge">STEP 01</span>
            </div>
            <h3 className="mst-workflow-title">Construct Topology</h3>
            <p className="mst-workflow-desc">
              Place vertices, draw weighted edges, and drag nodes into position with intuitive canvas tools. Or instantly load textbook presets like Dense K5, Ring Cycles, and Disconnected Forests.
            </p>
            <div className="mst-workflow-footer-chip">
              Modes: Select & Move • Add Vertex • Add Edge • Set Start Node
            </div>
          </div>

          {/* Step 2 */}
          <div className="mst-workflow-card">
            <div className="mst-workflow-header-row">
              <div className="mst-feature-icon-box">
                <Layers size={18} />
              </div>
              <span className="mst-workflow-step-badge">STEP 02</span>
            </div>
            <h3 className="mst-workflow-title">Step Through Algorithms</h3>
            <p className="mst-workflow-desc">
              Execute Kruskal and Prim with interactive playback controls. Scrub through synchronized steps, jump forward or back, and control speed multipliers (0.5x, 1x, 2x, 4x) or use keyboard shortcuts.
            </p>
            <div className="mst-workflow-footer-chip">
              Synchronized Scrubber • Play / Pause • Step Hotkeys
            </div>
          </div>

          {/* Step 3 */}
          <div className="mst-workflow-card">
            <div className="mst-workflow-header-row">
              <div className="mst-feature-icon-box">
                <Cpu size={18} />
              </div>
              <span className="mst-workflow-step-badge">STEP 03</span>
            </div>
            <h3 className="mst-workflow-title">Inspect Data Structures</h3>
            <p className="mst-workflow-desc">
              Examine live internal states: observe Kruskal's Disjoint Set Union (DSU) parent pointers and path compression, inspect Prim's Min-Priority Queue candidate cut edges, and track pseudocode.
            </p>
            <div className="mst-workflow-footer-chip">
              DSU Sets • Binary Min-Heap • Metric Comparison Table
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="mst-content-section" id="about">
        <div className="mst-section-header">
          <span className="mst-section-tag">About Platform</span>
          <h2 className="mst-section-title">About MST Lab</h2>
          <p className="mst-section-desc">
            An open educational initiative dedicated to demystifying greedy graph algorithms and Minimum Spanning Trees.
          </p>
        </div>

        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <Info size={18} color="var(--color-primary)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Interactive Pedagogy
                </h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Traditional textbooks teach MST algorithms through static formulas and tables. MST Lab brings algorithms to life by rendering exact mathematical states, cycle rejections, and priority queue evaluations in real time.
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={18} color="var(--color-success)" />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Comparative Dual Traces
                </h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                Compare Kruskal's global edge sorting strategy side by side with Prim's expanding vertex cut. See firsthand why sparse graphs benefit Kruskal and dense graphs favor Prim.
              </p>
            </div>
          </div>

          <div
            style={{
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Built with TypeScript, React, and SVG Canvas engine. Zero heavy graph dependencies.
            </div>
            <button className="mst-btn-primary" onClick={onOpenVisualizer} style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}>
              <span>Launch Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="mst-content-section" id="faqs">
        <div className="mst-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="mst-section-tag">Knowledge Base</span>
            <h2 className="mst-section-title">Frequently Asked Questions</h2>
            <p className="mst-section-desc">
              Comprehensive answers covering Minimum Spanning Trees, Kruskal vs. Prim differences, complexity proofs, and edge cases.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['ALL', 'Basics', 'Algorithms', 'Theory', 'Applications'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFaqFilter(cat)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: activeFaqFilter === cat ? 'var(--color-primary)' : 'var(--border-subtle)',
                  background: activeFaqFilter === cat ? 'var(--color-primary-subtle)' : 'transparent',
                  color: activeFaqFilter === cat ? 'var(--color-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mst-faq-list">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className={`mst-faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="mst-faq-question"
                  onClick={() => toggleFaq(idx)}
                  aria-expanded={isOpen}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        color: 'var(--color-primary)',
                        background: 'var(--color-primary-subtle)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {faq.category}
                    </span>
                    <span>{faq.question}</span>
                  </div>
                  <ChevronDown size={17} className={`mst-faq-chevron ${isOpen ? 'open' : ''}`} />
                </button>

                {isOpen && <div className="mst-faq-answer">{faq.answer}</div>}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Box */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-card)',
            marginTop: '3rem',
          }}
        >
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Ready to explore algorithms in action?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              Open the interactive visualizer studio to drag nodes, test edge weights, and step through Kruskal and Prim.
            </p>
          </div>

          <button className="mst-btn-primary" onClick={onOpenVisualizer}>
            <span>Open Visualizer Studio</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* Clean Minimalist Footer */}
      <footer className="mst-home-footer">
        <div className="mst-footer-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img
              src={graphifyLogoFullDark}
              alt="Graphify"
              className="mst-footer-full-logo dark-only"
            />
            <img
              src={graphifyLogoFull}
              alt="Graphify"
              className="mst-footer-full-logo light-only"
            />
          </div>
          <span className="mst-footer-text">• Minimum Spanning Tree Interactive Platform</span>
        </div>

        <div className="mst-footer-links">
          <button className="mst-footer-link" onClick={() => onScrollToSection('hero')}>
            Home
          </button>
          <button className="mst-footer-link" onClick={onOpenVisualizer}>
            Visualizer
          </button>
          <button className="mst-footer-link" onClick={() => onScrollToSection('about')}>
            About
          </button>
          <button className="mst-footer-link" onClick={() => onScrollToSection('faqs')}>
            FAQs
          </button>
          <a
            href="https://github.com/bugOpsX/Graphify"
            target="_blank"
            rel="noopener noreferrer"
            className="mst-footer-link"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            GitHub <ExternalLink size={12} />
          </a>
          <a
            href="https://github.com/KTanzeelaMohammadi"
            target="_blank"
            rel="noopener noreferrer"
            className="mst-footer-link"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            KTanzeelaMohammadi <ExternalLink size={12} />
          </a>
          <span className="mst-footer-text">MIT License</span>
        </div>
      </footer>
    </main>
  );
};
