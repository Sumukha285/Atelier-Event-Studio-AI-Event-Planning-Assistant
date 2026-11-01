/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BUDGET_CATEGORIES, CATEGORY_DEFAULT_NOTES, CURRENCY_SYMBOLS, DEFAULT_BUDGET, INDUSTRY_STANDARD_WEIGHTS, MAX_BUDGET, MAX_GUESTS, MILESTONE_WINDOWS, MIN_BUDGET, MIN_GUESTS, NEAR_LIMIT_PERCENT } from '../constants/event.constants';
import { BudgetCategoryItem, BudgetHealthLabel, BudgetSummary, CountdownTask, CurrencyCode, EventConfig, EventPlanState, EventType, ItineraryItem, TimelineStats, ValidationResult } from '../types/event.types';
import { clampNumber, roundToCents, roundToDollar, sanitizeText } from './security.utils';

export { BUDGET_CATEGORIES, CATEGORY_COLORS, CATEGORY_DEFAULT_NOTES, CURRENCY_SYMBOLS, INDUSTRY_STANDARD_WEIGHTS, MAX_BUDGET, MAX_GUESTS, MILESTONE_WINDOWS, MIN_BUDGET, MIN_GUESTS } from '../constants/event.constants';
export { buildCompactPromptContext, clampNumber, computeRequestHash, roundToCents, roundToDollar, sanitizeEventConfig, sanitizeText, validateAndHydrateState, wrapXmlSandbox } from './security.utils';

/**
 * Formats a numeric value into a localized currency display string.
 * @param amount - Monetary amount
 * @param currency - ISO currency code
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const safeAmount = Number.isFinite(amount) ? roundToDollar(amount) : 0;
  const symbol = CURRENCY_SYMBOLS[currency] ?? '$';
  return `${symbol}${safeAmount.toLocaleString('en-US')}`;
}

/**
 * Validates an `EventConfig` and returns a structured error dictionary.
 * @param config - Partial or full event configuration
 * @returns Validation result containing `valid` flag and field-keyed `errors`
 */
