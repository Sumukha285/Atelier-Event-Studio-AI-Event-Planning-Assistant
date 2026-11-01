/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CURRENCY_CODES,
  DEFAULT_BUDGET,
  DEFAULT_GUESTS,
  EVENT_TYPES,
  MAX_BUDGET,
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
import { CurrencyCode, EventConfig, EventPlanState, EventType, SettingType } from '../types/event.types';

/**
 * Strips HTML tags, script protocols, and ASCII control characters from untrusted input.
 * @param input - Raw user input of any type
 * @param maxLength - Maximum allowed character length
 * @returns Sanitized plain-text string
 */
export function sanitizeText(input: unknown, maxLength: number = MAX_TEXT_LENGTH): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Clamps a numeric input within `[min, max]`, returning `fallback` for NaN or non-finite values.
 * @param value - Candidate numeric value
 * @param min - Minimum bound
 * @param max - Maximum bound
 * @param fallback - Default value when input is not finite
 * @returns Clamped number
 */
export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

/**
 * Rounds a monetary float using integer-cent arithmetic (`Math.round(amount * 100) / 100`).
 * @param amount - Monetary amount in currency units
 * @returns Cent-accurate monetary value
 */
export function roundToCents(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

/**
 * Rounds a monetary value to the nearest whole currency unit using integer-cent precision first.
 * @param amount - Monetary amount
 * @returns Whole-dollar integer amount
 */
export function roundToDollar(amount: number): number {
  return Math.round(roundToCents(amount));
}

/**
 * Wraps user-supplied text inside an XML sandbox tag and escapes XML delimiters to prevent prompt injection.
 * @param tagName - Alphanumeric XML tag identifier
 * @param content - User string to sandbox
 * @returns XML-delimited safe prompt block
 */
export function wrapXmlSandbox(tagName: string, content: string): string {
  const safeTag = tagName.replace(/[^a-zA-Z0-9_]/g, '') || 'user_input';
  const escaped = sanitizeText(content, MAX_NOTES_LENGTH)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<${safeTag}>${escaped}</${safeTag}>`;
}

/**
 * Sanitizes and clamps all fields of an `EventConfig` object.
 * @param config - Raw event configuration
 * @returns Sanitized and clamped `EventConfig`
 */
export function sanitizeEventConfig(config: EventConfig): EventConfig {
  const eventType: EventType = EVENT_TYPES.includes(config.eventType) ? config.eventType : 'Wedding';
  const setting: SettingType = SETTING_TYPES.includes(config.setting) ? config.setting : 'Outdoor';
  const currency: CurrencyCode = CURRENCY_CODES.includes(config.currency) ? config.currency : 'USD';
  return {
    eventType,
    eventName: sanitizeText(config.eventName, MAX_TITLE_LENGTH) || 'Untitled Event',
    date: sanitizeText(config.date, 20) || new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    location: sanitizeText(config.location, MAX_LOCATION_LENGTH) || 'TBD Venue',
    setting,
    guestCount: Math.round(clampNumber(config.guestCount, MIN_GUESTS, MAX_GUESTS, DEFAULT_GUESTS)),
    currency,
    totalBudget: roundToDollar(clampNumber(config.totalBudget, MIN_BUDGET, MAX_BUDGET, DEFAULT_BUDGET)),
    themeVibe: sanitizeText(config.themeVibe, MAX_THEME_LENGTH) || 'Modern Editorial',
    notes: sanitizeText(config.notes ?? '', MAX_NOTES_LENGTH),
  };
}

/**
 * Builds a compact, XML-sandboxed prompt context string for Gemini API calls.
 * @param config - Event configuration
 * @returns Compact XML-delimited context block
 */
export function buildCompactPromptContext(config: EventConfig): string {
  const safe = sanitizeEventConfig(config);
  return [
    wrapXmlSandbox('event_type', safe.eventType),
    wrapXmlSandbox('event_name', safe.eventName),
    wrapXmlSandbox('event_date', safe.date),
    wrapXmlSandbox('location_setting', `${safe.location} (${safe.setting})`),
    wrapXmlSandbox('guest_count', String(safe.guestCount)),
    wrapXmlSandbox('total_budget', `${safe.currency} ${safe.totalBudget}`),
    wrapXmlSandbox('theme_vibe', safe.themeVibe),
  ].join('\n');
}

/**
 * Computes a deterministic cache key hash for an API endpoint and request payload.
 * @param endpoint - API path
 * @param payload - Serializable request body
 * @returns Deterministic string hash key
 */
export function computeRequestHash(endpoint: string, payload: unknown): string {
  const serialized = `${endpoint}:${JSON.stringify(payload)}`;
  let hash = 5381;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash * 33) ^ serialized.charCodeAt(i);
  }
  return `${endpoint}#${(hash >>> 0).toString(16)}`;
}

/**
 * Validates and hydrates raw parsed JSON from `localStorage` into a safe `EventPlanState`.
 * @param raw - Unknown parsed value from storage
 * @returns Validated `EventPlanState` or `null` if schema checks fail
 */
export function validateAndHydrateState(raw: unknown): EventPlanState | null {
  if (!raw || typeof raw !== 'object') return null;
  const c = raw as Record<string, unknown>;
  if (!c.config || typeof c.config !== 'object') return null;
  if (!Array.isArray(c.concepts) || !Array.isArray(c.budgetCategories) || !Array.isArray(c.countdownTasks) || !Array.isArray(c.itinerary) || !Array.isArray(c.vendors)) {
    return null;
  }
  return {
    config: sanitizeEventConfig(c.config as EventConfig),
    concepts: c.concepts as EventPlanState['concepts'],
    selectedConceptId: typeof c.selectedConceptId === 'string' ? c.selectedConceptId : null,
    budgetCategories: c.budgetCategories as EventPlanState['budgetCategories'],
    countdownTasks: c.countdownTasks as EventPlanState['countdownTasks'],
    itinerary: c.itinerary as EventPlanState['itinerary'],
    vendors: c.vendors as EventPlanState['vendors'],
    chatHistory: Array.isArray(c.chatHistory) ? (c.chatHistory as EventPlanState['chatHistory']) : [],
    lastUpdated: typeof c.lastUpdated === 'string' ? c.lastUpdated : new Date().toISOString(),
  };
}
