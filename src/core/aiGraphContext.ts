import type { Graph, ExecutionTrace, Vertex } from './types';

export interface SerializedGraphContext {
  vertexCount: number;
  edgeCount: number;
  vertices: { id: string; label: string; degree: number }[];
  edges: { id: string; from: string; to: string; weight: number }[];
  totalGraphWeight: number;
  isConnected: boolean;
  minWeight: number;
  maxWeight: number;
  activeAlgorithm: 'KRUSKAL' | 'PRIM' | 'SIDE_BY_SIDE';
  kruskalContext?: {
    currentStepIndex: number;
    totalSteps: number;
    currentWeight: number;
    stepType: string;
    activeEdge?: { from: string; to: string; weight: number };
    acceptedEdges: { from: string; to: string; weight: number }[];
    rejectedEdges: { from: string; to: string; weight: number; reason: string }[];
    dsuComponents: string[][];
    explanation: string;
    isComplete: boolean;
    finalWeight?: number;
  };
  primContext?: {
    currentStepIndex: number;
    totalSteps: number;
    startVertex: string;
    currentWeight: number;
    stepType: string;
    activeEdge?: { from: string; to: string; weight: number };
    cutVisitedVertices: string[];
    cutUnvisitedVertices: string[];
    priorityQueue: { from: string; to: string; weight: number }[];
    acceptedEdges: { from: string; to: string; weight: number }[];
    explanation: string;
    isComplete: boolean;
    finalWeight?: number;
  };
}

/**
 * Serializes the current graph and algorithm traces into structured context
 */
