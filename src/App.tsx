/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { AppHeaderBar } from './components/AppHeaderBar';
import { AppSidebar } from './components/AppSidebar';
import { BudgetView } from './components/BudgetView';
import { CoPilotDrawer } from './components/CoPilotDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExportModal } from './components/ExportModal';
import { IdeationView } from './components/IdeationView';
import { TimelineView } from './components/TimelineView';
import { VendorView } from './components/VendorView';
import { DEBOUNCE_PERSIST_MS, STORAGE_KEY } from './constants/event.constants';
import { EventActions, eventReducer, initEventState } from './state/event.reducer';
import { ActiveView } from './types/event.types';
import {
  computeBudgetSummary,
  computeTimelineProgress,
} from './utils/eventLogic';

/**
 * Root application component orchestrating the 4 event planning views, state persistence, and ErrorBoundary recovery.
 *
 * @returns Atelier Event Studio application JSX element
 */
export default function App(): React.ReactElement {
  const [state, dispatch] = useReducer(eventReducer, undefined, initEventState);
  const [activeView, setActiveView] = useState<ActiveView>('setup');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [coPilotOpen, setCoPilotOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage quota warnings
      }
    }, DEBOUNCE_PERSIST_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const budgetSummary = useMemo(
    () => computeBudgetSummary(state.config.totalBudget, state.budgetCategories),
    [state.config.totalBudget, state.budgetCategories]
  );

  const timelineStats = useMemo(
    () => computeTimelineProgress(state.countdownTasks, state.itinerary),
    [state.countdownTasks, state.itinerary]
  );

  const activeConcept = useMemo(
    () =>
      state.concepts.find((c) => c.id === state.selectedConceptId) ??
      state.concepts[0],
    [state.concepts, state.selectedConceptId]
  );

  return (
    <ErrorBoundary
      onResetState={() =>
        dispatch(EventActions.switchPreset(state.config.eventType))
      }
    >
      <div className="min-h-screen bg-[#F9F8F6] text-slate-900 flex flex-col md:flex-row">
        <a
          href="#main-workspace"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:text-xs"
        >
          Skip to main workspace
        </a>

        <AppSidebar
          activeView={activeView}
          isCollapsed={sidebarCollapsed}
          onSelectView={setActiveView}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          onOpenCoPilot={() => setCoPilotOpen(true)}
          onOpenExport={() => setExportModalOpen(true)}
          conceptsCount={state.concepts.length}
          budgetAllocatedPercent={budgetSummary.estimatedPercentOfTotal}
          timelineCompletedLabel={`${timelineStats.completedCount}/${timelineStats.totalTasks}`}
          vendorsCount={state.vendors.length}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <AppHeaderBar
            config={state.config}
            budgetSummary={budgetSummary}
            activeConcept={activeConcept}
            activeView={activeView}
            onSelectView={setActiveView}
            onResetPreset={() =>
              dispatch(EventActions.switchPreset(state.config.eventType))
            }
            onOpenExport={() => setExportModalOpen(true)}
            onOpenCoPilot={() => setCoPilotOpen(true)}
          />

          <main
            id="main-workspace"
            className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto"
          >
            {activeView === 'setup' && (
              <IdeationView
                config={state.config}
                concepts={state.concepts}
                selectedConceptId={state.selectedConceptId}
                onUpdateConfig={(cfg) => dispatch(EventActions.updateConfig(cfg))}
                onSwitchEventTypePreset={(t) => dispatch(EventActions.switchPreset(t))}
                onSelectConcept={(c) => dispatch(EventActions.selectConcept(c))}
                onUpdateConcepts={(list) => dispatch(EventActions.updateConcepts(list))}
                onApplyCompleteBlueprint={(bp) => dispatch(EventActions.applyBlueprint(bp))}
              />
            )}
            {activeView === 'budget' && (
              <BudgetView
                config={state.config}
                categories={state.budgetCategories}
                onUpdateCategories={(cats) =>
                  dispatch(EventActions.updateBudgetCategories(cats))
                }
                onUpdateTotalBudget={(tot) =>
                  dispatch(EventActions.updateTotalBudget(tot))
                }
              />
            )}
            {activeView === 'timeline' && (
              <TimelineView
                config={state.config}
                countdownTasks={state.countdownTasks}
                itinerary={state.itinerary}
                onUpdateCountdown={(tasks) =>
                  dispatch(EventActions.updateCountdown(tasks))
                }
                onUpdateItinerary={(items) =>
                  dispatch(EventActions.updateItinerary(items))
                }
              />
            )}
            {activeView === 'vendors' && (
              <VendorView
                config={state.config}
                vendors={state.vendors}
                onUpdateVendors={(vendors) =>
                  dispatch(EventActions.updateVendors(vendors))
                }
              />
            )}
          </main>
        </div>

        <CoPilotDrawer
          isOpen={coPilotOpen}
          onClose={() => setCoPilotOpen(false)}
          eventState={state}
          onAppendMessage={(msg) => dispatch(EventActions.appendChatMessage(msg))}
        />

        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
          state={state}
        />
      </div>
    </ErrorBoundary>
  );
}
