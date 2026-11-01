/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BudgetCategoryItem, ConceptPackage, CountdownTask, EventConfig, ItineraryItem, MilestoneWindow } from '../types/event.types';
import { buildCompactPromptContext, calculateBudgetAllocation, MILESTONE_WINDOWS, sanitizeText, wrapXmlSandbox } from '../utils/eventLogic';
import { GEMINI_MODEL_ID, generateBlueprintServer, generateCoPilotServer, getGenAIClient, normalizeBudgetCategories } from './gemini.blueprint';
import { buildFallbackConcepts, buildFallbackTimeline, buildFallbackVendorVetting } from './gemini.fallback';
import { BUDGET_RESPONSE_SCHEMA, CONCEPTS_RESPONSE_SCHEMA, SECURITY_SYSTEM_GUARDRAIL, TIMELINE_RESPONSE_SCHEMA, VENDOR_VETTING_SCHEMA } from './gemini.schemas';

export { generateBlueprintServer, generateCoPilotServer, getGenAIClient };

/**
 * Generates 3 tailored event concepts via Gemini with deterministic fallback.
 * @param config - Sanitized event configuration
 * @returns Concepts array and source indicator
 */
export async function generateBrainstormServer(config: EventConfig): Promise<{
  readonly concepts: ConceptPackage[];
  readonly source: 'gemini' | 'studio-engine';
}> {
  const ai = getGenAIClient();
  if (!ai) return { concepts: buildFallbackConcepts(config), source: 'studio-engine' };
  try {
    const prompt = `Generate 3 distinct, creative event concept packages tailored to:\n<user_event_input>\n${buildCompactPromptContext(config)}\n</user_event_input>`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SECURITY_SYSTEM_GUARDRAIL,
        responseMimeType: 'application/json',
        responseSchema: CONCEPTS_RESPONSE_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || '{}') as { concepts?: Array<Omit<ConceptPackage, 'id'>> };
    if (!Array.isArray(parsed.concepts) || parsed.concepts.length === 0) {
      return { concepts: buildFallbackConcepts(config), source: 'studio-engine' };
    }
    const concepts: ConceptPackage[] = parsed.concepts.slice(0, 3).map((c, i) => ({
      id: `concept-${Date.now()}-${i + 1}`,
      title: sanitizeText(c.title, 90) || `Concept ${i + 1}`,
      tagline: sanitizeText(c.tagline, 140),
      atmosphereDescription: sanitizeText(c.atmosphereDescription, 320),
      colorPalette: (c.colorPalette ?? []).slice(0, 4).map((sw) => ({
        name: sanitizeText(sw.name, 40) || 'Accent',
        hex: /^#[0-9A-Fa-f]{6}$/.test(sw.hex) ? sw.hex : '#1E293B',
      })),
      decorIdeas: (c.decorIdeas ?? []).slice(0, 4).map((d) => sanitizeText(d, 160)),
      entertainmentSuggestions: (c.entertainmentSuggestions ?? []).slice(0, 4).map((e) => sanitizeText(e, 160)),
      cateringStyle: sanitizeText(c.cateringStyle, 260),
      signatureMoment: sanitizeText(c.signatureMoment, 220),
    }));
    return { concepts, source: 'gemini' };
  } catch {
    return { concepts: buildFallbackConcepts(config), source: 'studio-engine' };
  }
}

/**
 * Generates an AI budget breakdown across the 7 core categories.
 * @param config - Sanitized event configuration
 * @returns Budget categories and source indicator
 */
export async function generateBudgetServer(config: EventConfig): Promise<{
  readonly categories: BudgetCategoryItem[];
  readonly source: 'gemini' | 'studio-engine';
}> {
  const ai = getGenAIClient();
  if (!ai) {
    return { categories: calculateBudgetAllocation(config.totalBudget, config.eventType), source: 'studio-engine' };
  }
  try {
    const prompt = `Allocate total budget across Venue, Catering, Decor, Entertainment, Photography, Logistics, Contingency:\n<user_event_input>\n${buildCompactPromptContext(config)}\n</user_event_input>`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SECURITY_SYSTEM_GUARDRAIL,
        responseMimeType: 'application/json',
        responseSchema: BUDGET_RESPONSE_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || '{}') as { categories?: Array<Record<string, unknown>> };
    return { categories: normalizeBudgetCategories(parsed.categories ?? [], config), source: 'gemini' };
  } catch {
    return { categories: calculateBudgetAllocation(config.totalBudget, config.eventType), source: 'studio-engine' };
  }
}

/**
 * Generates countdown milestones and Day-Of itinerary slots.
 * @param config - Sanitized event configuration
 * @returns Countdown tasks, itinerary, and source indicator
 */
