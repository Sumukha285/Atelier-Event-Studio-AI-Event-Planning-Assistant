/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UseEventPlannerResult } from '../hooks/useEventPlanner';
import { BudgetSection } from './BudgetSection';
import { IdeationSection } from './IdeationSection';
import { TimelineSection } from './TimelineSection';
import { VendorSection } from './VendorSection';

export interface ActiveTabViewProps {
  readonly planner: UseEventPlannerResult;
}

/**
 * @description Renders the active view inside the inner tabpanel container.
 * @param {ActiveTabViewProps} props - Planner state and action dispatchers
 * @returns {React.ReactElement} Active section component
 */
export const ActiveTabView = React.memo(function ActiveTabView({
  planner,
}: ActiveTabViewProps): React.ReactElement {
  if (planner.activeView === 'budget') {
    return (
      <BudgetSection
        config={planner.state.config}
        categories={planner.state.budgetCategories}
        onUpdateCategories={planner.updateBudgetCategories}
        onUpdateTotalBudget={planner.updateTotalBudget}
        onAnnounce={planner.announceStatus}
      />
    );
  }
  if (planner.activeView === 'timeline') {
    return (
      <TimelineSection
        config={planner.state.config}
        countdownTasks={planner.state.countdownTasks}
        itinerary={planner.state.itinerary}
        onUpdateCountdown={planner.updateCountdown}
        onUpdateItinerary={planner.updateItinerary}
        onAnnounce={planner.announceStatus}
      />
    );
  }
  if (planner.activeView === 'vendors') {
    return (
      <VendorSection
        config={planner.state.config}
        vendors={planner.state.vendors}
        onUpdateVendors={planner.updateVendors}
        onAnnounce={planner.announceStatus}
      />
    );
  }
  return (
    <IdeationSection
      config={planner.state.config}
      concepts={planner.state.concepts}
      selectedConceptId={planner.state.selectedConceptId}
      onUpdateConfig={planner.updateConfig}
      onSwitchEventTypePreset={planner.switchPreset}
      onSelectConcept={planner.selectConcept}
      onUpdateConcepts={planner.updateConcepts}
      onApplyCompleteBlueprint={planner.applyBlueprint}
      onAnnounce={planner.announceStatus}
    />
  );
});
