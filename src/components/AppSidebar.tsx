/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import {
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileDown,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { ActiveView } from '../types/event.types';

export interface NavItemDescriptor {
  readonly id: ActiveView;
  readonly label: string;
  readonly subtitle: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badgeText: string;
}

export interface AppSidebarProps {
  readonly activeView: ActiveView;
  readonly isCollapsed: boolean;
  readonly onSelectView: (view: ActiveView) => void;
  readonly onToggleCollapse: () => void;
  readonly onOpenCoPilot: () => void;
  readonly onOpenExport: () => void;
  readonly conceptsCount: number;
  readonly budgetAllocatedPercent: number;
  readonly timelineCompletedLabel: string;
  readonly vendorsCount: number;
}

/**
 * @description Renders the collapsible left navigation sidebar with zero inline arrow functions in loops.
 * @param {AppSidebarProps} props - Navigation state, counts, and view toggle callbacks
 * @returns {React.ReactElement} Memoized Sidebar JSX element
 */
export const AppSidebar = React.memo(function AppSidebar({
  activeView,
  isCollapsed,
  onSelectView,
  onToggleCollapse,
  onOpenCoPilot,
  onOpenExport,
  conceptsCount,
  budgetAllocatedPercent,
  timelineCompletedLabel,
  vendorsCount,
}: AppSidebarProps): React.ReactElement {
  const navItems: readonly NavItemDescriptor[] = [
    { id: 'setup', label: 'Setup & AI Ideation', subtitle: 'Parameters & 3 Concepts', icon: Compass, badgeText: `${conceptsCount}` },
    { id: 'budget', label: 'Smart Budget Allocator', subtitle: 'Estimated vs. Actual', icon: Wallet, badgeText: `${budgetAllocatedPercent}%` },
    { id: 'timeline', label: 'Timeline & Run-of-Show', subtitle: 'Countdown & Day-Of', icon: CalendarClock, badgeText: timelineCompletedLabel },
    { id: 'vendors', label: 'Vendor & Logistics', subtitle: 'Directory & Red Flags', icon: ClipboardCheck, badgeText: `${vendorsCount}` },
  ];

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLButtonElement>): void => {
    const view = e.currentTarget.dataset.view as ActiveView | undefined;
    if (view) onSelectView(view);
  }, [onSelectView]);

  return (
    <aside
      aria-label="Primary Workspace Navigation"
      data-testid="app-sidebar"
      className={`no-print bg-[#F2F0EC] border-r border-slate-200/90 flex flex-col justify-between transition-all duration-200 shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      } hidden md:flex`}
    >
      <div>
        <div className="h-16 px-4 border-b border-slate-200/80 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-md bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="truncate">
                <span className="text-xs font-semibold tracking-tight text-slate-900 block leading-none">Atelier Studio</span>
                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-wider">Event Architect</span>
              </div>
            </div>
          )}
          <button
            type="button"
            data-testid="sidebar-collapse-btn"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer mx-auto md:mx-0"
          >
            {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        <nav className="p-2.5 space-y-1" aria-label="Section Quick Links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-view={item.id}
                data-testid={`nav-btn-${item.id}`}
                onClick={handleNavClick}
                title={isCollapsed ? item.label : undefined}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-amber-400' : 'text-slate-600'}`} />
                  {!isCollapsed && (
                    <div className="truncate">
                      <span className="text-xs font-medium block truncate">{item.label}</span>
                      <span className={`text-[10px] block truncate ${active ? 'text-slate-300' : 'text-slate-600'}`}>{item.subtitle}</span>
                    </div>
                  )}
                </div>
                {!isCollapsed && (
                  <span className={`text-[10px] font-mono tabular-nums shrink-0 ${active ? 'text-slate-300' : 'text-slate-600'}`}>{item.badgeText}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-200/80 space-y-2">
        <button type="button" data-testid="sidebar-copilot-btn" onClick={onOpenCoPilot} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white border border-slate-300 text-slate-900 text-xs font-medium hover:bg-slate-50 cursor-pointer">
          <MessageSquareText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          {!isCollapsed && <span>Ask Event Co-Pilot</span>}
        </button>
        <button type="button" data-testid="sidebar-export-btn" onClick={onOpenExport} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-200/70 text-slate-800 text-xs font-medium hover:bg-slate-200 cursor-pointer">
          <FileDown className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Export Plan (.MD / PDF)</span>}
        </button>
      </div>
    </aside>
  );
});