export function serializeGraphContext(
  graph: Graph,
  kruskalTrace: ExecutionTrace,
  primTrace: ExecutionTrace,
  kruskalStepIndex: number,
  primStepIndex: number,
  viewMode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM',
  startVertexId?: string
): SerializedGraphContext {
  const vertexMap = new Map<string, Vertex>();
  const vertexDegrees = new Map<string, number>();

  graph.vertices.forEach((v) => {
    vertexMap.set(v.id, v);
    vertexDegrees.set(v.id, 0);
  });

  let totalGraphWeight = 0;
  let minWeight = Infinity;
  let maxWeight = -Infinity;

  const edges = graph.edges.map((e) => {
    totalGraphWeight += e.weight;
    if (e.weight < minWeight) minWeight = e.weight;
    if (e.weight > maxWeight) maxWeight = e.weight;

    const fromLabel = vertexMap.get(e.source)?.label || e.source;
    const toLabel = vertexMap.get(e.target)?.label || e.target;

    vertexDegrees.set(e.source, (vertexDegrees.get(e.source) || 0) + 1);
    vertexDegrees.set(e.target, (vertexDegrees.get(e.target) || 0) + 1);

    return {
      id: e.id,
      from: fromLabel,
      to: toLabel,
      weight: e.weight,
    };
  });

  if (graph.edges.length === 0) {
    minWeight = 0;
    maxWeight = 0;
  }

  const vertices = graph.vertices.map((v) => ({
    id: v.id,
    label: v.label,
    degree: vertexDegrees.get(v.id) || 0,
  }));

  // Helper to extract edge details
  const getEdgeDetails = (edgeId?: string) => {
    if (!edgeId) return undefined;
    const edge = graph.edges.find((e) => e.id === edgeId);
    if (!edge) return undefined;
    return {
      from: vertexMap.get(edge.source)?.label || edge.source,
      to: vertexMap.get(edge.target)?.label || edge.target,
      weight: edge.weight,
    };
  };

  // Kruskal Context
  const kStep = kruskalTrace.steps[kruskalStepIndex] || kruskalTrace.steps[0];
  let kruskalContext = undefined;
  if (kStep) {
    // Partition DSU sets
    const dsuSets: Record<string, string[]> = {};
    if (kStep.disjointSetState) {
      Object.entries(kStep.disjointSetState).forEach(([vId, rootId]) => {
        const vLabel = vertexMap.get(vId)?.label || vId;
        const rootLabel = vertexMap.get(rootId)?.label || rootId;
        if (!dsuSets[rootLabel]) dsuSets[rootLabel] = [];
        dsuSets[rootLabel].push(vLabel);
      });
    }

    const acceptedEdges = kStep.acceptedEdgeIds
      .map(getEdgeDetails)
      .filter((e): e is NonNullable<typeof e> => !!e);

    const rejectedEdges = kStep.rejectedEdgeIds
      .map((id) => {
        const det = getEdgeDetails(id);
        return det
          ? { ...det, reason: `Adding (${det.from}, ${det.to}) would create a cycle within the same connected component.` }
          : null;
      })
      .filter((e): e is NonNullable<typeof e> => !!e);

    kruskalContext = {
      currentStepIndex: kruskalStepIndex,
      totalSteps: kruskalTrace.steps.length,
      currentWeight: kStep.currentWeight,
      stepType: kStep.type,
      activeEdge: getEdgeDetails(kStep.activeEdgeId),
      acceptedEdges,
      rejectedEdges,
      dsuComponents: Object.values(dsuSets),
      explanation: kStep.explanation,
      isComplete: kStep.type === 'COMPLETE' || kruskalStepIndex >= kruskalTrace.steps.length - 1,
      finalWeight: kruskalTrace.result.totalWeight,
    };
  }

  // Prim Context
  const pStep = primTrace.steps[primStepIndex] || primTrace.steps[0];
  let primContext = undefined;
  if (pStep) {
    const visitedLabels = (pStep.visitedVertexIds || []).map((id) => vertexMap.get(id)?.label || id);
    const visitedSet = new Set(pStep.visitedVertexIds || []);
    const unvisitedLabels = graph.vertices
      .filter((v) => !visitedSet.has(v.id))
      .map((v) => v.label);

    const pqItems = (pStep.priorityQueueState || []).map((item) => ({
      from: vertexMap.get(item.source)?.label || item.source,
      to: vertexMap.get(item.target)?.label || item.target,
      weight: item.weight,
    }));

    const acceptedEdges = pStep.acceptedEdgeIds
      .map(getEdgeDetails)
      .filter((e): e is NonNullable<typeof e> => !!e);

    const startLabel =
      graph.vertices.find((v) => v.id === startVertexId)?.label ||
      graph.vertices[0]?.label ||
      'None';

    primContext = {
      currentStepIndex: primStepIndex,
      totalSteps: primTrace.steps.length,
      startVertex: startLabel,
      currentWeight: pStep.currentWeight,
      stepType: pStep.type,
      activeEdge: getEdgeDetails(pStep.activeEdgeId),
      cutVisitedVertices: visitedLabels,
      cutUnvisitedVertices: unvisitedLabels,
      priorityQueue: pqItems,
      acceptedEdges,
      explanation: pStep.explanation,
      isComplete: pStep.type === 'COMPLETE' || primStepIndex >= primTrace.steps.length - 1,
      finalWeight: primTrace.result.totalWeight,
    };
  }

  const activeAlgorithm =
    viewMode === 'SINGLE_KRUSKAL'
      ? 'KRUSKAL'
      : viewMode === 'SINGLE_PRIM'
      ? 'PRIM'
      : 'SIDE_BY_SIDE';

  return {
    vertexCount: graph.vertices.length,
    edgeCount: graph.edges.length,
    vertices,
    edges,
    totalGraphWeight,
    isConnected: kruskalTrace.result.isCompleteMST,
    minWeight,
    maxWeight,
    activeAlgorithm,
    kruskalContext,
    primContext,
  };
}

/**
 * Builds a natural language system context string for LLM prompting
 */