export function validateEventConfig(config: Partial<EventConfig>): ValidationResult {
  const errors: Record<string, string> = {};
  if (sanitizeText(config.eventName, 120).length < 2) errors.eventName = 'Event name must be at least 2 characters.';
  if (!config.date || Number.isNaN(Date.parse(config.date))) errors.date = 'Please provide a valid target date.';
  if (sanitizeText(config.location, 140).length < 2) errors.location = 'Location or city is required.';
  const guests = Number(config.guestCount);
  if (!Number.isFinite(guests) || guests < MIN_GUESTS || guests > MAX_GUESTS) {
    errors.guestCount = `Guest count must be between ${MIN_GUESTS} and ${MAX_GUESTS.toLocaleString()}.`;
  }
  const budget = Number(config.totalBudget);
  if (!Number.isFinite(budget) || budget < MIN_BUDGET || budget > MAX_BUDGET) {
    errors.totalBudget = `Total budget must be between ${MIN_BUDGET.toLocaleString()} and ${MAX_BUDGET.toLocaleString()}.`;
  }
  if (sanitizeText(config.themeVibe, 180).length < 3) errors.themeVibe = 'Please describe your preferred theme or vibe.';
  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Distributes `totalBudget` across all 7 core categories using integer-cent precision so the sum equals `totalBudget`.
 * @param totalBudget - Total event budget
 * @param eventType - Selected event archetype
 * @param existingItems - Optional current categories to preserve `actualSpent` and `id`
 * @returns Proportionally allocated budget category array
 */
export function calculateBudgetAllocation(
  totalBudget: number,
  eventType: EventType,
  existingItems?: readonly BudgetCategoryItem[]
): BudgetCategoryItem[] {
  const safeTotal = roundToDollar(clampNumber(totalBudget, 0, MAX_BUDGET, DEFAULT_BUDGET));
  const weights = INDUSTRY_STANDARD_WEIGHTS[eventType] ?? INDUSTRY_STANDARD_WEIGHTS.Wedding;
  const defaultNotes = CATEGORY_DEFAULT_NOTES[eventType] ?? CATEGORY_DEFAULT_NOTES.Wedding;
  let runningSum = 0;

  return BUDGET_CATEGORIES.map((category, index): BudgetCategoryItem => {
    const percent = weights[category];
    const isLast = index === BUDGET_CATEGORIES.length - 1;
    const rawEstimate = roundToDollar(roundToCents((safeTotal * percent) / 100));
    const estimatedCost = isLast ? Math.max(0, safeTotal - runningSum) : rawEstimate;
    runningSum += estimatedCost;
    const existing = existingItems?.find((item) => item.category === category);
    return {
      id: existing?.id ?? `budget-${category.toLowerCase().replace(/\s+/g, '-')}`,
      category,
      recommendedPercent: percent,
      estimatedCost,
      actualSpent: existing && Number.isFinite(existing.actualSpent) ? Math.max(0, roundToDollar(existing.actualSpent)) : 0,
      notes: existing?.notes ? existing.notes : defaultNotes[category],
    };
  });
}

/**
 * Classifies a single budget line item's spending status against its estimated allocation.
 * @param estimatedCost - Target category allocation
 * @param actualSpent - Actual amount committed/spent
 * @returns Semantic health label
 */
export function classifyCategoryBudgetStatus(estimatedCost: number, actualSpent: number): BudgetHealthLabel {
  const est = Math.max(0, estimatedCost);
  const act = Math.max(0, actualSpent);
  if (act === 0) return 'Unspent';
  if (est === 0 || act > est) return 'Over Budget';
  return roundToCents((act / est) * 100) >= NEAR_LIMIT_PERCENT ? 'Near Limit' : 'Under Budget';
}

/**
 * Computes aggregate budget metrics and variance counts from the category ledger.
 * @param totalBudget - Master budget ceiling
 * @param categories - Category ledger rows
 * @returns Computed `BudgetSummary` metrics
 */
export function computeBudgetSummary(totalBudget: number, categories: readonly BudgetCategoryItem[]): BudgetSummary {
  const safeTotal = Math.max(0, roundToDollar(totalBudget));
  let totalEstimated = 0;
  let totalActual = 0;
  let overBudgetCount = 0;
  let nearLimitCount = 0;

  for (const item of categories) {
    const est = Math.max(0, roundToDollar(item.estimatedCost || 0));
    const act = Math.max(0, roundToDollar(item.actualSpent || 0));
    totalEstimated += est;
    totalActual += act;
    const status = classifyCategoryBudgetStatus(est, act);
    if (status === 'Over Budget') overBudgetCount += 1;
    if (status === 'Near Limit') nearLimitCount += 1;
  }

  return {
    totalBudget: safeTotal,
    totalEstimated,
    totalActual,
    unallocatedBudget: safeTotal - totalEstimated,
    remainingFromTotal: safeTotal - totalActual,
    varianceEstimatedVsActual: totalEstimated - totalActual,
    estimatedPercentOfTotal: safeTotal > 0 ? Math.round((totalEstimated / safeTotal) * 100) : 0,
    actualPercentOfTotal: safeTotal > 0 ? Math.round((totalActual / safeTotal) * 100) : 0,
    overBudgetCount,
    nearLimitCount,
  };
}

/**
 * Computes completion percentages and status counts across countdown tasks and run-of-show slots.
 * @param tasks - Countdown checklist tasks
 * @param itinerary - Day-of itinerary slots
 * @returns Computed `TimelineStats`
 */
export function computeTimelineProgress(tasks: readonly CountdownTask[], itinerary: readonly ItineraryItem[] = []): TimelineStats {
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const itineraryCount = itinerary.length;
  const itineraryCompletedCount = itinerary.filter((i) => i.status === 'Completed').length;
  return {
    totalTasks,
    completedCount,
    inProgressCount,
    pendingCount,
    completionPercent: totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0,
    itineraryCount,
    itineraryCompletedCount,
    itineraryCompletionPercent: itineraryCount > 0 ? Math.round((itineraryCompletedCount / itineraryCount) * 100) : 0,
  };
}

/**
 * Compiles the full event plan state into a structured Markdown document for export.
 * @param state - Full event planning state
 * @returns Formatted Markdown string
 */
export function generatePlanMarkdown(state: EventPlanState): string {
  const { config, concepts, selectedConceptId, budgetCategories, countdownTasks, itinerary, vendors } = state;
  const summary = computeBudgetSummary(config.totalBudget, budgetCategories);
  const activeConcept = concepts.find((c) => c.id === selectedConceptId) ?? concepts[0];
  const cur = config.currency;
  const budgetRows = budgetCategories.map((b) => `| ${b.category} | ${b.recommendedPercent}% | ${formatCurrency(b.estimatedCost, cur)} | ${formatCurrency(b.actualSpent, cur)} | ${formatCurrency(b.estimatedCost - b.actualSpent, cur)} | ${b.notes} |`);
  const milestoneBlocks = MILESTONE_WINDOWS.map((window) => {
    const rows = countdownTasks.filter((t) => t.milestone === window).map((t) => `- [${t.status === 'Completed' ? 'x' : t.status === 'In Progress' ? '~' : ' '}] **${t.title}** _(${t.category} — ${t.status})_ ${t.assigneeOrNote ? `— ${t.assigneeOrNote}` : ''}`);
    return rows.length > 0 ? `### ${window}\n${rows.join('\n')}` : '';
  }).filter(Boolean);
  const itineraryRows = itinerary.map((s) => `| ${s.timeSlot} | ${s.durationMinutes}m | ${s.activity} | ${s.locationZone} | ${s.leadOwner} | ${s.status} |`);
  const vendorBlocks = vendors.map((v) => `### ${v.category} (${v.priority} — ${v.bookingStatus})\n- **Vendor:** ${v.vendorName || 'Unassigned'} | **Quote:** ${formatCurrency(v.quotedPrice, cur)}\n- **Vetting Questions:** ${v.vettingQuestions.join(' • ')}\n- **Red Flags:** ${v.contractRedFlags.join(' • ')}`);
  return [
    `# ${config.eventName} — Master Event Blueprint`,
    `**Event Type:** ${config.eventType} | **Date:** ${config.date} | **Location:** ${config.location} (${config.setting})`,
    `**Guest Count:** ${config.guestCount.toLocaleString()} | **Total Budget:** ${formatCurrency(config.totalBudget, cur)} | **Theme:** ${config.themeVibe}`,
    activeConcept ? `\n## 1. Selected Concept: ${activeConcept.title}\n_${activeConcept.tagline}_\n\n${activeConcept.atmosphereDescription}` : '',
    `\n## 2. Smart Budget Breakdown\n- **Total Budget:** ${formatCurrency(summary.totalBudget, cur)} | **Estimated:** ${formatCurrency(summary.totalEstimated, cur)} | **Actual Spent:** ${formatCurrency(summary.totalActual, cur)}`,
    `| Category | Share | Estimated | Actual Spent | Variance | Notes |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${budgetRows.join('\n')}`,
    `\n## 3. Countdown Milestones\n${milestoneBlocks.join('\n\n')}`,
    `\n## 4. Day-Of Run-of-Show\n| Time | Duration | Activity | Zone | Lead | Status |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n${itineraryRows.join('\n')}`,
    `\n## 5. Vendor & Logistics Directory\n${vendorBlocks.join('\n\n')}`,
  ].join('\n');
}
