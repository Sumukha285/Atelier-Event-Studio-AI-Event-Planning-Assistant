/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  PieChart,
  CalendarClock,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Download,
  MessageSquare,
  RotateCcw,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  BudgetCategoryItem,
  ChatMessage,
  CompleteBlueprintResponse,
  ConceptPackage,
  CountdownTask,
  EventConfig,
  EventPlanState,
  EventType,
  ItineraryItem,
  VendorItem,
} from './types/event';
import { createInitialEventState } from './data/presets';
import {
  calculateBudgetAllocation,
  computeBudgetSummary,
  computeTimelineProgress,
  formatCurrency,
  validateAndHydrateState,
} from './utils/eventLogic';
import { EventSetupHub } from './components/EventSetupHub';
import { SmartBudgetAllocator } from './components/SmartBudgetAllocator';
import { TimelineRunOfShow } from './components/TimelineRunOfShow';
import { VendorChecklist } from './components/VendorChecklist';
import { CoPilotDrawer } from './components/CoPilotDrawer';
import { ExportModal } from './components/ExportModal';

type ActiveView = 'setup' | 'budget' | 'timeline' | 'vendors';

const STORAGE_KEY = 'atelier_event_studio_state_v1';

interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error';
  retryFn?: () => void;
}

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('setup');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [coPilotOpen, setCoPilotOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  const [state, setState] = useState<EventPlanState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hydrated = validateAndHydrateState(parsed);
        if (hydrated) {
          return hydrated;
        }
      }
    } catch {
      // Corrupted JSON safely ignored
    }
    return createInitialEventState('Wedding');
  });

  // Debounced safe persistence to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore quota errors
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [state]);

  const handleNotify = useCallback(
    (message: string, type: 'success' | 'error' = 'success', retryFn?: () => void) => {
      const id = `toast-${Date.now()}`;
      setToast({ id, message, type, retryFn });
    },
    []
  );

  useEffect(() => {
    if (!toast || toast.type === 'error') return;
    const t = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleUpdateConfig = useCallback((updatedConfig: EventConfig) => {
    setState((prev) => {
      const budgetChanged = updatedConfig.totalBudget !== prev.config.totalBudget;
      const nextBudgetCategories = budgetChanged
        ? calculateBudgetAllocation(
            updatedConfig.totalBudget,
            updatedConfig.eventType,
            prev.budgetCategories
          )
        : prev.budgetCategories;
      return {
        ...prev,
        config: updatedConfig,
        budgetCategories: nextBudgetCategories,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const handleSwitchPreset = useCallback((eventType: EventType) => {
    const fresh = createInitialEventState(eventType);
    setState(fresh);
  }, []);

  const handleSelectConcept = useCallback((concept: ConceptPackage) => {
    setState((prev) => ({
      ...prev,
      selectedConceptId: concept.id,
      config: {
        ...prev.config,
        themeVibe: `${concept.title} — ${concept.tagline}`,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleUpdateConcepts = useCallback((concepts: ConceptPackage[]) => {
    setState((prev) => ({
      ...prev,
      concepts,
      selectedConceptId: concepts[0]?.id || prev.selectedConceptId,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleApplyCompleteBlueprint = useCallback(
    (blueprint: CompleteBlueprintResponse) => {
      setState((prev) => ({
        ...prev,
        concepts: blueprint.concepts,
        selectedConceptId: blueprint.concepts[0]?.id || prev.selectedConceptId,
        budgetCategories: blueprint.budgetCategories,
        countdownTasks: blueprint.countdownTasks,
        itinerary: blueprint.itinerary,
        vendors: blueprint.vendors,
        lastUpdated: new Date().toISOString(),
      }));
    },
    []
  );

  const handleUpdateBudgetCategories = useCallback(
    (budgetCategories: BudgetCategoryItem[]) => {
      setState((prev) => ({
        ...prev,
        budgetCategories,
        lastUpdated: new Date().toISOString(),
      }));
    },
    []
  );

  const handleUpdateTotalBudget = useCallback((newBudget: number) => {
    setState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        totalBudget: newBudget,
      },
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleUpdateCountdown = useCallback((countdownTasks: CountdownTask[]) => {
    setState((prev) => ({
      ...prev,
      countdownTasks,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleUpdateItinerary = useCallback((itinerary: ItineraryItem[]) => {
    setState((prev) => ({
      ...prev,
      itinerary,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleUpdateVendors = useCallback((vendors: VendorItem[]) => {
    setState((prev) => ({
      ...prev,
      vendors,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const handleAppendChatMessage = useCallback((msg: ChatMessage) => {
    setState((prev) => ({
      ...prev,
      chatHistory: [...prev.chatHistory, msg],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const currency = state.config.currency || 'USD';

  const budgetSummary = useMemo(
    () => computeBudgetSummary(state.budgetCategories, state.config.totalBudget),
    [state.budgetCategories, state.config.totalBudget]
  );

  const timelineStats = useMemo(
    () => computeTimelineProgress(state.countdownTasks, state.itinerary),
    [state.countdownTasks, state.itinerary]
  );

  const navItems: {
    id: ActiveView;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    meta: string;
  }[] = useMemo(
    () => [
      {
        id: 'setup',
        label: 'Event Setup & AI Ideation',
        shortLabel: 'Setup & Ideation',
        icon: Sparkles,
        meta: `${state.concepts.length} concepts`,
      },
      {
        id: 'budget',
        label: 'Smart Budget Allocator',
        shortLabel: 'Smart Budget',
        icon: PieChart,
        meta: formatCurrency(state.config.totalBudget, currency),
      },
      {
        id: 'timeline',
        label: 'Timeline & Run-of-Show',
        shortLabel: 'Timeline & Run',
        icon: CalendarClock,
        meta: `${timelineStats.completionPercent}% done`,
      },
      {
        id: 'vendors',
        label: 'Vendor & Logistics Checklist',
        shortLabel: 'Vendors & Vetting',
        icon: ClipboardCheck,
        meta: `${state.vendors.length} vendors`,
      },
    ],
    [
      state.concepts.length,
      state.config.totalBudget,
      currency,
      timelineStats.completionPercent,
      state.vendors.length,
    ]
  );

  const currentNav = navItems.find((n) => n.id === activeView) || navItems[0];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Collapsible Desktop Sidebar */}
      <aside
        aria-label="Primary Workspace Navigation"
        className={`hidden md:flex flex-col justify-between bg-white border-r border-slate-200 transition-all duration-150 shrink-0 no-print ${
          sidebarCollapsed ? 'w-18' : 'w-68'
        }`}
      >
        <div>
          {/* Brand Lockup & Collapse Toggle */}
          <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between gap-2">
            {!sidebarCollapsed && (
              <span className="font-display text-base font-bold tracking-tight text-slate-900 whitespace-nowrap truncate">
                Atelier Event Studio
              </span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((c) => !c)}
              aria-expanded={!sidebarCollapsed}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer mx-auto md:mx-0"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-4 h-4" />
              ) : (
                <PanelLeftClose className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Active Event Snapshot in Sidebar */}
          {!sidebarCollapsed && (
            <div className="px-4 py-4 border-b border-slate-200 bg-slate-50/60">
              <p className="text-[11px] font-medium text-slate-500">
                Active Event Plan · {state.config.eventType}
              </p>
              <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                {state.config.eventName}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] font-mono tabular-nums text-slate-600 mt-1.5">
                <span>{state.config.date}</span>
                <span aria-hidden="true">·</span>
                <span>{state.config.guestCount} guests</span>
              </div>
            </div>
          )}

          {/* 4 Main Interactive Views Navigation */}
          <nav className="p-3 space-y-1" aria-label="Main Views">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => setActiveView(item.id)}
                  title={item.label}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="truncate whitespace-nowrap">
                        {item.shortLabel}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <span
                      className={`text-[11px] font-mono tabular-nums shrink-0 ${
                        isActive ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {item.meta}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="p-3 border-t border-slate-200 space-y-2">
          {!sidebarCollapsed && (
            <div className="px-3 py-2 text-[11px] text-slate-500">
              <div className="flex items-center justify-between font-mono tabular-nums">
                <span>Allocated</span>
                <span className="text-slate-800 font-medium">
                  {formatCurrency(budgetSummary.totalEstimated, currency)}
                </span>
              </div>
              <div className="flex items-center justify-between font-mono tabular-nums mt-0.5">
                <span>Actual Spent</span>
                <span className="text-slate-800 font-medium">
                  {formatCurrency(budgetSummary.totalActual, currency)}
                </span>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              handleSwitchPreset(state.config.eventType);
              handleNotify(`Reset ${state.config.eventType} plan to default template.`, 'success');
            }}
            title="Reset current event preset to defaults"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            {!sidebarCollapsed && <span>Reset Default Plan</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex bg-slate-900/40 no-print"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="w-72 bg-white h-full p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-display text-base font-bold text-slate-900">
                  Atelier Event Studio
                </span>
                <button
                  type="button"
                  aria-label="Close mobile menu"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="mt-4 space-y-1" aria-label="Mobile Views">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveView(item.id);
                        setMobileNavOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium ${
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      <span className="font-mono tabular-nums text-[11px]">
                        {item.meta}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <button
              type="button"
              onClick={() => {
                handleSwitchPreset(state.config.eventType);
                setMobileNavOpen(false);
              }}
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg"
            >
              Reset Default Plan
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract: Breadcrumb & H1 on Left, Primary Actions on Right */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
              <span className="hidden sm:inline font-medium text-slate-700 whitespace-nowrap">
                {state.config.eventType}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                /
              </span>
              <h1 className="text-xs sm:text-sm font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-[320px]">
                {state.config.eventName}
              </h1>
              <span aria-hidden="true">·</span>
              <span className="text-slate-600 whitespace-nowrap hidden lg:inline">
                {currentNav.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Plan to Markdown/PDF</span>
            </button>

            <button
              type="button"
              aria-expanded={coPilotOpen}
              onClick={() => setCoPilotOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Event Co-Pilot</span>
            </button>
          </div>
        </header>

        {/* Non-Blocking ARIA Live Toast Region */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="fixed bottom-5 right-5 z-40 max-w-md no-print"
        >
          {toast && (
            <div
              role={toast.type === 'error' ? 'alert' : 'status'}
              className={`p-3.5 rounded-xl shadow-lg border flex items-center justify-between gap-3 text-xs ${
                toast.type === 'error'
                  ? 'bg-red-950 text-white border-red-800'
                  : 'bg-slate-900 text-white border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {toast.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span>{toast.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {toast.retryFn && (
                  <button
                    type="button"
                    onClick={() => {
                      const fn = toast.retryFn;
                      setToast(null);
                      if (fn) fn();
                    }}
                    className="px-2 py-1 text-[11px] font-semibold bg-white text-slate-900 rounded cursor-pointer"
                  >
                    Retry
                  </button>
                )}
                <button
                  type="button"
                  aria-label="Dismiss notification"
                  onClick={() => setToast(null)}
                  className="p-1 text-slate-300 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Workspace Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto no-print">
          {activeView === 'setup' && (
            <EventSetupHub
              config={state.config}
              concepts={state.concepts}
              selectedConceptId={state.selectedConceptId}
              onUpdateConfig={handleUpdateConfig}
              onSwitchPreset={handleSwitchPreset}
              onSelectConcept={handleSelectConcept}
              onUpdateConcepts={handleUpdateConcepts}
              onApplyCompleteBlueprint={handleApplyCompleteBlueprint}
              onNotify={handleNotify}
            />
          )}

          {activeView === 'budget' && (
            <SmartBudgetAllocator
              config={state.config}
              categories={state.budgetCategories}
              onUpdateCategories={handleUpdateBudgetCategories}
              onUpdateTotalBudget={handleUpdateTotalBudget}
              onNotify={handleNotify}
            />
          )}

          {activeView === 'timeline' && (
            <TimelineRunOfShow
              config={state.config}
              countdownTasks={state.countdownTasks}
              itinerary={state.itinerary}
              onUpdateCountdown={handleUpdateCountdown}
              onUpdateItinerary={handleUpdateItinerary}
              onNotify={handleNotify}
            />
          )}

          {activeView === 'vendors' && (
            <VendorChecklist
              config={state.config}
              vendors={state.vendors}
              onUpdateVendors={handleUpdateVendors}
              onNotify={handleNotify}
            />
          )}
        </main>

        {/* Clean Printable Master Plan View (Visible when printing / saving to PDF) */}
        <div className="hidden print-only p-8 space-y-6 text-slate-900">
          <div className="border-b border-slate-300 pb-4">
            <h1 className="text-2xl font-bold">
              {state.config.eventName} — Master Event Plan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {state.config.eventType} · {state.config.date} · {state.config.location} (
              {state.config.setting}) · {state.config.guestCount} Guests · Total Budget:{' '}
              {formatCurrency(state.config.totalBudget, currency)}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Smart Budget Summary</h2>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-300 p-2 text-left">Category</th>
                  <th className="border border-slate-300 p-2 text-right">Estimated</th>
                  <th className="border border-slate-300 p-2 text-right">Actual Spent</th>
                  <th className="border border-slate-300 p-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {state.budgetCategories.map((b) => (
                  <tr key={b.id}>
                    <td className="border border-slate-300 p-2 font-medium">{b.category}</td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {formatCurrency(b.estimatedCost, currency)}
                    </td>
                    <td className="border border-slate-300 p-2 text-right font-mono">
                      {formatCurrency(b.actualSpent, currency)}
                    </td>
                    <td className="border border-slate-300 p-2">{b.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Contextual Chat Assistant Drawer */}
      <CoPilotDrawer
        isOpen={coPilotOpen}
        onClose={() => setCoPilotOpen(false)}
        state={state}
        onAppendMessage={handleAppendChatMessage}
      />

      {/* Export Plan Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        state={state}
      />
    </div>
  );
}