export function buildSystemPrompt(ctx: SerializedGraphContext): string {
  const edgeListStr = ctx.edges
    .map((e) => `(${e.from}, ${e.to}, weight: ${e.weight})`)
    .join(', ');

  const vertexListStr = ctx.vertices.map((v) => `${v.label} (degree ${v.degree})`).join(', ');

  return `You are Graph AI, an intelligent, specialized algorithm and graph theory tutor embedded directly inside MST Lab (Minimum Spanning Tree Visualizer).
You have real-time live introspection of the exact graph currently on the user's canvas.

CURRENT GRAPH ON CANVAS:
- Vertices (${ctx.vertexCount}): ${vertexListStr || 'None'}
- Edges (${ctx.edgeCount}): ${edgeListStr || 'None'}
- Graph Status: ${ctx.isConnected ? 'Connected graph (Full MST possible with ' + Math.max(0, ctx.vertexCount - 1) + ' edges)' : 'Disconnected graph (Minimum Spanning Forest MSF)'}
- Edge weight range: min = ${ctx.minWeight}, max = ${ctx.maxWeight}, sum = ${ctx.totalGraphWeight}
- Active Studio View: ${ctx.activeAlgorithm}

ALGORITHM STATES:
${
  ctx.kruskalContext
    ? `KRUSKAL'S ALGORITHM (Step ${ctx.kruskalContext.currentStepIndex + 1}/${ctx.kruskalContext.totalSteps}):
- Step Type: ${ctx.kruskalContext.stepType}
- Active Edge: ${ctx.kruskalContext.activeEdge ? `(${ctx.kruskalContext.activeEdge.from}, ${ctx.kruskalContext.activeEdge.to}, wt: ${ctx.kruskalContext.activeEdge.weight})` : 'None'}
- Accepted Edges so far (${ctx.kruskalContext.acceptedEdges.length}): ${ctx.kruskalContext.acceptedEdges.map((e) => `(${e.from}-${e.to}: ${e.weight})`).join(', ') || 'None'}
- Current Running MST Weight: ${ctx.kruskalContext.currentWeight}
- Final Total MST Weight: ${ctx.kruskalContext.finalWeight}
- Disjoint Sets (DSU): ${ctx.kruskalContext.dsuComponents.map((set) => `{${set.join(', ')}}`).join(' | ') || 'None'}
- Active Explanation: "${ctx.kruskalContext.explanation}"`
    : ''
}

${
  ctx.primContext
    ? `PRIM'S ALGORITHM (Step ${ctx.primContext.currentStepIndex + 1}/${ctx.primContext.totalSteps}):
- Start Root Vertex: ${ctx.primContext.startVertex}
- Step Type: ${ctx.primContext.stepType}
- Cut Visited Set S (in tree): {${ctx.primContext.cutVisitedVertices.join(', ')}}
- Cut Unvisited Set V \\ S: {${ctx.primContext.cutUnvisitedVertices.join(', ')}}
- Priority Queue (Eligible crossing edges): ${ctx.primContext.priorityQueue.map((e) => `(${e.from}-${e.to}: ${e.weight})`).join(', ') || 'Empty'}
- Accepted Edges so far: ${ctx.primContext.acceptedEdges.map((e) => `(${e.from}-${e.to}: ${e.weight})`).join(', ') || 'None'}
- Current Running MST Weight: ${ctx.primContext.currentWeight}
- Final Total MST Weight: ${ctx.primContext.finalWeight}
- Active Explanation: "${ctx.primContext.explanation}"`
    : ''
}

GUIDELINES FOR YOUR RESPONSES:
1. Always refer directly to the actual vertex labels (e.g., Vertex A, Node B) and weights on canvas.
2. Provide concise, crystal-clear, structured answers using markdown formatting (bullet points, bolding, inline code).
3. If asked why an edge was accepted or rejected, invoke graph theory invariants:
   - For Kruskal: Cycle Property / DSU Find operations (same root vs different roots).
   - For Prim: Cut Property / Min-crossing edge across cut (S, V \\ S).
4. Explain step-by-step when asked about steps.
5. Keep explanations pedagogical, direct, and free of unnecessary fluff.`;
}

/**
 * Built-in Offline Smart Analyst:
 * Responds accurately and immediately without requiring an API key.
 */
