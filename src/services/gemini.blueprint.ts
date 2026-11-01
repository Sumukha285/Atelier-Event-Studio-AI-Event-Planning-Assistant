/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import {
  BudgetCategoryItem,
  CompleteBlueprintResponse,
  ConceptPackage,
  EventConfig,
  EventPlanState,
  VendorItem,
  VendorPriority,
} from '../types/event.types';
import {
  BUDGET_CATEGORIES,
  buildCompactPromptContext,
  calculateBudgetAllocation,
  formatCurrency,
  sanitizeText,
  wrapXmlSandbox,
} from '../utils/eventLogic';
import {
  buildFallbackConcepts,
  buildFallbackCoPilotReply,
  buildFallbackTimeline,
  buildFallbackVendors,
} from './gemini.fallback';
import { COMPLETE_BLUEPRINT_SCHEMA, SECURITY_SYSTEM_GUARDRAIL } from './gemini.schemas';

export const GEMINI_MODEL_ID = 'gemini-3-flash-preview';

/**
 * Instantiates the server-side `GoogleGenAI` SDK client if a valid API key is present.
 * @returns `GoogleGenAI` client instance or `null`
 */
export function getGenAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') return null;
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'aistudio-build' } } });
}

/**
 * Normalizes AI-returned budget items so all 7 core categories exist and sum strictly to `totalBudget`.
 * @param rawItems - Raw category items returned from Gemini
 * @param config - Sanitized event configuration
 * @returns Normalized `BudgetCategoryItem[]`
 */
export function normalizeBudgetCategories(
  rawItems: ReadonlyArray<Record<string, unknown>>,
  config: EventConfig
): BudgetCategoryItem[] {
  const fallback = calculateBudgetAllocation(config.totalBudget, config.eventType);
  let sum = 0;
  return BUDGET_CATEGORIES.map((category, idx): BudgetCategoryItem => {
    const match = rawItems.find(
      (item) => typeof item.category === 'string' && item.category.toLowerCase().includes(category.toLowerCase())
    );
    const defaultItem = fallback[idx];
    const pct =
      match && Number.isFinite(Number(match.recommendedPercent))
        ? Math.max(2, Math.min(60, Math.round(Number(match.recommendedPercent))))
        : defaultItem.recommendedPercent;
    const isLast = idx === BUDGET_CATEGORIES.length - 1;
    const est = isLast ? Math.max(0, config.totalBudget - sum) : Math.round((config.totalBudget * pct) / 100);
    sum += est;
    return {
      id: `budget-${category.toLowerCase()}`,
      category,
      recommendedPercent: pct,
      estimatedCost: est,
      actualSpent: 0,
      notes: sanitizeText(match?.notes, 200) || defaultItem.notes,
    };
  });
}

/**
 * Generates a unified complete blueprint in a single Gemini call (or fallback synthesis).
 * @param config - Sanitized event configuration
 * @returns Complete blueprint payload
 */
export async function generateBlueprintServer(config: EventConfig): Promise<CompleteBlueprintResponse> {
  const ai = getGenAIClient();
  const fallbackTl = buildFallbackTimeline(config);
  const fallbackResult: CompleteBlueprintResponse = {
    concepts: buildFallbackConcepts(config),
    budgetCategories: calculateBudgetAllocation(config.totalBudget, config.eventType),
    countdownTasks: fallbackTl.countdownTasks,
    itinerary: fallbackTl.itinerary,
    vendors: buildFallbackVendors(config),
    source: 'studio-engine',
  };
  if (!ai) return fallbackResult;
  try {
    const prompt = `Generate a complete Event Planning Blueprint (3 concepts, 7 budgetCategories, 10 countdownTasks, 7 itinerary slots, and 4 vendors):\n<user_event_input>\n${buildCompactPromptContext(config)}\n</user_event_input>`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SECURITY_SYSTEM_GUARDRAIL,
        responseMimeType: 'application/json',
        responseSchema: COMPLETE_BLUEPRINT_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || '{}') as Record<string, unknown>;
    const conceptsRes =
      Array.isArray(parsed.concepts) && parsed.concepts.length > 0
        ? (parsed.concepts as ConceptPackage[]).slice(0, 3).map((c, i) => ({ ...c, id: `concept-${Date.now()}-${i + 1}` }))
        : fallbackResult.concepts;
    const budgetCategories = normalizeBudgetCategories((parsed.budgetCategories as Array<Record<string, unknown>>) ?? [], config);
    const vendors: readonly VendorItem[] =
      Array.isArray(parsed.vendors) && parsed.vendors.length > 0
        ? (parsed.vendors as Array<Record<string, unknown>>).slice(0, 5).map((v, i) => ({
            id: `vendor-${Date.now()}-${i}`,
            category: sanitizeText(v.category, 80) || 'Vendor Partner',
            roleDescription: sanitizeText(v.roleDescription, 180),
            priority: (['Essential', 'Recommended', 'Optional'].includes(String(v.priority)) ? v.priority : 'Essential') as VendorPriority,
            bookingStatus: 'Researching',
            vendorName: '',
            quotedPrice: Math.max(0, Math.round(Number(v.quotedPrice) || 2500)),
            contactInfo: '',
            isPermitOrCompliance: Boolean(v.isPermitOrCompliance),
            vettingQuestions: Array.isArray(v.vettingQuestions) ? v.vettingQuestions.slice(0, 5).map((q) => sanitizeText(q, 180)) : [],
            contractRedFlags: Array.isArray(v.contractRedFlags) ? v.contractRedFlags.slice(0, 3).map((r) => sanitizeText(r, 180)) : [],
          }))
        : fallbackResult.vendors;
    return {
      concepts: conceptsRes,
      budgetCategories,
      countdownTasks: fallbackTl.countdownTasks,
      itinerary: fallbackTl.itinerary,
      vendors,
      source: 'gemini',
    };
  } catch {
    return fallbackResult;
  }
}

/**
 * Generates a contextual Event Co-Pilot reply grounded in the current event state.
 * @param message - User prompt
 * @param state - Full event plan state
 * @returns Assistant reply and source
 */
export async function generateCoPilotServer(
  message: string,
  state: EventPlanState
): Promise<{ readonly reply: string; readonly source: 'gemini' | 'studio-engine' }> {
  const ai = getGenAIClient();
  const safeMsg = sanitizeText(message, 500);
  if (!ai) return { reply: buildFallbackCoPilotReply(safeMsg, state), source: 'studio-engine' };
  try {
    const prompt = `${buildCompactPromptContext(state.config)}\n${wrapXmlSandbox('user_query', safeMsg)}\nRespond concisely with actionable event planning advice or a ready-to-send vendor email draft using Markdown bullet points and bold labels.`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: `${SECURITY_SYSTEM_GUARDRAIL} You are the Atelier Event Co-Pilot, an executive event producer for Weddings, Birthdays, and Community Events. Keep responses concise, practical, and numerically grounded in ${formatCurrency(state.config.totalBudget, state.config.currency)}.`,
      },
    });
    return { reply: response.text || buildFallbackCoPilotReply(safeMsg, state), source: 'gemini' };
  } catch {
    return { reply: buildFallbackCoPilotReply(safeMsg, state), source: 'studio-engine' };
  }
}
