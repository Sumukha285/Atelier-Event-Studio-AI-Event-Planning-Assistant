/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calendar,
  CalendarClock,
  ClipboardCheck,
  Compass,
  FileDown,
  MapPin,
  MessageSquareText,
  RotateCcw,
  Users,
  Wallet,
} from 'lucide-react';
import {
  ActiveView,
  BudgetSummary,
  ConceptPackage,
  EventConfig,
} from '../types/event.types';
import { formatCurrency } from '../utils/eventLogic';

export interface AppHeaderBarProps {
  readonly config: EventConfig;
  readonly budgetSummary: BudgetSummary;
  readonly activeConcept?: ConceptPackage;
  readonly activeView: ActiveView;
  readonly onSelectView: (view: ActiveView) => void;
  readonly onResetPreset: () => void;
  readonly onOpenExport: () => void;
  readonly onOpenCoPilot: () => void;
}

const MOBILE_TABS: ReadonlyArray<{
  readonly id: ActiveView;
  readonly label: string;
  readonly icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'setup', label: 'Setup & AI', icon: Compass },
  { id: 'budget', label: 'Budget', icon: Wallet },
  { id: 'timeline', label: 'Timeline', icon: CalendarClock },
  { id: 'vendors', label: 'Vendors', icon: ClipboardCheck },
];

/**
 * Renders the sticky top workspace header bar with event metadata, budget telemetry, and mobile tab navigation.
 *
 * @param props - Event config, budget summary, active concept, and header callbacks
 * @returns Header bar JSX element
 */
export function AppHeaderBar({
  config,
  budgetSummary,
  activeConcept,
  activeView,
  onSelectView,
  onResetPreset,
  onOpenExport,
  onOpenCoPilot,
}: AppHeaderBarProps): React.ReactElement {
  return (
    <header className="no-print bg-white border-b border-slate-200/90 px-4 lg:px-8 py-3.5 sticky top-0 z-30">
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-mono uppercase tracking-wider font-semibold text-slate-900">
              {config.eventType}
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {config.date}
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 truncate max-w-[260px]">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {config.location}
            </span>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1 font-mono tabular-nums">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              {config.guestCount} guests
            </span>
          </div>
          <div className="flex flex-wrap items-baseline gap-3 mt-0.5">
            <h1 className="text-lg font-semibold text-slate-900 tracking-tight truncate">
              {config.eventName}
            </h1>
            {activeConcept && (
              <span className="text-xs text-slate-600 truncate">
                Active Concept:{' '}
                <strong className="text-slate-800 font-medium">
                  {activeConcept.title}
                </strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-mono">
                Total Budget
              </span>
              <span
                data-testid="header-total-budget"
                className="font-mono font-semibold text-slate-900 tabular-nums"
              >
                {formatCurrency(config.totalBudget, config.currency)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-mono">
                Actual Spent
              </span>
              <span
                data-testid="header-actual-spent"
                className="font-mono font-semibold text-emerald-700 tabular-nums"
              >
                {formatCurrency(budgetSummary.totalActual, config.currency)}
              </span>
            </div>
          </div>

          <button
            type="button"
            data-testid="reset-preset-btn"
            onClick={onResetPreset}
            title="Reset current archetype to default preset"
            className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset Preset</span>
          </button>

          <button
            type="button"
            data-testid="header-export-btn"
            onClick={onOpenExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 text-xs font-medium cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Plan</span>
          </button>

          <button
            type="button"
            data-testid="header-copilot-btn"
            onClick={onOpenCoPilot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-medium cursor-pointer"
          >
            <MessageSquareText className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask Event Co-Pilot</span>
          </button>
        </div>
      </div>

      <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-slate-100">
        {MOBILE_TABS.map((item) => {
          const Icon = item.icon;
          const active = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                active
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
