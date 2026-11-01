/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  API_COOLDOWN_MS,
  API_TIMEOUT_MS,
  BUDGET_CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_DEFAULT_NOTES,
  CONTINGENCY_RATE,
  CURRENCY_SYMBOLS,
  INDUSTRY_STANDARD_WEIGHTS,
  MAX_BUDGET,
  MAX_BUDGET_LIMIT,
  MAX_GUESTS,
  MILESTONE_WINDOWS,
  MIN_BUDGET,
  MIN_GUESTS,
  STORAGE_KEY,
} from '../constants/event.constants';

export {
  buildCompactPromptContext,
  clampNumber,
  computeRequestHash,
  resolveEventTypeLabel,
  roundToCents,
  roundToDollar,
  sanitizeEventConfig,
  sanitizeText,
  toSafeCurrencyCents,
  validateAndHydrateState,
  wrapUserPromptXml,
  wrapXmlSandbox,
} from './security.utils';

export {
  calculateBudgetAllocation,
  calculateBudgetMetrics,
  calculateTimelineProgress,
  classifyCategoryBudgetStatus,
  computeBudgetSummary,
  computeTimelineProgress,
  filterVendorsByCategory,
  formatCurrency,
  generatePlanMarkdown,
  validateEventConfig,
} from './domain.utils';
