import { describe, it, expect } from 'vitest';
import {
  serializeGraphContext,
  generateSmartOfflineResponse,
  buildSystemPrompt,
} from '../../core/aiGraphContext';
import { runKruskal, runPrim } from '../../algorithms';
import type { Graph } from '../../core/types';

describe('AI Graph Context & Heuristic Engine', () => {
  const sampleGraph: Graph = {
    vertices: [
      { id: 'v1', label: 'A', x: 100, y: 100 },
      { id: 'v2', label: 'B', x: 200, y: 100 },
      { id: 'v3', label: 'C', x: 150, y: 200 },
    ],
    edges: [
      { id: 'e1', source: 'v1', target: 'v2', weight: 3 },
      { id: 'e2', source: 'v2', target: 'v3', weight: 4 },
      { id: 'e3', source: 'v1', target: 'v3', weight: 7 },
    ],
  };

  it('correctly serializes graph topology and algorithm traces', () => {
    const kruskalTrace = runKruskal(sampleGraph);
    const primTrace = runPrim(sampleGraph, { startVertexId: 'v1' });

    const context = serializeGraphContext(
      sampleGraph,
      kruskalTrace,
      primTrace,
      1,
      1,
      'SIDE_BY_SIDE',
      'v1'
    );

    expect(context.vertexCount).toBe(3);
    expect(context.edgeCount).toBe(3);
    expect(context.isConnected).toBe(true);
    expect(context.minWeight).toBe(3);
    expect(context.maxWeight).toBe(7);
    expect(context.totalGraphWeight).toBe(14);
    expect(context.activeAlgorithm).toBe('SIDE_BY_SIDE');
    expect(context.kruskalContext).toBeDefined();
    expect(context.primContext).toBeDefined();
    expect(context.kruskalContext?.finalWeight).toBe(7); // 3 + 4 = 7
    expect(context.primContext?.finalWeight).toBe(7);
  });

  it('builds comprehensive system prompt with graph details', () => {
    const kruskalTrace = runKruskal(sampleGraph);
    const primTrace = runPrim(sampleGraph, { startVertexId: 'v1' });

    const context = serializeGraphContext(
      sampleGraph,
      kruskalTrace,
      primTrace,
      0,
      0,
      'SINGLE_KRUSKAL',
      'v1'
    );

    const prompt = buildSystemPrompt(context);
    expect(prompt).toContain('CURRENT GRAPH ON CANVAS');
    expect(prompt).toContain('Vertices (3)');
    expect(prompt).toContain('KRUSKAL\'S ALGORITHM');
    expect(prompt).toContain('Node');
  });

  it('generates accurate offline responses for step explanation, comparison, and complexity', () => {
    const kruskalTrace = runKruskal(sampleGraph);
    const primTrace = runPrim(sampleGraph, { startVertexId: 'v1' });

    const context = serializeGraphContext(
      sampleGraph,
      kruskalTrace,
      primTrace,
      1,
      1,
      'SIDE_BY_SIDE',
      'v1'
    );

    // Test step explanation
    const stepResponse = generateSmartOfflineResponse('Explain current step', context);
    expect(stepResponse).toContain('Current Step Breakdown');
    expect(stepResponse).toContain('Kruskal');
    expect(stepResponse).toContain('Prim');

    // Test comparison
    const compareResponse = generateSmartOfflineResponse('Compare Kruskal vs Prim', context);
    expect(compareResponse).toContain('Kruskal vs Prim Comparison');
    expect(compareResponse).toContain('Strategy');
    expect(compareResponse).toContain('Total MST Weight');
    expect(compareResponse).toContain('7');

    // Test total weight
    const weightResponse = generateSmartOfflineResponse('What is the total MST weight?', context);
    expect(weightResponse).toContain('Optimal Total MST Weight');
    expect(weightResponse).toContain('7');

    // Test complexity
    const complexityResponse = generateSmartOfflineResponse('What is the time complexity?', context);
    expect(complexityResponse).toContain('Algorithmic Complexity');
    expect(complexityResponse).toContain('O(E \\log E)');
  });

  it('handles empty canvas gracefully', () => {
    const emptyGraph: Graph = { vertices: [], edges: [] };
    const kruskalTrace = runKruskal(emptyGraph);
    const primTrace = runPrim(emptyGraph);

    const context = serializeGraphContext(
      emptyGraph,
      kruskalTrace,
      primTrace,
      0,
      0,
      'SIDE_BY_SIDE'
    );

    const response = generateSmartOfflineResponse('Explain step', context);
    expect(response).toContain('Canvas is Empty');
  });
});
