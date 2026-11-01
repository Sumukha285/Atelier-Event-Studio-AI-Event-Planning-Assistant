/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BUDGET_CATEGORIES, CATEGORY_DEFAULT_NOTES, CONTINGENCY_RATE, CURRENCY_SYMBOLS,
  INDUSTRY_STANDARD_WEIGHTS, MAX_BUDGET_LIMIT, MAX_GUESTS, MILESTONE_WINDOWS,
  MIN_BUDGET, MIN_GUESTS, MIN_NAME_LENGTH, MIN_THEME_LENGTH, NEAR_LIMIT_PERCENT, PERCENTAGE_BASE,
} from '../constants/event.constants';
import {
  BudgetCategoryItem, BudgetHealthLabel, BudgetItem, BudgetSummary, CountdownTask,
  CurrencyCode, EventConfig, EventPlanState, EventType, ItineraryItem, TimelineStats,
  TimelineTask, ValidationResult, VendorItem,
} from '../types/event.types';
import { clampNumber, resolveEventTypeLabel, roundToDollar, sanitizeText, toSafeCurrencyCents } from './security.utils';

/** @description Formats a numeric value into a localized currency display string. */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const safeAmount = Number.isFinite(amount) ? roundToDollar(amount) : 0;
  return `${CURRENCY_SYMBOLS[currency] ?? '$'}${safeAmount.toLocaleString('en-US')}`;
}

/** @description Classifies a single budget line item's spending status against its estimated allocation. */
export function classifyCategoryBudgetStatus(estimatedCost: number, actualSpent: number): BudgetHealthLabel {
  const est = Math.max(0, estimatedCost);
  const act = Math.max(0, actualSpent);
  if (act === 0) return 'Unspent';
  if (est === 0 || act > est) return 'Over Budget';
  return toSafeCurrencyCents((act / est) * PERCENTAGE_BASE) >= NEAR_LIMIT_PERCENT ? 'Near Limit' : 'Under Budget';
}

/** @description Computes aggregate budget metrics, 10% contingency reserve, and variance counts from budget items. */
export function calculateBudgetMetrics(items: readonly BudgetItem[], totalBudget: number): BudgetSummary {
  const safeTotal = Math.max(0, roundToDollar(totalBudget));
  const contingencyReserve = roundToDollar(safeTotal * CONTINGENCY_RATE);
  const totalEstimated = items.reduce((sum, i) => sum + Math.max(0, roundToDollar(i.estimatedCost || 0)), 0);
  const totalActual = items.reduce((sum, i) => sum + Math.max(0, roundToDollar(i.actualSpent || 0)), 0);
  return {
    totalBudget: safeTotal,
    totalEstimated,
    totalActual,
    contingencyReserve,
    unallocatedBudget: safeTotal - totalEstimated,
    remainingFromTotal: safeTotal - totalActual,
    varianceEstimatedVsActual: totalEstimated - totalActual,
    estimatedPercentOfTotal: safeTotal > 0 ? Math.round((totalEstimated / safeTotal) * PERCENTAGE_BASE) : 0,
    actualPercentOfTotal: safeTotal > 0 ? Math.round((totalActual / safeTotal) * PERCENTAGE_BASE) : 0,
    overBudgetCount: items.filter((i) => classifyCategoryBudgetStatus(i.estimatedCost, i.actualSpent) === 'Over Budget').length,
    nearLimitCount: items.filter((i) => classifyCategoryBudgetStatus(i.estimatedCost, i.actualSpent) === 'Near Limit').length,
  };
}

/** @description Computes aggregate budget metrics with `(totalBudget, categories)` signature compatibility. */
export function computeBudgetSummary(totalBudget: number, categories: readonly BudgetCategoryItem[]): BudgetSummary {
  return calculateBudgetMetrics(categories, totalBudget);
}

/** @description Calculates integer completion percentage (`0` to `100`) across a list of timeline tasks. */
export function calculateTimelineProgress(tasks: readonly TimelineTask[]): number {
  if (tasks.length === 0) return 0;
  return Math.round((tasks.filter((task) => task.status === 'Completed').length / tasks.length) * PERCENTAGE_BASE);
}

/** @description Filters vendor checklist items relevant to the selected `EventType`. */
export function filterVendorsByCategory(vendors: readonly VendorItem[], eventType: EventType): readonly VendorItem[] {
  const canonical = resolveEventTypeLabel(eventType);
  return vendors.filter((v) => (!v.eventType || resolveEventTypeLabel(v.eventType) === canonical) && (canonical === 'Community Event' || !v.isPermitOrCompliance));
}

/** @description Computes detailed completion statistics across countdown tasks and run-of-show itinerary slots. */
export function computeTimelineProgress(tasks: readonly CountdownTask[], itinerary: readonly ItineraryItem[] = []): TimelineStats {
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const itineraryCompletedCount = itinerary.filter((i) => i.status === 'Completed').length;
  return {
    totalTasks: tasks.length,
    completedCount,
    inProgressCount,
    pendingCount: tasks.length - completedCount - inProgressCount,
    completionPercent: calculateTimelineProgress(tasks),
    itineraryCount: itinerary.length,
    itineraryCompletedCount,
    itineraryCompletionPercent: itinerary.length > 0 ? Math.round((itineraryCompletedCount / itinerary.length) * PERCENTAGE_BASE) : 0,
  };
}

