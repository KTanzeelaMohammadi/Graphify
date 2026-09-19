import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIChatToggleBtnProps {
  isOpen: boolean;
  onToggle: () => void;
  variant: 'SUBTOOLBAR' | 'FAB';
  title?: string;
}

export const AIChatToggleBtn: React.FC<AIChatToggleBtnProps> = ({
  isOpen,
  onToggle,
  variant,
  title = 'Ask Graph AI',
}) => {
  if (variant === 'SUBTOOLBAR') {
    return (
      <button
        className={`mst-pill-btn ai-trigger ${isOpen ? 'active' : ''}`}
        onClick={onToggle}
        title={title}
        aria-label="Toggle Graph AI Assistant"
      >
        <Sparkles size={13} style={{ color: isOpen ? '#ffffff' : 'var(--color-primary)' }} />
        <span>Ask AI</span>
      </button>
    );
  }

  return (
    <button
      className="mst-ai-fab"
      onClick={onToggle}
      title={title}
      aria-label="Open Graph AI Assistant"
    >
      <Sparkles size={14} />
      <span>Ask AI</span>
    </button>
  );
};
