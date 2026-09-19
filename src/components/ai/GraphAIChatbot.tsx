import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Sparkles, X, Send, Trash2 } from 'lucide-react';
import type { Graph, ExecutionTrace } from '../../core/types';
import graphifyIcon from '../../assets/graphify-icon.png';

declare const __GEMINI_API_KEY__: string | undefined;
import {
  serializeGraphContext,
  buildSystemPrompt,
  generateSmartOfflineResponse,
  queryGeminiAPI,
} from '../../core/aiGraphContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
}

interface GraphAIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  graph: Graph;
  kruskalTrace: ExecutionTrace;
  primTrace: ExecutionTrace;
  kruskalStepIndex: number;
  primStepIndex: number;
  viewMode: 'SIDE_BY_SIDE' | 'SINGLE_KRUSKAL' | 'SINGLE_PRIM';
  startVertexId?: string;
}

export const GraphAIChatbot: React.FC<GraphAIChatbotProps> = ({
  isOpen,
  onClose,
  graph,
  kruskalTrace,
  primTrace,
  kruskalStepIndex,
  primStepIndex,
  viewMode,
  startVertexId,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);

  const defaultKey =
    (typeof __GEMINI_API_KEY__ !== 'undefined' ? __GEMINI_API_KEY__ : '') ||
    ((import.meta as any).env?.gemini_api_key as string) ||
    ((import.meta as any).env?.GEMINI_API_KEY as string) ||
    localStorage.getItem('mst-gemini-api-key') ||
    '';

  const [apiKey] = useState<string>(() => defaultKey);

  // Persist default key to localStorage if unset
  useEffect(() => {
    if (!localStorage.getItem('mst-gemini-api-key') && defaultKey) {
      localStorage.setItem('mst-gemini-api-key', defaultKey);
    }
  }, [defaultKey]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef<boolean>(false);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, isOpen]);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Serialized live context
  const liveContext = useMemo(() => {
    return serializeGraphContext(
      graph,
      kruskalTrace,
      primTrace,
      kruskalStepIndex,
      primStepIndex,
      viewMode,
      startVertexId
    );
  }, [graph, kruskalTrace, primTrace, kruskalStepIndex, primStepIndex, viewMode, startVertexId]);

  // Initial welcome message once on mount
  useEffect(() => {
    if (!hasInitializedRef.current && graph.vertices.length > 0) {
      hasInitializedRef.current = true;
      const activeStepNumber =
        viewMode === 'SINGLE_PRIM' ? primStepIndex + 1 : kruskalStepIndex + 1;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'assistant',
          text: `### ✨ Graph AI Synced & Ready
I am connected to your live canvas with **${graph.vertices.length} vertices** and **${graph.edges.length} edges** (currently at **Step ${activeStepNumber}**).

You can ask me step-by-step explanations, why specific edges are accepted or rejected, DSU partition states, cut property, or computational complexity. Click a prompt below or type your question!`,
          timestamp: Date.now(),
        },
      ]);
    }
  }, [graph.vertices.length, viewMode, kruskalStepIndex, primStepIndex]);

  // Compute dynamic action chips based on active state
  const dynamicChips = useMemo(() => {
    const chips: string[] = [];
    const stepNum = viewMode === 'SINGLE_PRIM' ? primStepIndex + 1 : kruskalStepIndex + 1;

    chips.push(`Explain Step ${stepNum}`);

    if (liveContext.kruskalContext && liveContext.kruskalContext.rejectedEdges.length > 0) {
      chips.push('Why was an edge rejected?');
    }

    chips.push('Compare Kruskal vs Prim');
    chips.push('Total MST Weight');
    chips.push('Complexity Analysis');
    chips.push('DSU State');

    return chips;
  }, [liveContext, viewMode, primStepIndex, kruskalStepIndex]);

  // Handle user query submission
  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      let responseText = '';

      if (apiKey.trim()) {
        // Send to Google Gemini API
        const systemPrompt = buildSystemPrompt(liveContext);
        const history = messages.map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('model' as const),
          parts: [{ text: m.text }],
        }));

        try {
          responseText = await queryGeminiAPI(apiKey.trim(), query, systemPrompt, history);
        } catch (apiErr: any) {
          console.warn('Gemini API call failed, falling back to smart heuristic:', apiErr);
          responseText = `> [!WARNING]\n> Gemini API notice: ${apiErr.message || 'Request error'}. Falling back to Smart Graph Analyst.\n\n` +
            generateSmartOfflineResponse(query, liveContext);
        }
      } else {
        // Built-in intelligent offline engine with simulated natural micro-delay
        await new Promise((resolve) => setTimeout(resolve, 280));
        responseText = generateSmartOfflineResponse(query, liveContext);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: responseText,
          timestamp: Date.now(),
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          text: `### ⚠️ Error\nCould not process your question: ${err?.message || 'Unknown error'}. Please try again.`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = () => {
    hasInitializedRef.current = true;
    setMessages([]);
    setInputText('');
  };

  // Minimal Markdown Formatter
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let inTable = false;
    let tableRows: string[][] = [];

    const flushTable = (keyPrefix: string) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(1);
        elements.push(
          <div key={`${keyPrefix}-table`} style={{ overflowX: 'auto', margin: '0.4rem 0' }}>
            <table>
              <thead>
                <tr>
                  {header.map((col, cIdx) => (
                    <th key={cIdx}>{col.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    lines.forEach((line, idx) => {
      // Check for table line
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        // Skip separator row like | :--- | :--- |
        if (line.includes('---')) return;

        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable(`line-${idx}`);
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={idx}>{formatInline(line.replace('### ', ''))}</h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={idx}>{formatInline(line.replace('#### ', ''))}</h4>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <ul key={idx} style={{ margin: '2px 0' }}>
            <li>{formatInline(line.slice(2))}</li>
          </ul>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const content = line.replace(/^\d+\.\s/, '');
        elements.push(
          <ol key={idx} style={{ margin: '2px 0' }}>
            <li>{formatInline(content)}</li>
          </ol>
        );
      } else if (line.trim() === '') {
        // empty line
      } else {
        elements.push(
          <p key={idx}>{formatInline(line)}</p>
        );
      }
    });

    if (inTable) {
      flushTable('end');
    }

    return elements;
  };

  // Helper for bold and inline code
  const formatInline = (str: string): React.ReactNode => {
    // Process markdown links [text](url)
    const parts = str.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={pIdx}>{part.slice(1, -1)}</code>;
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <aside
      className={`mst-ai-drawer ${isOpen ? 'is-open' : ''}`}
      aria-label="Graph AI Assistant Drawer"
    >
      {/* Header */}
      <div className="mst-ai-header">
        <div className="mst-ai-title-wrap">
          <span className="mst-ai-title">
            <img
              src={graphifyIcon}
              alt="Graphify"
              style={{ width: '16px', height: '16px', objectFit: 'contain' }}
            />
            <span>Graph AI</span>
          </span>
          <span className="mst-ai-sync-badge" title="Assistant is in real-time sync with canvas topology and traces">
            <span className="mst-sync-dot" />
            <span>{graph.vertices.length}V &bull; {graph.edges.length}E</span>
          </span>
        </div>

        <div className="mst-ai-actions">
          <button
            className="mst-ai-icon-btn"
            onClick={handleClearHistory}
            title="Clear Chat History"
            aria-label="Clear chat history"
          >
            <Trash2 size={14} />
          </button>
          <button
            className="mst-ai-icon-btn"
            onClick={onClose}
            title="Close Assistant (Esc)"
            aria-label="Close Assistant"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Dynamic Action Chips */}
      <div className="mst-ai-chips-bar" aria-label="Suggested questions">
        {dynamicChips.map((chip, idx) => (
          <button
            key={idx}
            className="mst-ai-chip"
            onClick={() => handleSendMessage(chip)}
            disabled={isThinking}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="mst-ai-messages">
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
            <Sparkles size={22} style={{ color: 'var(--color-primary)', opacity: 0.5, marginBottom: '6px' }} />
            <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 4px 0' }}>
              Chat history cleared
            </p>
            <p style={{ fontSize: '0.72rem', margin: 0, color: 'var(--text-muted)' }}>
              Click a prompt chip above or type below to ask a question.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`mst-ai-msg ${msg.sender}`}>
            {msg.sender === 'user' ? (
              <div className="mst-ai-bubble-user">{msg.text}</div>
            ) : (
              <div className="mst-ai-bubble-assistant">
                {renderFormattedMarkdown(msg.text)}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="mst-ai-msg assistant">
            <div className="mst-ai-typing">
              <span className="mst-typing-dot" />
              <span className="mst-typing-dot" />
              <span className="mst-typing-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        className="mst-ai-input-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="mst-ai-input"
          placeholder="Ask anything about this graph or step..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isThinking}
        />
        <button
          type="submit"
          className="mst-ai-send-btn"
          disabled={!inputText.trim() || isThinking}
          title="Send message"
          aria-label="Send message"
        >
          <Send size={14} />
        </button>
      </form>
    </aside>
  );
};