/** @description Distributes `totalBudget` across all 7 core categories using integer-cent precision. */
export function calculateBudgetAllocation(
  totalBudget: number,
  eventType: EventType,
  existingItems?: readonly BudgetCategoryItem[]
): BudgetCategoryItem[] {
  const safeTotal = roundToDollar(clampNumber(totalBudget, 0, MAX_BUDGET_LIMIT));
  const label = resolveEventTypeLabel(eventType);
  const weights = INDUSTRY_STANDARD_WEIGHTS[label];
  const notes = CATEGORY_DEFAULT_NOTES[label];
  let runningSum = 0;
  return BUDGET_CATEGORIES.map((category, index): BudgetCategoryItem => {
    const pct = weights[category];
    const isLast = index === BUDGET_CATEGORIES.length - 1;
    const estimatedCost = isLast ? Math.max(0, safeTotal - runningSum) : roundToDollar((safeTotal * pct) / PERCENTAGE_BASE);
    runningSum += estimatedCost;
    const prev = existingItems?.find((item) => item.category === category);
    return {
      id: prev?.id ?? `budget-${category.toLowerCase().replace(/\s+/g, '-')}`,
      category,
      recommendedPercent: pct,
      estimatedCost,
      actualSpent: prev ? Math.max(0, roundToDollar(prev.actualSpent)) : 0,
      notes: prev?.notes || notes[category],
    };
  });
}

/** @description Validates an `EventConfig` and returns a structured field error map. */
export function validateEventConfig(config: Partial<EventConfig>): ValidationResult {
  const errors: Record<string, string> = {};
  if (sanitizeText(config.eventName).length < MIN_NAME_LENGTH) errors.eventName = 'Event name must be at least 2 characters.';
  if (!config.date || Number.isNaN(Date.parse(config.date))) errors.date = 'Please provide a valid target date.';
  if (sanitizeText(config.location).length < MIN_NAME_LENGTH) errors.location = 'Location or city is required.';
  if (Number(config.guestCount) < MIN_GUESTS || Number(config.guestCount) > MAX_GUESTS) errors.guestCount = 'Guest count out of range.';
  if (Number(config.totalBudget) < MIN_BUDGET || Number(config.totalBudget) > MAX_BUDGET_LIMIT) errors.totalBudget = 'Budget out of range.';
  if (sanitizeText(config.themeVibe).length < MIN_THEME_LENGTH) errors.themeVibe = 'Please describe your preferred theme or vibe.';
  return { valid: Object.keys(errors).length === 0, errors };
}

/** @description Compiles the full event plan state into a structured Markdown document for export. */
export function generatePlanMarkdown(state: EventPlanState): string {
  const { config, concepts, selectedConceptId, budgetCategories, countdownTasks, itinerary, vendors } = state;
  const summary = calculateBudgetMetrics(budgetCategories, config.totalBudget);
  const active = concepts.find((c) => c.id === selectedConceptId) ?? concepts[0];
  const cur = config.currency;
  const budgetRows = budgetCategories.map((b) => `| ${b.category} | ${b.recommendedPercent}% | ${formatCurrency(b.estimatedCost, cur)} | ${formatCurrency(b.actualSpent, cur)} | ${b.notes} |`);
  const tasks = MILESTONE_WINDOWS.map((w) => `### ${w}\n${countdownTasks.filter((t) => t.milestone === w).map((t) => `- [${t.status}] **${t.title}** (${t.category})`).join('\n')}`);
  const slots = itinerary.map((s) => `| ${s.timeSlot} | ${s.durationMinutes}m | ${s.activity} | ${s.locationZone} | ${s.status} |`);
  const vRows = vendors.map((v) => `### ${v.category} (${v.bookingStatus})\n- Quote: ${formatCurrency(v.quotedPrice, cur)} | Questions: ${v.vettingQuestions.join(' • ')}`);
  return [`# ${config.eventName} — Master Event Blueprint`, `**Type:** ${config.eventType} | **Date:** ${config.date} | **Location:** ${config.location} | **Budget:** ${formatCurrency(summary.totalBudget, cur)}`, active ? `\n## 1. Concept: ${active.title}\n${active.atmosphereDescription}` : '', `\n## 2. Smart Budget Breakdown\n| Category | % | Estimated | Actual | Notes |\n| :--- | :--- | :--- | :--- | :--- |\n${budgetRows.join('\n')}`, `\n## 3. Countdown Milestones\n${tasks.join('\n\n')}`, `\n## 4. Day-Of Run-of-Show\n| Time | Duration | Activity | Zone | Status |\n| :--- | :--- | :--- | :--- | :--- |\n${slots.join('\n')}`, `\n## 5. Vendor Directory\n${vRows.join('\n\n')}`].join('\n');
}
