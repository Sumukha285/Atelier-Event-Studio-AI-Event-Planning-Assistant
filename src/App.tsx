/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { AppHeaderBar } from './components/AppHeaderBar';
import { AppSidebar } from './components/AppSidebar';
import { BudgetSection } from './components/BudgetSection';
import { CoPilotDrawer } from './components/CoPilotDrawer';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExportModal } from './components/ExportModal';
import { IdeationSection } from './components/IdeationSection';
import { TimelineSection } from './components/TimelineSection';
import { VendorSection } from './components/VendorSection';
import { useEventPlanner } from './hooks/useEventPlanner';

/**
 * @description Root application component orchestrating the 4 event planning views, `useEventPlanner` hook, and `ErrorBoundary` recovery.
 * @returns {React.ReactElement} Atelier Event Studio application JSX element
 */
export default function App(): React.ReactElement {
  const planner = useEventPlanner();
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const handleOpenDiagnostics = useCallback(() => setDiagnosticsOpen(true), []);
  const handleCloseDiagnostics = useCallback(() => setDiagnosticsOpen(false), []);

  return (
    <ErrorBoundary onResetState={planner.resetCurrentPreset}>
      <div className="min-h-screen bg-[#F9F8F6] text-slate-900 flex flex-col md:flex-row">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-900 focus:text-white focus:rounded-lg focus:text-xs">
          Skip to main content
        </a>
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">{planner.liveAnnouncement}</div>
        <AppSidebar
          activeView={planner.activeView}
          isCollapsed={planner.sidebarCollapsed}
          onSelectView={planner.setActiveView}
          onToggleCollapse={planner.toggleSidebar}
          onOpenCoPilot={planner.openCoPilot}
          onOpenExport={planner.openExportModal}
          conceptsCount={planner.state.concepts.length}
          budgetAllocatedPercent={planner.budgetSummary.estimatedPercentOfTotal}
          timelineCompletedLabel={`${planner.timelineStats.completedCount}/${planner.timelineStats.totalTasks}`}
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
            onOpenDiagnostics={handleOpenDiagnostics}
          />
          <main id="main-content" role="tabpanel" tabIndex={0} aria-labelledby={`tab-${planner.activeView}`} className="flex-1 p-4 lg:p-8 max-w-[1440px] w-full mx-auto focus:outline-none">
            {planner.activeView === 'setup' && (
              <IdeationSection config={planner.state.config} concepts={planner.state.concepts} selectedConceptId={planner.state.selectedConceptId} onUpdateConfig={planner.updateConfig} onSwitchEventTypePreset={planner.switchPreset} onSelectConcept={planner.selectConcept} onUpdateConcepts={planner.updateConcepts} onApplyCompleteBlueprint={planner.applyBlueprint} onAnnounce={planner.announceStatus} />
            )}
            {planner.activeView === 'budget' && (
              <BudgetSection config={planner.state.config} categories={planner.state.budgetCategories} onUpdateCategories={planner.updateBudgetCategories} onUpdateTotalBudget={planner.updateTotalBudget} onAnnounce={planner.announceStatus} />
            )}
            {planner.activeView === 'timeline' && (
              <TimelineSection config={planner.state.config} countdownTasks={planner.state.countdownTasks} itinerary={planner.state.itinerary} onUpdateCountdown={planner.updateCountdown} onUpdateItinerary={planner.updateItinerary} onAnnounce={planner.announceStatus} />
            )}
            {planner.activeView === 'vendors' && (
              <VendorSection config={planner.state.config} vendors={planner.state.vendors} onUpdateVendors={planner.updateVendors} onAnnounce={planner.announceStatus} />
            )}
          </main>
        </div>
        <CoPilotDrawer isOpen={planner.coPilotOpen} onClose={planner.closeCoPilot} eventState={planner.state} onAppendMessage={planner.appendChatMessage} />
        <ExportModal isOpen={planner.exportModalOpen} onClose={planner.closeExportModal} state={planner.state} />
        <DiagnosticsModal isOpen={diagnosticsOpen} onClose={handleCloseDiagnostics} />
      </div>
    </ErrorBoundary>
  );
}
