import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  RefreshCw,
  Mail,
  DollarSign,
  CalendarCheck,
} from 'lucide-react';
import { ChatMessage, EventPlanState } from '../types/event';
import {
  computeBudgetSummary,
  computeTimelineProgress,
  formatCurrency,
} from '../utils/eventLogic';

interface CoPilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  state: EventPlanState;
  onAppendMessage: (msg: ChatMessage) => void;
}

const QUICK_PROMPTS = [
  {
    label: 'Draft Venue Inquiry Email',
    prompt: 'Draft a professional vendor inquiry email for our venue including date, guest count, and budget scope.',
    icon: Mail,
  },
  {
    label: 'Optimize Budget by 10%',
    prompt: 'Analyze our current budget breakdown and suggest 3 high-impact ways to save 10% without sacrificing guest experience.',
    icon: DollarSign,
  },
  {
    label: 'Audit Timeline Bottlenecks',
    prompt: 'Review our event parameters and suggest how to prevent arrival or catering bottlenecks on event day.',
    icon: CalendarCheck,
  },
];

export const CoPilotDrawer: React.FC<CoPilotDrawerProps> = ({
  isOpen,
  onClose,
  state,
  onAppendMessage,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, state.chatHistory.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currency = state.config.currency || 'USD';
  const budgetSummary = computeBudgetSummary(
    state.budgetCategories,
    state.config.totalBudget
  );
  const timelineStats = computeTimelineProgress(
    state.countdownTasks,
    state.itinerary
  );
  const selectedConcept = state.concepts.find(
    (c) => c.id === state.selectedConceptId
  );

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    onAppendMessage(userMsg);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          eventContext: {
            config: state.config,
            selectedConceptTitle: selectedConcept?.title,
            budgetSummary,
            timelineStats,
            vendorsCount: state.vendors.length,
          },
        }),
      });
      const data = await res.json();
      const replyContent =
        res.ok && data.reply
          ? data.reply
          : data.error || 'I encountered an issue processing that request.';

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toISOString(),
      };
      onAppendMessage(assistantMsg);
    } catch {
      onAppendMessage({
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: 'Unable to reach the Event Co-Pilot server right now.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-[1px] no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="copilot-drawer-title"
    >
      <div className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col justify-between shadow-xl">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-slate-700" />
              <span>Contextual Planning Assistant</span>
            </div>
            <h2
              id="copilot-drawer-title"
              className="text-base font-semibold text-slate-900 mt-0.5"
            >
              Ask Event Co-Pilot
            </h2>
          </div>

          <button
            type="button"
            aria-label="Close Event Co-Pilot Drawer"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Context Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 text-[11px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-medium text-slate-900 truncate max-w-[170px]">
            {state.config.eventName}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {state.config.guestCount} guests
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {formatCurrency(state.config.totalBudget, currency)}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">
            {timelineStats.completionPercent}% tasks done
          </span>
        </div>

        {/* Messages Feed */}
        <div
          aria-live="polite"
          className="flex-1 overflow-y-auto p-5 space-y-4"
        >
          {state.chatHistory.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] font-medium text-slate-400 mb-1">
                  {isUser ? 'You' : 'Event Co-Pilot'}
                </span>
                <div
                  className={`max-w-[90%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    {msg.content.split('\n').map((line, lIdx) => {
                      const trimmedLine = line.trim();
                      if (!trimmedLine) {
                        return <div key={lIdx} className="h-1" />;
                      }
                      if (trimmedLine.startsWith('### ')) {
                        return (
                          <p
                            key={lIdx}
                            className={`font-semibold text-xs pt-1 ${
                              isUser ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {trimmedLine.replace(/^###\s+/, '')}
                          </p>
                        );
                      }
                      const parts = line.split(/(\*\*.*?\*\*)/g);
                      return (
                        <p key={lIdx} className="leading-relaxed">
                          {parts.map((part, pIdx) =>
                            part.startsWith('**') && part.endsWith('**') ? (
                              <strong
                                key={pIdx}
                                className={
                                  isUser
                                    ? 'font-semibold text-white'
                                    : 'font-semibold text-slate-900'
                                }
                              >
                                {part.slice(2, -2)}
                              </strong>
                            ) : (
                              <React.Fragment key={pIdx}>{part}</React.Fragment>
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Event Co-Pilot is drafting response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts & Input Form */}
        <div className="p-4 border-t border-slate-200 bg-white space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon;
              return (
                <button
                  key={qp.label}
                  type="button"
                  disabled={isSending}
                  onClick={() => sendMessage(qp.prompt)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Icon className="w-3 h-3 text-slate-500" />
                  <span>{qp.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              aria-label="Ask Event Co-Pilot a question"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a planning question or draft vendor email..."
              className="flex-1 h-10 px-3.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send message to Event Co-Pilot"
              className="h-10 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
