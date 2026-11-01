/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BIRTHDAY_PRESET } from '../constants/presets.birthday';
import { COMMUNITY_PRESET } from '../constants/presets.community';
import { EventPresetBundle, WEDDING_PRESET } from '../constants/presets.wedding';
import {
  BudgetCategoryItem,
  EventPlanState,
  EventType,
} from '../types/event.types';
import { calculateBudgetAllocation, formatCurrency } from '../utils/eventLogic';

export const EVENT_PRESETS: Readonly<Record<EventType, EventPresetBundle>> = {
  Wedding: WEDDING_PRESET,
  Birthday: BIRTHDAY_PRESET,
  'Community Event': COMMUNITY_PRESET,
};

/**
 * Creates a clean initial `EventPlanState` seeded from the specified `EventType` preset.
 *
 * @param eventType - Selected event archetype ('Wedding', 'Birthday', or 'Community Event')
 * @returns Hydrated initial `EventPlanState`
 */
export function createInitialEventState(
  eventType: EventType = 'Wedding'
): EventPlanState {
  const preset = EVENT_PRESETS[eventType] ?? EVENT_PRESETS.Wedding;
  const allocated = calculateBudgetAllocation(
    preset.config.totalBudget,
    eventType
  );

  const budgetCategories: BudgetCategoryItem[] = allocated.map((item, idx) => {
    if (idx === 0) {
      return { ...item, actualSpent: Math.round(item.estimatedCost * 0.95) };
    }
    if (idx === 1) {
      return { ...item, actualSpent: Math.round(item.estimatedCost * 0.5) };
    }
    return item;
  });

  return {
    config: { ...preset.config },
    concepts: preset.concepts.map((c) => ({ ...c })),
    selectedConceptId: preset.concepts[0]?.id ?? null,
    budgetCategories,
    countdownTasks: preset.countdownTasks.map((t) => ({ ...t })),
    itinerary: preset.itinerary.map((i) => ({ ...i })),
    vendors: preset.vendors.map((v) => ({ ...v })),
    chatHistory: [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `Welcome to Atelier Event Studio. I have full context of **${preset.config.eventName}** (${preset.config.guestCount} guests · ${formatCurrency(preset.config.totalBudget, preset.config.currency)} budget in ${preset.config.location}). Ask me to optimize your budget, resolve timeline bottlenecks, or draft a vendor inquiry email.`,
        timestamp: new Date().toISOString(),
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}
