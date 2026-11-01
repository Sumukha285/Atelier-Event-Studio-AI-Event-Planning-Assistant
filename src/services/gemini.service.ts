/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { API_COOLDOWN_MS } from '../constants/event.constants';
import {
  BudgetCategoryItem,
  CompleteBlueprintResponse,
  ConceptPackage,
  CountdownTask,
  EventConfig,
  EventPlanState,
  ItineraryItem,
  VendorItem,
} from '../types/event.types';
import { computeRequestHash, sanitizeEventConfig } from '../utils/security.utils';

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

/** Declarative schema descriptors matching the server-side Gemini `responseSchema` contracts. */
export const RESPONSE_SCHEMA_DESCRIPTORS = {
  blueprint: ['concepts', 'budgetCategories', 'countdownTasks', 'itinerary', 'vendors'],
  brainstorm: ['concepts'],
  budget: ['categories'],
  timeline: ['countdownTasks', 'itinerary'],
  vendorQuestions: ['vettingQuestions', 'contractRedFlags'],
  copilot: ['reply'],
} as const;

const responseCache = new Map<string, unknown>();
const activeControllers = new Map<string, AbortController>();
let lastInvocationTimestamp = 0;

/**
 * Checks whether the client-side rate-limit cooldown window (`API_COOLDOWN_MS`) is currently active.
 * @param now - Current epoch timestamp in milliseconds
 * @returns Remaining cooldown milliseconds (0 if ready)
 */
export function getRemainingCooldownMs(now: number = Date.now()): number {
  const elapsed = now - lastInvocationTimestamp;
  return elapsed < API_COOLDOWN_MS ? API_COOLDOWN_MS - elapsed : 0;
}

/**
 * Aborts any in-flight request associated with the given operation channel and creates a fresh `AbortController`.
 * @param channel - Logical operation key
 * @returns Fresh `AbortController` instance
 */
export function createManagedAbortController(channel: string): AbortController {
  const existing = activeControllers.get(channel);
  if (existing) existing.abort();
  const controller = new AbortController();
  activeControllers.set(channel, controller);
  return controller;
}

/**
 * Aborts all currently active Gemini API requests across all channels.
 * @returns Void
 */
export function abortAllRequests(): void {
  for (const controller of activeControllers.values()) controller.abort();
  activeControllers.clear();
}

/**
 * Generic cached POST helper with `AbortController` and parameter hash deduplication.
 * @param endpoint - Server API route
 * @param payload - Request JSON payload
 * @param channel - AbortController channel identifier
 * @param bypassCache - Whether to force a fresh network call
 * @returns Parsed typed response
 */
async function postCachedJson<T>(
  endpoint: string,
  payload: Record<string, unknown>,
  channel: string,
  bypassCache: boolean = false
): Promise<T> {
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
    if (!response.ok) throw new Error(`AI service returned status ${response.status}`);
    const data = (await response.json()) as T;
    responseCache.set(cacheKey, data);
    return data;
  } finally {
    if (activeControllers.get(channel) === controller) activeControllers.delete(channel);
  }
}

/**
 * Generates a unified complete event blueprint (concepts, budget, countdown, itinerary, and vendors) in one call.
 * @param config - Event configuration parameters
 * @returns Complete blueprint payload
 */
export async function fetchCompleteBlueprint(config: EventConfig): Promise<CompleteBlueprintResponse> {
  return postCachedJson<CompleteBlueprintResponse>('/api/ai/blueprint', { config: sanitizeEventConfig(config) }, 'blueprint');
}

/**
 * Generates 3 tailored concept packages for the given event configuration.
 * @param config - Event configuration parameters
 * @returns Brainstorm response containing 3 `ConceptPackage` items
 */
export async function fetchConcepts(config: EventConfig): Promise<BrainstormResponse> {
  return postCachedJson<BrainstormResponse>('/api/ai/brainstorm', { config: sanitizeEventConfig(config) }, 'brainstorm');
}

/**
 * Generates an AI-optimized proportional budget breakdown across the 7 core categories.
 * @param config - Event configuration parameters
 * @returns AI budget allocation response
 */
export async function fetchBudgetAllocation(config: EventConfig): Promise<BudgetAiResponse> {
  return postCachedJson<BudgetAiResponse>('/api/ai/budget', { config: sanitizeEventConfig(config) }, 'budget');
}

/**
 * Generates backwards-planned countdown tasks and a chronological Day-Of itinerary.
 * @param config - Event configuration parameters
 * @returns AI timeline response
 */
export async function fetchTimeline(config: EventConfig): Promise<TimelineAiResponse> {
  return postCachedJson<TimelineAiResponse>('/api/ai/timeline', { config: sanitizeEventConfig(config) }, 'timeline');
}

/**
 * Generates 5 vendor-specific vetting questions and 3 contract red flags.
 * @param config - Event configuration parameters
 * @param vendor - Target vendor item
 * @returns Vetting questions and red flags
 */
export async function fetchVendorVetting(
  config: EventConfig,
  vendor: Pick<VendorItem, 'category' | 'roleDescription' | 'quotedPrice'>
): Promise<VendorVettingAiResponse> {
  return postCachedJson<VendorVettingAiResponse>(
    '/api/ai/vendor-questions',
    { config: sanitizeEventConfig(config), vendorCategory: vendor.category, roleDescription: vendor.roleDescription, quotedPrice: vendor.quotedPrice },
    `vendor-${vendor.category}`
  );
}

/**
 * Sends a contextual planning prompt to the Event Co-Pilot assistant.
 * @param message - User prompt text
 * @param eventState - Current full event state for grounding
 * @returns Assistant reply payload
 */
export async function sendCoPilotMessage(message: string, eventState: EventPlanState): Promise<CoPilotAiResponse> {
  return postCachedJson<CoPilotAiResponse>('/api/ai/copilot', { message, eventState }, 'copilot', true);
}
