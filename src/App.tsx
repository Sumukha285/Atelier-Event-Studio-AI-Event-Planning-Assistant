/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { ActiveTabView } from './components/ActiveTabView';
import { AppHeaderBar } from './components/AppHeaderBar';
import { AppSidebar } from './components/AppSidebar';
import { CoPilotDrawer } from './components/CoPilotDrawer';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExportModal } from './components/ExportModal';
import { useEventPlanner } from './hooks/useEventPlanner';

const SKIP_LINK_CLASS = [
  'sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2',
  'focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900',
  'focus:text-white focus:rounded-lg focus:text-xs',
].join(' ');

/**
 * @description Root application component orchestrating the 4 planning views.
 * @returns {React.ReactElement} Atelier Event Studio application JSX element
 */
export default function App(): React.ReactElement {
  const planner = useEventPlanner();
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const openDiagnostics = useCallback((): void => setDiagnosticsOpen(true), []);
  const closeDiagnostics = useCallback((): void => setDiagnosticsOpen(false), []);
  const doneLabel = `${planner.timelineStats.completedCount}/${planner.timelineStats.totalTasks}`;

  return (
    <ErrorBoundary onResetState={planner.resetCurrentPreset}>
      <div
        data-testid="app-root"
        className="min-h-screen bg-[#F9F8F6] text-slate-900 flex flex-col md:flex-row"
      >
        <a href="#main-content" data-testid="skip-link" className={SKIP_LINK_CLASS}>
          Skip to main content
        </a>
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-testid="live-status"
          className="sr-only"
        >
          {planner.liveAnnouncement}
        </div>
        <AppSidebar
          activeView={planner.activeView}
          isCollapsed={planner.sidebarCollapsed}
          onSelectView={planner.setActiveView}
          onToggleCollapse={planner.toggleSidebar}
          onOpenCoPilot={planner.openCoPilot}
          onOpenExport={planner.openExportModal}
          conceptsCount={planner.state.concepts.length}
          budgetAllocatedPercent={planner.budgetSummary.estimatedPercentOfTotal}
          timelineCompletedLabel={doneLabel}
          vendorsCount={planner.state.vendors.length}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeaderBar
            config={planner.state.config}
            budgetSummary={planner.budgetSummary}
            activeConcept={planner.activeConcept}
            activeView={planner.activeView}
            onSelectView={planner.setActiveView}
            onResetPreset={planner.resetCurrentPreset}
            onOpenExport={planner.openExportModal}
            onOpenCoPilot={planner.openCoPilot}
            onOpenDiagnostics={openDiagnostics}
          />
          <main
            id="main-content"
            data-testid="main-content"
            className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto"
          >
            <div
              role="tabpanel"
              id={`panel-${planner.activeView}`}
              aria-labelledby={`tab-${planner.activeView}`}
              data-testid={`panel-${planner.activeView}`}
              tabIndex={0}
              className="focus:outline-none"
            >
              <ActiveTabView planner={planner} />
            </div>
          </main>
        </div>
        <CoPilotDrawer
          isOpen={planner.coPilotOpen}
          onClose={planner.closeCoPilot}
          eventState={planner.state}
          onAppendMessage={planner.appendChatMessage}
        />
        <ExportModal
          isOpen={planner.exportModalOpen}
          onClose={planner.closeExportModal}
          state={planner.state}
        />
        <DiagnosticsModal isOpen={diagnosticsOpen} onClose={closeDiagnostics} />
      </div>
    </ErrorBoundary>
  );
}
