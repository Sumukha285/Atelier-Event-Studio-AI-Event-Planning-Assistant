/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatMessage } from '../types/event.types';

export interface CoPilotMessageListProps {
  readonly chatHistory: readonly ChatMessage[];
  readonly isSending: boolean;
}

/**
 * Renders safe formatted text lines (bold and bullet points) without `dangerouslySetInnerHTML`.
 *
 * @param text - Raw message content
 * @returns Array of React nodes
 */
export function renderFormattedContent(text: string): React.ReactNode {
  return text.split('\n').map((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return <div key={idx} className="h-1.5" />;
    const parts = line.split(/(\*\*.*?\*\*)/g).map((seg, sIdx) =>
      seg.startsWith('**') && seg.endsWith('**') ? (
        <strong key={sIdx} className="font-semibold text-slate-900">
          {seg.slice(2, -2)}
        </strong>
      ) : (
        <React.Fragment key={sIdx}>{seg}</React.Fragment>
      )
    );
    if (trimmed.startsWith('### ')) {
      return (
        <h4
          key={idx}
          className="text-xs font-semibold text-slate-900 uppercase tracking-wider mt-2 mb-1"
        >
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('- ')) {
      return (
        <div key={idx} className="flex items-start gap-1.5 pl-1 my-0.5">
          <span className="text-slate-400">·</span>
          <span>{parts}</span>
        </div>
      );
    }
    return (
      <p key={idx} className="leading-relaxed">
        {parts}
      </p>
    );
  });
}

/**
 * Renders the scrollable message history inside `CoPilotDrawer`.
 *
 * @param props - Chat message list and loading indicator
 * @returns Message list JSX element
 */
export function CoPilotMessageList({
  chatHistory,
  isSending,
}: CoPilotMessageListProps): React.ReactElement {
  const scrollEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory.length, isSending]);

  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F9F8F6]"
      aria-live="polite"
    >
      {chatHistory.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${
            msg.role === 'user' ? 'items-end' : 'items-start'
          }`}
        >
          <div
            className={`max-w-[90%] rounded-xl px-3.5 py-2.5 text-xs space-y-1 ${
              msg.role === 'user'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200/90 text-slate-700'
            }`}
          >
            {msg.role === 'user' ? (
              <p>{msg.content}</p>
            ) : (
              renderFormattedContent(msg.content)
            )}
          </div>
        </div>
      ))}
      {isSending && (
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 w-fit">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Analyzing event blueprint...</span>
        </div>
      )}
      <div ref={scrollEndRef} />
    </div>
  );
}
