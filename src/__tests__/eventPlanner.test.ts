/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createInitialEventState } from '../constants/presets.data';
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

/**
 * @description Provides a Jest/Vitest-compatible `expect` assertion API backed by `node:assert/strict`.
 * @param {T} actual - Value under test
 * @returns Assertion matchers object
 */
function expect<T>(actual: T): {
  readonly toBe: (expected: T) => void;
  readonly toEqual: (expected: T) => void;
  readonly toContain: (substring: string) => void;
  readonly toBeTruthy: () => void;
  readonly toBeFalsy: () => void;
} {
  return {
    toBe: (expected: T): void => assert.equal(actual, expected),
    toEqual: (expected: T): void => assert.deepEqual(actual, expected),
    toContain: (substring: string): void => assert.equal(String(actual).includes(substring), true),
    toBeTruthy: (): void => assert.equal(Boolean(actual), true),
    toBeFalsy: (): void => assert.equal(Boolean(actual), false),
  };
}

describe('Security Sanitization & Numeric Guards', () => {
  it('sanitizeText strips script payloads and javascript protocols', () => {
    const dirty = '<script>alert("xss")</script><b>Grand Gala</b> javascript:evil()';
    const clean = sanitizeText(dirty);
    expect(clean.includes('<script>')).toBe(false);
    expect(clean.includes('javascript:')).toBe(false);
    expect(clean).toContain('Grand Gala');
  });

  it('wrapUserPromptXml encloses input in XML sandbox tags and escapes entities', () => {
    const xml = wrapUserPromptXml('user_input', 'Clara & Julian <script>');
    expect(xml).toBe('<user_input>Clara &amp; Julian</user_input>');
  });

  it('clampNumber and toSafeCurrencyCents guard against NaN, negatives, and float drift', () => {
    expect(clampNumber(Number.NaN, 100, 5000)).toBe(100);
    expect(clampNumber(999999, 100, 5000)).toBe(5000);
    expect(clampNumber(-45, 0, 100)).toBe(0);
    expect(toSafeCurrencyCents(0.1 + 0.2)).toBe(0.3);
    expect(toSafeCurrencyCents(19.999)).toBe(20);
    expect(toSafeCurrencyCents(-25)).toBe(0);
  });
});

describe('Domain Budget, Timeline & Vendor Calculations', () => {
  it('calculateBudgetMetrics computes 10% contingency reserve and over-budget count', () => {
    const summary = calculateBudgetMetrics(
      [
        { id: '1', category: 'Venue', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 10500, notes: '' },
        { id: '2', category: 'Catering', recommendedPercent: 30, estimatedCost: 10000, actualSpent: 9200, notes: '' },
      ],
      30000
    );
    expect(summary.contingencyReserve).toBe(3000);
    expect(summary.totalEstimated).toBe(20000);
    expect(summary.totalActual).toBe(19700);
    expect(summary.overBudgetCount).toBe(1);
  });

  it('calculateBudgetAllocation sums to exact totalBudget across 7 categories', () => {
    const allocated = calculateBudgetAllocation(48000, 'Wedding');
    const sum = allocated.reduce((acc, item) => acc + item.estimatedCost, 0);
    expect(allocated.length).toBe(7);
    expect(sum).toBe(48000);
  });

  it('calculateTimelineProgress and filterVendorsByCategory compute accurate domain subsets', () => {
    const community = createInitialEventState('COMMUNITY');
    expect(calculateTimelineProgress(community.countdownTasks)).toBe(40);
    const filtered = filterVendorsByCategory(community.vendors, 'COMMUNITY');
    expect(filtered.some((v) => Boolean(v.isPermitOrCompliance))).toBeTruthy();
  });
});

describe('Event Reducer State Machine & Schema Validation', () => {
  it('handles ADD_BUDGET_ITEM, UPDATE_ACTUAL_COST, TOGGLE_TIMELINE_TASK, UPDATE_VENDOR_STATUS, and HYDRATE_BLUEPRINT', () => {
    const initial = createInitialEventState('Wedding');
    const added = eventReducer(
      initial,
      EventActions.addBudgetItem({ id: 'b-custom', category: 'Lighting', recommendedPercent: 5, estimatedCost: 2000, actualSpent: 0, notes: '' })
    );
    expect(added.budgetCategories.length).toBe(initial.budgetCategories.length + 1);

    const updatedCost = eventReducer(added, EventActions.updateActualCost('b-custom', 1750));
    expect(updatedCost.budgetCategories.find((i) => i.id === 'b-custom')?.actualSpent).toBe(1750);

    const taskId = initial.countdownTasks[0].id;
    const toggled = eventReducer(initial, EventActions.toggleTimelineTask(taskId));
    expect(toggled.countdownTasks[0].status !== initial.countdownTasks[0].status).toBe(true);

    const vendorId = initial.vendors[0].id;
    const booked = eventReducer(initial, EventActions.updateVendorStatus(vendorId, 'Booked'));
    expect(booked.vendors[0].bookingStatus).toBe('Booked');

    expect(isValidBlueprint(initial)).toBe(true);
    expect(isValidBlueprint(null)).toBe(false);
    expect(isValidBlueprint({ concepts: 'tampered' })).toBe(false);
  });

  it('passes all 12 in-app diagnostic self-tests', () => {
    const suite = runDiagnosticSelfTests();
    expect(suite.total).toBe(12);
    expect(suite.passedCount).toBe(12);
    expect(suite.allPassed).toBe(true);
  });
});