export function generateSmartOfflineResponse(
  userQuery: string,
  ctx: SerializedGraphContext
): string {
  const query = userQuery.toLowerCase().trim();

  // If no vertices
  if (ctx.vertexCount === 0) {
    return `### Canvas is Empty
There are currently no vertices or edges drawn on the canvas.
- Click **Add Vertex** to place nodes on the canvas.
- Click **Add Edge** and select two nodes to connect them with a weighted edge.
- Or select a preset from **Preset Graphs** to explore standard MST benchmark graphs.`;
  }

  // Question 1: Explain current step / what is happening now
  if (
    query.includes('explain') ||
    query.includes('current step') ||
    query.includes('what is happening') ||
    query.includes('step explanation')
  ) {
    const isKruskalActive = ctx.activeAlgorithm === 'KRUSKAL' || ctx.activeAlgorithm === 'SIDE_BY_SIDE';
    const isPrimActive = ctx.activeAlgorithm === 'PRIM' || ctx.activeAlgorithm === 'SIDE_BY_SIDE';

    let response = `### 📍 Current Step Breakdown\n\n`;

    if (isKruskalActive && ctx.kruskalContext) {
      const k = ctx.kruskalContext;
      response += `#### Kruskal's Algorithm — Step ${k.currentStepIndex + 1} of ${k.totalSteps}\n`;
      response += `- **Action**: ${k.explanation}\n`;
      if (k.activeEdge) {
        response += `- **Active Edge**: **(${k.activeEdge.from}, ${k.activeEdge.to})** with weight **${k.activeEdge.weight}**.\n`;
        if (k.stepType === 'ACCEPT_EDGE') {
          response += `- **Outcome**: ✅ **Accepted into MST**. Endpoints belong to separate DSU components, so adding this edge connects them without forming a cycle.\n`;
        } else if (k.stepType === 'REJECT_EDGE') {
          response += `- **Outcome**: ❌ **Rejected**. Both endpoints already belong to the same connected component. Adding this edge would create a redundant cycle.\n`;
        } else if (k.stepType === 'CONSIDER_EDGE') {
          response += `- **Evaluation**: Evaluating whether endpoints are in disjoint components.\n`;
        }
      }
      response += `- **DSU Components**: ${k.dsuComponents.map((c) => `\`{${c.join(', ')}}\``).join(', ')}\n`;
      response += `- **Current MST Weight**: **${k.currentWeight}** (${k.acceptedEdges.length} / ${Math.max(0, ctx.vertexCount - 1)} edges accepted).\n\n`;
    }

    if (isPrimActive && ctx.primContext) {
      const p = ctx.primContext;
      response += `#### Prim's Algorithm — Step ${p.currentStepIndex + 1} of ${p.totalSteps}\n`;
      response += `- **Action**: ${p.explanation}\n`;
      response += `- **Root Vertex**: Selected start node is **${p.startVertex}**.\n`;
      response += `- **Cut Partition**: Visited Tree vertices $S = \\{${p.cutVisitedVertices.join(', ')}\\}$, Unvisited $V \\setminus S = \\{${p.cutUnvisitedVertices.join(', ')}\\}$.\n`;
      if (p.priorityQueue.length > 0) {
        response += `- **Min-Priority Queue**: Top candidate is edge **(${p.priorityQueue[0].from}, ${p.priorityQueue[0].to})** with weight **${p.priorityQueue[0].weight}**.\n`;
      }
      response += `- **Current MST Weight**: **${p.currentWeight}**.\n`;
    }

    return response;
  }

  // Question 2: Why was an edge rejected?
  if (
    query.includes('why') &&
    (query.includes('reject') || query.includes('skip') || query.includes('cycle'))
  ) {
    if (ctx.kruskalContext && ctx.kruskalContext.rejectedEdges.length > 0) {
      const rejections = ctx.kruskalContext.rejectedEdges;
      let text = `### 🚫 Edge Rejection Analysis (Cycle Avoidance)\n\nIn Kruskal's algorithm, an edge is discarded when both of its incident vertices already belong to the same connected component in the **Disjoint Set Union (DSU)** data structure.\n\n`;
      rejections.forEach((r, idx) => {
        text += `${idx + 1}. **Edge (${r.from}, ${r.to}) [weight: ${r.weight}]**:\n   - **Reason**: Vertices **${r.from}** and **${r.to}** already have a common representative root. Adding this edge would create a cycle, violating the tree property ($V-1$ edges, acyclic).\n`;
      });
      return text;
    } else {
      return `### ℹ️ No Edges Rejected At This Point
Up to the current execution step, all considered edges have successfully united separate components without forming a cycle. As you step forward, edges that connect already-united vertices will be marked with a red stroke and rejected.`;
    }
  }

  // Question 3: Compare Kruskal vs Prim on this graph
  if (
    query.includes('compare') ||
    query.includes('difference') ||
    (query.includes('kruskal') && query.includes('prim'))
  ) {
    const kWeight = ctx.kruskalContext?.finalWeight ?? 0;
    const pWeight = ctx.primContext?.finalWeight ?? 0;
    const isWeightsMatch = kWeight === pWeight;

    return `### ⚖️ Kruskal vs Prim Comparison on Current Graph

| Metric | Kruskal's Algorithm | Prim's Algorithm |
| :--- | :--- | :--- |
| **Strategy** | Edge-Centric (Global Sorting) | Vertex-Centric (Growing Cut) |
| **Data Structure** | Disjoint Set Union (DSU with Union-Find) | Min-Priority Queue (Min-Heap) |
| **Total MST Weight** | **${kWeight}** | **${pWeight}** |
| **Edges in MST** | ${Math.max(0, ctx.vertexCount - 1)} | ${Math.max(0, ctx.vertexCount - 1)} |
| **Time Complexity** | $O(E \\log E)$ or $O(E \\log V)$ | $O(E \\log V)$ with binary heap |
| **Space Complexity** | $O(V + E)$ (Parent & Rank arrays) | $O(V + E)$ (Priority queue & visited set) |

**Key Takeaways for this Graph**:
- **Equivalence**: ${isWeightsMatch ? `Both algorithms compute an MST of identical total weight (**${kWeight}**).` : `Weights differ because the graph may not be fully connected.`}
- **Order of Selection**: Kruskal evaluated edges strictly in non-decreasing order of weight. Prim grew a single tree outward from root **${ctx.primContext?.startVertex || 'A'}**, only considering edges crossing the cut $(S, V \\setminus S)$ at each step.`;
  }

  // Question 4: Total MST Weight & Summary
  if (
    query.includes('mst weight') ||
    query.includes('total weight') ||
    query.includes('summary') ||
    query.includes('optimal')
  ) {
    const mstWeight = ctx.kruskalContext?.finalWeight ?? 0;
    const targetEdges = Math.max(0, ctx.vertexCount - 1);
    const acceptedK = ctx.kruskalContext?.acceptedEdges.map((e) => `(${e.from}-${e.to}: ${e.weight})`).join(', ') || 'None';

    return `### 🌲 Graph & MST Summary
- **Vertices ($V$)**: ${ctx.vertexCount} nodes (\`${ctx.vertices.map((v) => v.label).join(', ')}\`)
- **Edges ($E$)**: ${ctx.edgeCount} edges
- **Connectivity**: ${ctx.isConnected ? '✅ Fully Connected (Single MST exists)' : '⚠️ Disconnected (Forms a Spanning Forest)'}
- **MST Edge Count Required**: $V - 1 = ${targetEdges}$ edges
- **Optimal Total MST Weight**: **${mstWeight}**
- **Accepted MST Edges**: ${acceptedK}
- **Sparsity**: Average vertex degree is **${ctx.vertexCount > 0 ? ((2 * ctx.edgeCount) / ctx.vertexCount).toFixed(2) : 0}**.`;
  }

  // Question 5: Time and Space Complexity
  if (
    query.includes('complexity') ||
    query.includes('big o') ||
    query.includes('runtime') ||
    query.includes('time')
  ) {
    return `### ⚡ Algorithmic Complexity

#### Kruskal's Algorithm
- **Time**: **$O(E \\log E)$** to sort all edges (or $O(E \\log V)$ since $E < V^2$). DSU operations (Find and Union with path compression and union by rank) take nearly linear time: $O(E \\cdot \\alpha(V))$, where $\\alpha$ is the Inverse Ackermann function.
- **Space**: **$O(V)$** to store parent and rank pointers for each vertex.
- **Best Suited For**: Sparse graphs ($E \\ll V^2$).

#### Prim's Algorithm
- **Time**:
  - With **Binary Min-Heap**: **$O(E \\log V)$**
  - With **Fibonacci Heap**: **$O(E + V \\log V)$**
- **Space**: **$O(V + E)$** to maintain the Priority Queue and adjacency list.
- **Best Suited For**: Dense graphs ($E \\approx V^2$).`;
  }

  // Question 6: DSU / Disjoint Set Union explanation
  if (query.includes('dsu') || query.includes('union') || query.includes('find')) {
    const components = ctx.kruskalContext?.dsuComponents || [];
    return `### 🔗 Disjoint Set Union (DSU) State
DSU keeps track of connected components to avoid cycles in Kruskal's algorithm:
- **Current Partition Count**: ${components.length} component(s)
- **Component Sets**: ${components.map((c) => `\`{${c.join(', ')}}\``).join(' , ')}

