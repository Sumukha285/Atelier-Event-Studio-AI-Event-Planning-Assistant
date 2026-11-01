/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialEventState } from '../data/presets';
import { EventActions, eventReducer } from '../state/event.reducer';
import { isValidBlueprint } from '../types/event.types';
import { runDiagnosticSelfTests } from '../utils/diagnostics.utils';
import {
  calculateBudgetAllocation,
  calculateBudgetMetrics,
  calculateTimelineProgress,
  filterVendorsByCategory,
} from '../utils/domain.utils';
import {
  clampNumber,
  sanitizeText,
  toSafeCurrencyCents,
  wrapUserPromptXml,
} from '../utils/security.utils';

test('1. sanitizeText strips XSS script tags, HTML elements, and dangerous protocols', () => {
  const dirty = '<script>alert("xss")</script><b>Atelier Gala</b> javascript:evil()';
  const clean = sanitizeText(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clean.includes('Atelier Gala'), true);
});

test('2. wrapUserPromptXml sandboxes user input inside XML tags and escapes entities', () => {
  const xml = wrapUserPromptXml('user_input', 'Clara & Julian <script>');
  assert.equal(xml, '<user_input>Clara &amp; Julian</user_input>');
});

test('3. clampNumber guards against NaN, Infinity, and out-of-bounds numbers', () => {
  assert.equal(clampNumber(Number.NaN, 100, 10000), 100);
  assert.equal(clampNumber(Number.POSITIVE_INFINITY, 100, 10000), 100);
  assert.equal(clampNumber(-250, 0, 10000), 0);
  assert.equal(clampNumber(999999, 100, 10000), 10000);
});

test('4. toSafeCurrencyCents prevents IEEE 754 floating-point drift and negative values', () => {
  assert.equal(toSafeCurrencyCents(0.1 + 0.2), 0.3);
  assert.equal(toSafeCurrencyCents(19.999), 20);
  assert.equal(toSafeCurrencyCents(-50), 0);
});

test('5. calculateBudgetMetrics computes 10% contingency reserve, variance, and over-budget count', () => {
  const items = [
    { id: '1', category: 'Venue', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 10500, notes: '' },
    { id: '2', category: 'Catering', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 9200, notes: '' },
  ];
  const summary = calculateBudgetMetrics(items, 30000);
  assert.equal(summary.contingencyReserve, 3000);
  assert.equal(summary.totalEstimated, 20000);
  assert.equal(summary.totalActual, 19700);
  assert.equal(summary.varianceEstimatedVsActual, 300);
  assert.equal(summary.overBudgetCount, 1);
  assert.equal(summary.nearLimitCount, 1);
});

test('6. calculateBudgetAllocation distributes totalBudget across all 7 categories summing to exact total', () => {
  const allocated = calculateBudgetAllocation(48000, 'WEDDING');
  const sum = allocated.reduce((acc, item) => acc + item.estimatedCost, 0);
  assert.equal(sum, 48000);
  const contingency = allocated.find((i) => i.category === 'Contingency');
  assert.equal(contingency?.recommendedPercent, 10);
});

test('7. eventReducer handles ADD_BUDGET_ITEM and UPDATE_ACTUAL_COST actions deterministically', () => {
  const initial = createInitialEventState('WEDDING');
  const withAdded = eventReducer(
    initial,
    EventActions.addBudgetItem({
      id: 'custom-1',
      category: 'Stationery',
      recommendedPercent: 4,
      estimatedCost: 1200,
      actualSpent: 0,
      notes: 'Letterpress',
    })
  );
  assert.equal(withAdded.budgetCategories.length, initial.budgetCategories.length + 1);
  const withActual = eventReducer(withAdded, EventActions.updateActualCost('custom-1', 1150));
  assert.equal(withActual.budgetCategories.find((c) => c.id === 'custom-1')?.actualSpent, 1150);
});

test('8. eventReducer handles TOGGLE_TIMELINE_TASK and UPDATE_VENDOR_STATUS actions', () => {
  const initial = createInitialEventState('BIRTHDAY');
  const firstTask = initial.countdownTasks[0];
  assert.ok(firstTask);
  const toggled = eventReducer(initial, EventActions.toggleTimelineTask(firstTask.id));
  assert.notEqual(toggled.countdownTasks[0]?.status, firstTask.status);

  const firstVendor = initial.vendors[0];
  assert.ok(firstVendor);
  const updatedVendor = eventReducer(initial, EventActions.updateVendorStatus(firstVendor.id, 'Booked'));
  assert.equal(updatedVendor.vendors[0]?.bookingStatus, 'Booked');
});

test('9. eventReducer handles HYDRATE_BLUEPRINT and isValidBlueprint rejects malformed payloads', () => {
  const initial = createInitialEventState('COMMUNITY');
  assert.equal(isValidBlueprint(initial), true);
  assert.equal(isValidBlueprint(null), false);
  assert.equal(isValidBlueprint({ concepts: 'invalid' }), false);

  const nextBlueprint = {
    concepts: initial.concepts,
    budgetCategories: calculateBudgetAllocation(60000, 'COMMUNITY'),
    countdownTasks: initial.countdownTasks,
    itinerary: initial.itinerary,
    vendors: initial.vendors,
    source: 'studio-engine' as const,
  };
  const hydrated = eventReducer(initial, EventActions.hydrateBlueprint(nextBlueprint));
  assert.equal(hydrated.budgetCategories[0]?.estimatedCost, 10800);
});

test('10. calculateTimelineProgress and filterVendorsByCategory operate accurately', () => {
  const state = createInitialEventState('COMMUNITY');
  const progress = calculateTimelineProgress(state.countdownTasks);
  assert.equal(progress, 40);
  const communityVendors = filterVendorsByCategory(state.vendors, 'COMMUNITY');
  assert.equal(communityVendors.some((v) => Boolean(v.isPermitOrCompliance)), true);
});

test('11. runDiagnosticSelfTests passes all 12 in-app self-test assertions (12/12)', () => {
  const summary = runDiagnosticSelfTests();
  assert.equal(summary.total, 12);
  assert.equal(summary.passedCount, 12);
  assert.equal(summary.allPassed, true);
});
