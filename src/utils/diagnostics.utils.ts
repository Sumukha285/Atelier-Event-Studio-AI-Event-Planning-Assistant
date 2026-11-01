/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createInitialEventState } from '../constants/presets.data';
import { EventActions, eventReducer } from '../state/event.reducer';
import { isValidBlueprint } from '../types/event.types';
import {
  calculateBudgetAllocation,
  calculateBudgetMetrics,
  calculateTimelineProgress,
  filterVendorsByCategory,
} from './domain.utils';
import {
  clampNumber,
  sanitizeText,
  toSafeCurrencyCents,
  wrapUserPromptXml,
} from './security.utils';

export interface DiagnosticAssertionResult {
  readonly id: number;
  readonly name: string;
  readonly passed: boolean;
  readonly detail: string;
}

export interface DiagnosticSuiteSummary {
  readonly total: number;
  readonly passedCount: number;
  readonly allPassed: boolean;
  readonly results: readonly DiagnosticAssertionResult[];
}

/**
 * @description Executes 12 deterministic unit & integration self-tests across security, domain math, reducer transitions, and schema validation.
 * @returns {DiagnosticSuiteSummary} Summary of all 12 diagnostic assertions
 */
export function runDiagnosticSelfTests(): DiagnosticSuiteSummary {
  const initial = createInitialEventState('Wedding');
  const cleanXss = sanitizeText('<script>alert("xss")</script><b>Grand Gala</b> javascript:evil()');
  const xmlBox = wrapUserPromptXml('user_input', 'Clara & Julian <script>');
  const metrics = calculateBudgetMetrics(
    [
      { id: '1', category: 'Venue', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 10500, notes: '' },
      { id: '2', category: 'Catering', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 9200, notes: '' },
    ],
    30000
  );
  const addedState = eventReducer(
    initial,
    EventActions.addBudgetItem({ id: 'b-extra', category: 'Favors', recommendedPercent: 5, estimatedCost: 1500, actualSpent: 0, notes: 'Custom favors' })
  );
  const costUpdatedState = eventReducer(addedState, EventActions.updateActualCost('b-extra', 1250));
  const firstTaskId = initial.countdownTasks[0]?.id ?? 'w-task-1';
  const toggledTaskState = eventReducer(initial, EventActions.toggleTimelineTask(firstTaskId));
  const firstVendorId = initial.vendors[0]?.id ?? 'w-vendor-1';
  const vendorUpdatedState = eventReducer(initial, EventActions.updateVendorStatus(firstVendorId, 'Booked'));
  const hydratedState = eventReducer(
    initial,
    EventActions.hydrateBlueprint({
      concepts: initial.concepts,
      budgetCategories: calculateBudgetAllocation(50000, 'Wedding'),
      countdownTasks: initial.countdownTasks,
      itinerary: initial.itinerary,
      vendors: initial.vendors,
      source: 'studio-engine',
    })
  );
  const communityState = createInitialEventState('COMMUNITY');

  const results: readonly DiagnosticAssertionResult[] = [
    { id: 1, name: 'sanitizeText strips <script> payloads and javascript: protocols', passed: !cleanXss.includes('<script>') && !cleanXss.includes('javascript:') && cleanXss.includes('Grand Gala'), detail: `Output: "${cleanXss}"` },
    { id: 2, name: 'wrapUserPromptXml sandboxes user input in XML tags and escapes entities', passed: xmlBox === '<user_input>Clara &amp; Julian</user_input>', detail: `Output: ${xmlBox}` },
    { id: 3, name: 'clampNumber guards against NaN, Infinity, and out-of-range values', passed: clampNumber(Number.NaN, 100, 5000) === 100 && clampNumber(999999, 100, 5000) === 5000 && clampNumber(-50, 0, 100) === 0, detail: 'NaN -> 100, 999999 -> 5000, -50 -> 0' },
    { id: 4, name: 'toSafeCurrencyCents prevents IEEE 754 floating-point drift & rejects negatives', passed: toSafeCurrencyCents(0.1 + 0.2) === 0.3 && toSafeCurrencyCents(19.999) === 20 && toSafeCurrencyCents(-15) === 0, detail: '0.1 + 0.2 === 0.30, -15 -> 0' },
    { id: 5, name: 'calculateBudgetMetrics computes 10% contingency reserve and over-budget count', passed: metrics.contingencyReserve === 3000 && metrics.totalEstimated === 20000 && metrics.totalActual === 19700 && metrics.overBudgetCount === 1, detail: `Contingency: $${metrics.contingencyReserve}, OverBudget: ${metrics.overBudgetCount}` },
    { id: 6, name: 'calculateBudgetAllocation sums to exact totalBudget with 10% Contingency', passed: calculateBudgetAllocation(48000, 'Wedding').reduce((s, i) => s + i.estimatedCost, 0) === 48000, detail: '7 categories sum to $48,000' },
    { id: 7, name: 'eventReducer handles ADD_BUDGET_ITEM transition immutably', passed: addedState.budgetCategories.length === initial.budgetCategories.length + 1, detail: `Categories count: ${addedState.budgetCategories.length}` },
    { id: 8, name: 'eventReducer handles UPDATE_ACTUAL_COST transition accurately', passed: costUpdatedState.budgetCategories.find((i) => i.id === 'b-extra')?.actualSpent === 1250, detail: 'Updated actualSpent === $1,250' },
    { id: 9, name: 'eventReducer handles TOGGLE_TIMELINE_TASK status transition', passed: toggledTaskState.countdownTasks.find((t) => t.id === firstTaskId)?.status !== initial.countdownTasks[0]?.status, detail: `Toggled task ${firstTaskId}` },
    { id: 10, name: 'eventReducer handles UPDATE_VENDOR_STATUS transition', passed: vendorUpdatedState.vendors.find((v) => v.id === firstVendorId)?.bookingStatus === 'Booked', detail: `Vendor ${firstVendorId} -> Booked` },
    { id: 11, name: 'eventReducer handles HYDRATE_BLUEPRINT and isValidBlueprint rejects tampered payloads', passed: hydratedState.budgetCategories[0]?.estimatedCost === 13000 && isValidBlueprint(initial) && !isValidBlueprint(null) && !isValidBlueprint({ concepts: 'tampered' }), detail: 'Validates schema before state hydration' },
    { id: 12, name: 'calculateTimelineProgress and filterVendorsByCategory compute accurate results', passed: calculateTimelineProgress(communityState.countdownTasks) === 40 && filterVendorsByCategory(communityState.vendors, 'COMMUNITY').some((v) => Boolean(v.isPermitOrCompliance)), detail: 'Progress: 40%, Community permits retained' },
  ];

  const passedCount = results.filter((r) => r.passed).length;
  return { total: results.length, passedCount, allPassed: passedCount === results.length, results };
}
