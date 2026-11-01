/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialEventState } from '../data/presets';
import { EventActions, eventReducer } from '../state/event.reducer';
import {
  BUDGET_CATEGORIES,
  buildCompactPromptContext,
  calculateBudgetAllocation,
  clampNumber,
  classifyCategoryBudgetStatus,
  computeBudgetSummary,
  computeRequestHash,
  computeTimelineProgress,
  formatCurrency,
  generatePlanMarkdown,
  roundToCents,
  sanitizeEventConfig,
  sanitizeText,
  validateAndHydrateState,
  validateEventConfig,
  wrapXmlSandbox,
} from './eventLogic';

test('calculateBudgetAllocation distributes totalBudget across all 7 categories summing to exact total', () => {
  const weddingBudget = calculateBudgetAllocation(48000, 'Wedding');
  assert.equal(weddingBudget.length, BUDGET_CATEGORIES.length);
  const sumWedding = weddingBudget.reduce((acc, item) => acc + item.estimatedCost, 0);
  assert.equal(sumWedding, 48000);

  const oddBudget = calculateBudgetAllocation(13333, 'Birthday');
  const sumOdd = oddBudget.reduce((acc, item) => acc + item.estimatedCost, 0);
  assert.equal(sumOdd, 13333);
});

test('computeBudgetSummary calculates variance, unallocated, remaining, and over-budget counts accurately', () => {
  const categories = [
    { id: '1', category: 'Venue', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 10500, notes: '' },
    { id: '2', category: 'Catering', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 9200, notes: '' },
    { id: '3', category: 'Decor', recommendedPercent: 40, estimatedCost: 8000, actualSpent: 2000, notes: '' },
  ];
  const summary = computeBudgetSummary(30000, categories);
  assert.equal(summary.totalBudget, 30000);
  assert.equal(summary.totalEstimated, 28000);
  assert.equal(summary.totalActual, 21700);
  assert.equal(summary.unallocatedBudget, 2000);
  assert.equal(summary.remainingFromTotal, 8300);
  assert.equal(summary.varianceEstimatedVsActual, 6300);
  assert.equal(summary.overBudgetCount, 1);
  assert.equal(summary.nearLimitCount, 1);
});

test('classifyCategoryBudgetStatus returns expected health state', () => {
  assert.equal(classifyCategoryBudgetStatus(5000, 0), 'Unspent');
  assert.equal(classifyCategoryBudgetStatus(5000, 3000), 'Under Budget');
  assert.equal(classifyCategoryBudgetStatus(5000, 4600), 'Near Limit');
  assert.equal(classifyCategoryBudgetStatus(5000, 5200), 'Over Budget');
});

test('computeTimelineProgress tracks completion percentages for countdown tasks and itinerary', () => {
  const stats = computeTimelineProgress(
    [
      { id: '1', milestone: '6 Months Out', title: 'Task 1', category: 'Venue', status: 'Completed', assigneeOrNote: '' },
      { id: '2', milestone: '3 Months Out', title: 'Task 2', category: 'Decor', status: 'In Progress', assigneeOrNote: '' },
      { id: '3', milestone: '1 Month Out', title: 'Task 3', category: 'Catering', status: 'Pending', assigneeOrNote: '' },
      { id: '4', milestone: '1 Week Out', title: 'Task 4', category: 'Logistics', status: 'Completed', assigneeOrNote: '' },
    ],
    [
      { id: 'i1', timeSlot: '14:00', durationMinutes: 60, activity: 'Load in', locationZone: 'Main', leadOwner: 'Lead', status: 'Completed', notes: '' },
      { id: 'i2', timeSlot: '15:00', durationMinutes: 60, activity: 'Prep', locationZone: 'Main', leadOwner: 'Lead', status: 'Pending', notes: '' },
    ]
  );
  assert.equal(stats.totalTasks, 4);
  assert.equal(stats.completedCount, 2);
  assert.equal(stats.completionPercent, 50);
  assert.equal(stats.itineraryCompletionPercent, 50);
});

test('security utilities strip HTML, clamp numbers, round cents, and sandbox XML', () => {
  const dirty = '<script>alert("xss")</script><b>Grand Gala</b> javascript:evil()';
  const clean = sanitizeText(dirty);
  assert.equal(clean.includes('<script>'), false);
  assert.equal(clean.includes('javascript:'), false);
  assert.equal(clampNumber('999999999', 100, 10000000, 25000), 10000000);
  assert.equal(clampNumber('invalid', 1, 50000, 100), 100);
  assert.equal(roundToCents(19.999), 20);
  const xml = wrapXmlSandbox('event_name', ' Clara & Julian <script> ');
  assert.equal(xml, '<event_name>Clara &amp; Julian</event_name>');
  const hashA = computeRequestHash('/api/ai/budget', { total: 48000 });
  const hashB = computeRequestHash('/api/ai/budget', { total: 48000 });
  assert.equal(hashA, hashB);
});

test('validateEventConfig and sanitizeEventConfig enforce boundary constraints', () => {
  const invalid = validateEventConfig({
    eventName: 'A',
    date: 'not-a-date',
    location: '',
    guestCount: 0,
    totalBudget: 10,
    themeVibe: 'No',
  });
  assert.equal(invalid.valid, false);
  const clamped = sanitizeEventConfig({
    eventType: 'Wedding',
    eventName: '<b>Royal Conservatory</b>',
    date: '2027-06-15',
    location: 'New York',
    setting: 'Indoor',
    guestCount: 999999,
    currency: 'USD',
    totalBudget: -500,
    themeVibe: 'Modern Editorial',
  });
  assert.equal(clamped.guestCount, 50000);
  assert.equal(clamped.totalBudget, 100);
  assert.equal(buildCompactPromptContext(clamped).includes('<event_name>'), true);
});

test('eventReducer and validateAndHydrateState handle state transitions deterministically', () => {
  const initial = createInitialEventState('Wedding');
  const switched = eventReducer(initial, EventActions.switchPreset('Community Event'));
  assert.equal(switched.config.eventType, 'Community Event');
  const updatedBudget = eventReducer(switched, EventActions.updateTotalBudget(45000));
  assert.equal(updatedBudget.config.totalBudget, 45000);
  const hydrated = validateAndHydrateState(updatedBudget);
  assert.notEqual(hydrated, null);
  assert.equal(validateAndHydrateState({ invalid: true }), null);
  assert.equal(formatCurrency(48000, 'USD'), '$48,000');
  assert.equal(generatePlanMarkdown(initial).includes('# Clara & Julian Conservatory Wedding'), true);
});
