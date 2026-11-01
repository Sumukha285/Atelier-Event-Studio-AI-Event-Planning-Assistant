/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_COOLDOWN_MS, API_TIMEOUT_MS, CONTINGENCY_RATE } from '../constants/event.constants';
import {
  BudgetCategoryItem,
  CompleteBlueprintResponse,
  ConceptPackage,
  CountdownTask,
  EventBlueprint,
  EventConfig,
  EventPlanState,
  isValidBlueprint,
  ItineraryItem,
  VendorItem,
} from '../types/event.types';
import { computeRequestHash, sanitizeEventConfig } from '../utils/security.utils';
import { COMPLETE_BLUEPRINT_SCHEMA } from './gemini.schemas';

export interface BrainstormResponse {
  readonly concepts: readonly ConceptPackage[];
  readonly source: 'gemini' | 'studio-engine';
}

export interface BudgetAiResponse {
  readonly categories: readonly BudgetCategoryItem[];
  readonly source: 'gemini' | 'studio-engine';
}

export interface TimelineAiResponse {
  readonly countdownTasks: readonly CountdownTask[];
  readonly itinerary: readonly ItineraryItem[];
  readonly source: 'gemini' | 'studio-engine';
}

export interface VendorVettingAiResponse {
  readonly vettingQuestions: readonly string[];
  readonly contractRedFlags: readonly string[];
  readonly source: 'gemini' | 'studio-engine';
}

export interface CoPilotAiResponse {
  readonly reply: string;
  readonly source: 'gemini' | 'studio-engine';
}

export interface PostJsonRequestConfig {
  readonly endpoint: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly channel: string;
  readonly bypassCache?: boolean;
}

/** Strict JSON generation configuration enforcing `responseMimeType: "application/json"` and `responseSchema`. */
export const GEMINI_BLUEPRINT_GENERATION_CONFIG = {
  responseMimeType: 'application/json',
  responseSchema: COMPLETE_BLUEPRINT_SCHEMA,
  contingencyRate: CONTINGENCY_RATE,
} as const;

const blueprintCache = new Map<string, EventBlueprint>();
const responseCache = new Map<string, unknown>();
const activeControllers = new Map<string, AbortController>();
let lastInvocationTimestamp = 0;

/**
 * @description Calculates remaining milliseconds in the 3,000ms rate-limit cooldown window.
 * @param {number} [now=Date.now()] - Current timestamp in milliseconds
 * @returns {number} Remaining cooldown milliseconds (0 when ready)
 */
export function getRemainingCooldownMs(now: number = Date.now()): number {
  const elapsed = now - lastInvocationTimestamp;
  return elapsed < API_COOLDOWN_MS ? API_COOLDOWN_MS - elapsed : 0;
}

/**
 * @description Aborts any existing request on the given channel and creates a fresh `AbortController` with a 15,000ms timeout.
 * @param {string} channel - Logical request channel identifier
 * @returns {AbortController} Managed `AbortController` instance
 */
export function createManagedAbortController(channel: string): AbortController {
  const previous = activeControllers.get(channel);
  if (previous) previous.abort();
  const controller = new AbortController();
  activeControllers.set(channel, controller);
  globalThis.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  return controller;
}

/**
 * @description Aborts all active Gemini API requests and clears controller references.
 * @returns {void}
 */
export function abortAllRequests(): void {
  for (const controller of activeControllers.values()) controller.abort();
  activeControllers.clear();
}

/**
 * @description Executes a cached JSON POST request with O(1) hash lookup and 15,000ms AbortController timeout.
 * @param {PostJsonRequestConfig} requestConfig - Endpoint, payload, channel, and cache flag
 * @returns {Promise<T>} Parsed JSON response
 */
async function postCachedJson<T>(requestConfig: PostJsonRequestConfig): Promise<T> {
  const { endpoint, payload, channel, bypassCache = false } = requestConfig;
  const cacheKey = computeRequestHash(endpoint, payload);
  if (!bypassCache && responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey) as T;
  }
  lastInvocationTimestamp = Date.now();
  const controller = createManagedAbortController(channel);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = (await response.json()) as T;
    responseCache.set(cacheKey, data);
    return data;
  } finally {
    if (activeControllers.get(channel) === controller) activeControllers.delete(channel);
  }
}

