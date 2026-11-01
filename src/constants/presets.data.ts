/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BIRTHDAY_PRESET } from './presets.birthday';
import { COMMUNITY_PRESET } from './presets.community';
import { EventPresetBundle, WEDDING_PRESET } from './presets.wedding';
import {
  BudgetCategoryItem,
  EventPlanState,
  EventType,
  EventTypeLabel,
} from '../types/event.types';
import { calculateBudgetAllocation, formatCurrency } from '../utils/domain.utils';
import { resolveEventTypeLabel, roundToDollar } from '../utils/security.utils';

export type { EventPresetBundle };

export const EVENT_PRESETS: Readonly<Record<EventTypeLabel, EventPresetBundle>> = {
  Wedding: WEDDING_PRESET,
  Birthday: BIRTHDAY_PRESET,
  'Community Event': COMMUNITY_PRESET,
};

const INITIAL_VENUE_SPENT_RATIO = 0.95;
const INITIAL_CATERING_SPENT_RATIO = 0.50;

/**
 * @description Creates a clean initial `EventPlanState` seeded from the specified `EventType` preset.
 * @param {EventType} [eventType='Wedding'] - Selected event archetype
 * @returns {EventPlanState} Hydrated initial `EventPlanState`
 */
export function createInitialEventState(
  eventType: EventType = 'Wedding'
): EventPlanState {
  const canonical = resolveEventTypeLabel(eventType);
  const preset = EVENT_PRESETS[canonical];
  const allocated = calculateBudgetAllocation(preset.config.totalBudget, canonical);

  const budgetCategories: BudgetCategoryItem[] = allocated.map((item, idx) => {
    if (idx === 0) return { ...item, actualSpent: roundToDollar(item.estimatedCost * INITIAL_VENUE_SPENT_RATIO) };
    if (idx === 1) return { ...item, actualSpent: roundToDollar(item.estimatedCost * INITIAL_CATERING_SPENT_RATIO) };
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