**How it works**:
1. **Find(u)**: Traverses parent pointers to find the representative root of vertex $u$ with *path compression*.
2. **Union(u, v)**: If $\\text{Find}(u) \\neq \\text{Find}(v)$, the smaller tree is attached under the larger tree (*union by rank*), merging two sets into one.
3. If $\\text{Find}(u) == \\text{Find}(v)$, the edge creates a cycle and is **rejected**.`;
  }

  // Question 7: Cut Property / Prim cut explanation
  if (query.includes('cut') || query.includes('crossing') || query.includes('priority queue')) {
    const visited = ctx.primContext?.cutVisitedVertices.join(', ') || '';
    const unvisited = ctx.primContext?.cutUnvisitedVertices.join(', ') || '';
    return `### ✂️ The Cut Property (Prim's Foundation)
A **Cut** $(S, V \\setminus S)$ is a partition of vertices into two disjoint subsets.
- **Tree Vertices $S$**: \`{${visited || 'None'}}\`
- **Unvisited Vertices $V \\setminus S$**: \`{${unvisited || 'None'}}\`

**The Cut Theorem**:
For any cut of a connected graph, the minimum-weight edge crossing the cut $(u \\in S, v \\in V \\setminus S)$ is guaranteed to belong to some Minimum Spanning Tree.
Prim's algorithm repeatedly extracts this exact minimum crossing edge from its Priority Queue.`;
  }

  // Default intelligent fallback: context-specific overview
  return `### 💡 Graph AI Overview
I have inspected the canvas with **${ctx.vertexCount} vertices** and **${ctx.edgeCount} edges**:
- **Vertices**: ${ctx.vertices.map((v) => v.label).join(', ')}
- **Total MST Weight**: **${ctx.kruskalContext?.finalWeight ?? 0}** (${Math.max(0, ctx.vertexCount - 1)} tree edges)
- **Active Step**: Step ${(ctx.kruskalContext?.currentStepIndex ?? 0) + 1} of Kruskal / ${(ctx.primContext?.currentStepIndex ?? 0) + 1} of Prim.

**Try asking me**:
1. *"Explain the current step"*
2. *"Why was this edge rejected or accepted?"*
3. *"Compare Kruskal vs Prim on this graph"*
4. *"What is the time complexity of both algorithms?"*
5. *"How does the Disjoint Set Union prevent cycles?"*

*(You can also add your Gemini API Key in the assistant settings to ask open-ended custom questions!)*`;
}

/**
 * Direct client-side Google Gemini Flash API caller
 */
export async function queryGeminiAPI(
  apiKey: string,
  userPrompt: string,
  systemInstruction: string,
  chatHistory: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents = [
    ...chatHistory.slice(-6), // Send last 6 turns for context
    {
      role: 'user',
      parts: [{ text: userPrompt }],
    },
  ];

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1200,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    // If 404, attempt fallback to gemini-flash-latest
    if (response.status === 404) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
      const fbResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        const fbText = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (fbText) return fbText;
      }
    }

    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || response.statusText || 'API request failed';
    throw new Error(`Gemini API Error (${response.status}): ${message}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API returned an empty response.');
  }

  return text;
}