/**
 * @description Fetches and validates a unified 4-pillar `EventBlueprint`, caching valid responses in `Map<string, EventBlueprint>`.
 * @param {EventConfig} config - Event configuration parameters
 * @returns {Promise<CompleteBlueprintResponse>} Validated complete blueprint
 */
export async function fetchCompleteBlueprint(config: EventConfig): Promise<CompleteBlueprintResponse> {
  const safeConfig = sanitizeEventConfig(config);
  const hashKey = computeRequestHash('/api/ai/blueprint', safeConfig);
  const cached = blueprintCache.get(hashKey);
  if (cached) return cached;
  const result = await postCachedJson<unknown>({
    endpoint: '/api/ai/blueprint',
    payload: { config: safeConfig },
    channel: 'blueprint',
  });
  if (!isValidBlueprint(result)) {
    throw new Error('Invalid blueprint schema received from AI service.');
  }
  blueprintCache.set(hashKey, result);
  return result;
}

/**
 * @description Generates 3 tailored concept packages with hex color palettes for the active event.
 * @param {EventConfig} config - Event configuration parameters
 * @returns {Promise<BrainstormResponse>} Concept packages response
 */
export async function fetchConcepts(config: EventConfig): Promise<BrainstormResponse> {
  return postCachedJson<BrainstormResponse>({
    endpoint: '/api/ai/brainstorm',
    payload: { config: sanitizeEventConfig(config) },
    channel: 'brainstorm',
  });
}

/**
 * @description Generates an AI-calibrated budget allocation including the 10% contingency reserve.
 * @param {EventConfig} config - Event configuration parameters
 * @returns {Promise<BudgetAiResponse>} Budget allocation response
 */
export async function fetchBudgetAllocation(config: EventConfig): Promise<BudgetAiResponse> {
  return postCachedJson<BudgetAiResponse>({
    endpoint: '/api/ai/budget',
    payload: { config: sanitizeEventConfig(config) },
    channel: 'budget',
  });
}

/**
 * @description Generates backwards-planned countdown milestones and chronological Day-Of itinerary slots.
 * @param {EventConfig} config - Event configuration parameters
 * @returns {Promise<TimelineAiResponse>} Timeline response
 */
export async function fetchTimeline(config: EventConfig): Promise<TimelineAiResponse> {
  return postCachedJson<TimelineAiResponse>({
    endpoint: '/api/ai/timeline',
    payload: { config: sanitizeEventConfig(config) },
    channel: 'timeline',
  });
}

/**
 * @description Generates 5 specific vendor vetting questions and 3 contract red flags.
 * @param {EventConfig} config - Event configuration parameters
 * @param {Pick<VendorItem, 'category' | 'roleDescription' | 'quotedPrice'>} vendor - Target vendor descriptor
 * @returns {Promise<VendorVettingAiResponse>} Vetting questions and red flags
 */
export async function fetchVendorVetting(
  config: EventConfig,
  vendor: Pick<VendorItem, 'category' | 'roleDescription' | 'quotedPrice'>
): Promise<VendorVettingAiResponse> {
  return postCachedJson<VendorVettingAiResponse>({
    endpoint: '/api/ai/vendor-questions',
    payload: {
      config: sanitizeEventConfig(config),
      vendorCategory: vendor.category,
      roleDescription: vendor.roleDescription,
      quotedPrice: vendor.quotedPrice,
    },
    channel: `vendor-${vendor.category}`,
  });
}

/**
 * @description Sends a contextual planning prompt to the Event Co-Pilot assistant.
 * @param {string} message - User prompt text
 * @param {EventPlanState} eventState - Active event state for grounding
 * @returns {Promise<CoPilotAiResponse>} Assistant reply payload
 */
export async function sendCoPilotMessage(message: string, eventState: EventPlanState): Promise<CoPilotAiResponse> {
  return postCachedJson<CoPilotAiResponse>({
    endpoint: '/api/ai/copilot',
    payload: { message, eventState },
    channel: 'copilot',
    bypassCache: true,
  });
}