export async function generateTimelineServer(config: EventConfig): Promise<{
  readonly countdownTasks: CountdownTask[];
  readonly itinerary: ItineraryItem[];
  readonly source: 'gemini' | 'studio-engine';
}> {
  const ai = getGenAIClient();
  if (!ai) return { ...buildFallbackTimeline(config), source: 'studio-engine' };
  try {
    const prompt = `Generate 10 countdown tasks and 7 chronological Day-Of itinerary slots:\n<user_event_input>\n${buildCompactPromptContext(config)}\n</user_event_input>`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SECURITY_SYSTEM_GUARDRAIL,
        responseMimeType: 'application/json',
        responseSchema: TIMELINE_RESPONSE_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || '{}') as {
      countdownTasks?: Array<Record<string, unknown>>;
      itinerary?: Array<Record<string, unknown>>;
    };
    const fb = buildFallbackTimeline(config);
    const countdownTasks: CountdownTask[] =
      Array.isArray(parsed.countdownTasks) && parsed.countdownTasks.length > 0
        ? parsed.countdownTasks.map((t, i) => ({
            id: `task-${Date.now()}-${i}`,
            milestone: MILESTONE_WINDOWS.includes(t.milestone as MilestoneWindow) ? (t.milestone as MilestoneWindow) : MILESTONE_WINDOWS[i % MILESTONE_WINDOWS.length],
            title: sanitizeText(t.title, 140) || 'Milestone Deliverable',
            category: sanitizeText(t.category, 40) || 'Logistics',
            status: 'Pending',
            assigneeOrNote: sanitizeText(t.assigneeOrNote, 120),
          }))
        : fb.countdownTasks;
    const itinerary: ItineraryItem[] =
      Array.isArray(parsed.itinerary) && parsed.itinerary.length > 0
        ? parsed.itinerary.map((s, i) => ({
            id: `itin-${Date.now()}-${i}`,
            timeSlot: sanitizeText(s.timeSlot, 10) || '18:00',
            durationMinutes: Math.max(15, Math.min(360, Number(s.durationMinutes) || 60)),
            activity: sanitizeText(s.activity, 140) || 'Scheduled Activity',
            locationZone: sanitizeText(s.locationZone, 80) || 'Main Zone',
            leadOwner: sanitizeText(s.leadOwner, 60) || 'Coordinator',
            status: 'Pending',
            notes: sanitizeText(s.notes, 160),
          }))
        : fb.itinerary;
    return { countdownTasks, itinerary, source: 'gemini' };
  } catch {
    return { ...buildFallbackTimeline(config), source: 'studio-engine' };
  }
}

/**
 * Generates 5 vendor vetting questions and 3 contract red flags.
 * @param config - Sanitized event configuration
 * @param vendorCategory - Target vendor category name
 * @param roleDescription - Target vendor scope
 * @returns Vetting questions, red flags, and source indicator
 */
export async function generateVendorVettingServer(
  config: EventConfig,
  vendorCategory: string,
  roleDescription: string
): Promise<{
  readonly vettingQuestions: string[];
  readonly contractRedFlags: string[];
  readonly source: 'gemini' | 'studio-engine';
}> {
  const ai = getGenAIClient();
  const safeCat = sanitizeText(vendorCategory, 80) || 'Event Vendor';
  if (!ai) return { ...buildFallbackVendorVetting(config, safeCat), source: 'studio-engine' };
  try {
    const prompt = `Generate 5 specific vetting questions and 3 contract red flags for vendor category ${wrapXmlSandbox('vendor_category', safeCat)} (${wrapXmlSandbox('role', roleDescription)}):\n<user_event_input>\n${buildCompactPromptContext(config)}\n</user_event_input>`;
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SECURITY_SYSTEM_GUARDRAIL,
        responseMimeType: 'application/json',
        responseSchema: VENDOR_VETTING_SCHEMA,
      },
    });
    const parsed = JSON.parse(response.text || '{}') as { vettingQuestions?: string[]; contractRedFlags?: string[] };
    const fb = buildFallbackVendorVetting(config, safeCat);
    return {
      vettingQuestions: Array.isArray(parsed.vettingQuestions) && parsed.vettingQuestions.length > 0 ? parsed.vettingQuestions.slice(0, 5).map((q) => sanitizeText(q, 200)) : fb.vettingQuestions,
      contractRedFlags: Array.isArray(parsed.contractRedFlags) && parsed.contractRedFlags.length > 0 ? parsed.contractRedFlags.slice(0, 4).map((r) => sanitizeText(r, 200)) : fb.contractRedFlags,
      source: 'gemini',
    };
  } catch {
    return { ...buildFallbackVendorVetting(config, safeCat), source: 'studio-engine' };
  }
}
