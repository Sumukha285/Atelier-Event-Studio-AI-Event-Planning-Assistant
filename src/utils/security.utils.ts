/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CENTS_MULTIPLIER,
  CURRENCY_CODES,
  DEFAULT_BUDGET,
  DEFAULT_GUESTS,
  EVENT_TYPE_CODE_TO_LABEL,
  MAX_BUDGET_LIMIT,
  MAX_GUESTS,
  MAX_LOCATION_LENGTH,
  MAX_NOTES_LENGTH,
  MAX_TEXT_LENGTH,
  MAX_THEME_LENGTH,
  MAX_TITLE_LENGTH,
  MIN_BUDGET,
  MIN_GUESTS,
  SETTING_TYPES,
} from '../constants/event.constants';
import {
  CurrencyCode,
  EventConfig,
  EventPlanState,
  EventTypeLabel,
  isRecordObject,
  isValidBlueprint,
  SettingType,
} from '../types/event.types';

const DEFAULT_DAYS_AHEAD = 90;
const MS_PER_DAY = 86400000;
const HASH_SEED = 5381;
const HASH_MULTIPLIER = 33;

/** @description Strips HTML tags, script protocols, and ASCII control characters from untrusted input. */
export function sanitizeText(input: unknown, maxLength: number = MAX_TEXT_LENGTH): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/** @description Clamps a numeric value within `[min, max]`, guarding against NaN, Infinity, and out-of-range inputs. */
export function clampNumber(val: unknown, min: number, max: number): number {
  const parsed = typeof val === 'number' ? val : Number(val);
  if (!Number.isFinite(parsed)) return Math.max(0, min);
  return Math.min(max, Math.max(min, parsed));
}

/** @description Performs integer-cent rounding (`Math.round(amount * 100) / 100`) to prevent IEEE 754 floating-point drift. */
export function toSafeCurrencyCents(amount: number): number {
  if (!Number.isFinite(amount) || amount < 0) return 0;
  return Math.round(amount * CENTS_MULTIPLIER) / CENTS_MULTIPLIER;
}

export const roundToCents = toSafeCurrencyCents;

/** @description Rounds a monetary value to the nearest whole currency integer using safe cent arithmetic. */
export function roundToDollar(amount: number): number {
  return Math.round(toSafeCurrencyCents(amount));
}

/** @description Wraps user-supplied text inside an XML sandbox tag and escapes delimiters to mitigate prompt injection. */
export function wrapUserPromptXml(tag: string, content: string): string {
  const safeTag = tag.replace(/[^a-zA-Z0-9_]/g, '') || 'user_input';
  const escaped = sanitizeText(content, MAX_NOTES_LENGTH)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<${safeTag}>${escaped}</${safeTag}>`;
}

export const wrapXmlSandbox = wrapUserPromptXml;

/** @description Resolves any `EventType` code or label to its canonical display label. */
export function resolveEventTypeLabel(value: unknown): EventTypeLabel {
  const key = String(value ?? 'Wedding') as keyof typeof EVENT_TYPE_CODE_TO_LABEL;
  return EVENT_TYPE_CODE_TO_LABEL[key] ?? 'Wedding';
}

/** @description Sanitizes and clamps all fields of an `EventConfig` object. */
export function sanitizeEventConfig(config: EventConfig): EventConfig {
  const eventType = resolveEventTypeLabel(config.eventType);
  const setting: SettingType = SETTING_TYPES.includes(config.setting) ? config.setting : 'Outdoor';
  const currency: CurrencyCode = CURRENCY_CODES.includes(config.currency) ? config.currency : 'USD';
  const fallbackDate = new Date(Date.now() + DEFAULT_DAYS_AHEAD * MS_PER_DAY).toISOString().split('T')[0];
  return {
    eventType,
    eventName: sanitizeText(config.eventName, MAX_TITLE_LENGTH) || 'Untitled Event',
    date: sanitizeText(config.date, 20) || fallbackDate,
    location: sanitizeText(config.location, MAX_LOCATION_LENGTH) || 'TBD Venue',
    setting,
    guestCount: Math.round(clampNumber(config.guestCount ?? DEFAULT_GUESTS, MIN_GUESTS, MAX_GUESTS)),
    currency,
    totalBudget: roundToDollar(clampNumber(config.totalBudget ?? DEFAULT_BUDGET, MIN_BUDGET, MAX_BUDGET_LIMIT)),
    themeVibe: sanitizeText(config.themeVibe, MAX_THEME_LENGTH) || 'Modern Editorial',
    notes: sanitizeText(config.notes ?? '', MAX_NOTES_LENGTH),
  };
}

/** @description Builds a compact XML-sandboxed prompt context string for Gemini API calls. */
export function buildCompactPromptContext(config: EventConfig): string {
  const safe = sanitizeEventConfig(config);
  return [
    wrapUserPromptXml('event_type', safe.eventType),
    wrapUserPromptXml('event_name', safe.eventName),
    wrapUserPromptXml('event_date', safe.date),
    wrapUserPromptXml('location_setting', `${safe.location} (${safe.setting})`),
    wrapUserPromptXml('guest_count', String(safe.guestCount)),
    wrapUserPromptXml('total_budget', `${safe.currency} ${safe.totalBudget}`),
    wrapUserPromptXml('theme_vibe', safe.themeVibe),
  ].join('\n');
}

/** @description Computes a deterministic O(1) cache key hash for an API endpoint and request payload. */
export function computeRequestHash(endpoint: string, payload: unknown): string {
  const serialized = `${endpoint}:${JSON.stringify(payload)}`;
  let hash = HASH_SEED;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash * HASH_MULTIPLIER) ^ serialized.charCodeAt(i);
  }
  return `${endpoint}#${(hash >>> 0).toString(16)}`;
}

/** @description Validates and hydrates raw parsed JSON from `localStorage` into a safe `EventPlanState`. */
export function validateAndHydrateState(raw: unknown): EventPlanState | null {
  if (!isRecordObject(raw) || !isRecordObject(raw.config) || !isValidBlueprint(raw)) return null;
  return {
    config: sanitizeEventConfig(raw.config as unknown as EventConfig),
    concepts: raw.concepts,
    selectedConceptId: typeof raw.selectedConceptId === 'string' ? raw.selectedConceptId : null,
    budgetCategories: raw.budgetCategories,
    countdownTasks: raw.countdownTasks,
    itinerary: raw.itinerary,
    vendors: raw.vendors,
    chatHistory: Array.isArray(raw.chatHistory) ? (raw.chatHistory as EventPlanState['chatHistory']) : [],
    lastUpdated: typeof raw.lastUpdated === 'string' ? raw.lastUpdated : new Date().toISOString(),
  };
}
