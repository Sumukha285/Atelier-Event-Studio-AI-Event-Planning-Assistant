/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Mail, MessageSquare, Send, Sparkles, TrendingDown, X } from 'lucide-react';
import { getRemainingCooldownMs, sendCoPilotMessage } from '../services/gemini.service';
import { ChatMessage, EventPlanState } from '../types/event.types';
import { formatCurrency } from '../utils/domain.utils';
import { sanitizeText } from '../utils/security.utils';
import { CoPilotMessageList } from './CoPilotMessageList';

export interface CoPilotDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly eventState: EventPlanState;
  readonly onAppendMessage: (msg: ChatMessage) => void;
}

/**
 * @description Slide-out Event Co-Pilot assistant drawer grounded in the active event state.
 * @param {CoPilotDrawerProps} props - Drawer visibility, close callback, event state, and message dispatcher
 * @returns {React.ReactElement | null} Memoized CoPilotDrawer JSX element or `null`
 */
export const CoPilotDrawer = React.memo(function CoPilotDrawer({
  isOpen,
  onClose,
  eventState,
  onAppendMessage,
}: CoPilotDrawerProps): React.ReactElement | null {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleSend = useCallback(async (promptText?: string): Promise<void> => {
    const cleanText = sanitizeText(promptText ?? input, 400);
    if (!cleanText || isSending) return;
    if (getRemainingCooldownMs() > 0) return;

    onAppendMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: cleanText,
      timestamp: new Date().toISOString(),
    });
    if (!promptText) setInput('');
    setIsSending(true);

    try {
      const data = await sendCoPilotMessage(cleanText, eventState);
      onAppendMessage({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
      });
    } catch {
      onAppendMessage({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `For **${eventState.config.eventName}**, I recommend locking your Venue and Catering contracts first while keeping a 10% contingency buffer (${formatCurrency(Math.round(eventState.config.totalBudget * 0.1), eventState.config.currency)}).`,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSending(false);
    }
  }, [eventState, input, isSending, onAppendMessage]);

  const handleQuickEmail = useCallback((): void => {
    void handleSend('Draft a formal vendor inquiry email for our Venue & Catering shortlist.');
  }, [handleSend]);

  const handleQuickBudget = useCallback((): void => {
    void handleSend('How can I optimize our budget to save 12% without sacrificing guest experience?');
  }, [handleSend]);

  const handleFormSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    void handleSend();
  }, [handleSend]);

  if (!isOpen) return null;
  const { config, chatHistory } = eventState;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/35 backdrop-blur-[1px]" data-testid="copilot-drawer">
      <div role="dialog" aria-modal="true" aria-label="Ask Event Co-Pilot Assistant" className="w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col justify-between shadow-2xl">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Sparkles className="w-4 h-4 text-amber-400" /></div>
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Ask Event Co-Pilot</h3>
              <p className="text-[11px] text-slate-300 font-mono truncate max-w-[240px]">{config.eventName} · {formatCurrency(config.totalBudget, config.currency)}</p>
            </div>
          </div>
          <button type="button" data-testid="close-copilot-btn" onClick={onClose} aria-label="Close Co-Pilot Drawer" className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-1.5">
          <button type="button" data-testid="copilot-quick-email" onClick={handleQuickEmail} disabled={isSending} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 cursor-pointer"><Mail className="w-3 h-3 text-slate-500" /><span>Draft Vendor Email</span></button>
          <button type="button" data-testid="copilot-quick-budget" onClick={handleQuickBudget} disabled={isSending} className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-white border border-slate-200/90 text-slate-700 hover:bg-slate-100 cursor-pointer"><TrendingDown className="w-3 h-3 text-slate-500" /><span>Save 12% on Budget</span></button>
        </div>

        <CoPilotMessageList chatHistory={chatHistory} isSending={isSending} />

        <form onSubmit={handleFormSubmit} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 ml-1" aria-hidden="true" />
          <label htmlFor="copilot-chat-input" className="sr-only">Ask Co-Pilot a question</label>
          <input id="copilot-chat-input" type="text" data-testid="copilot-chat-input" value={input} aria-invalid={false} aria-describedby="copilot-input-desc" onChange={(e) => setInput(e.target.value)} placeholder="Ask about budget, timeline, or vendor emails..." maxLength={400} className="flex-1 text-xs text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-slate-900" />
          <span id="copilot-input-desc" className="sr-only">Enter a planning question for the AI Event Co-Pilot.</span>
          <button type="submit" data-testid="copilot-send-btn" disabled={isSending || !input.trim()} aria-label="Send message" className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"><Send className="w-3.5 h-3.5" /></button>
        </form>
      </div>
    </div>
  );
});

export default CoPilotDrawer;
