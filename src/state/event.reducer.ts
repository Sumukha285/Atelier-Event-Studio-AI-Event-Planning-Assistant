/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { STORAGE_KEY } from '../constants/event.constants';
import { createInitialEventState } from '../data/presets';
import {
  BudgetCategoryItem,
  ChatMessage,
  CompleteBlueprintResponse,
  ConceptPackage,
  CountdownTask,
  EventAction,
  EventConfig,
  EventPlanState,
  EventType,
  ItineraryItem,
  VendorItem,
} from '../types/event.types';
import { calculateBudgetAllocation, sanitizeEventConfig, validateAndHydrateState } from '../utils/eventLogic';

/**
 * Initializes the application state from `localStorage` if valid, falling back to the default Wedding preset.
 * @returns Hydrated initial `EventPlanState`
 */
export function initEventState(): EventPlanState {
  if (typeof window === 'undefined') return createInitialEventState('Wedding');
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialEventState('Wedding');
    const hydrated = validateAndHydrateState(JSON.parse(raw) as unknown);
    return hydrated ?? createInitialEventState('Wedding');
  } catch {
    return createInitialEventState('Wedding');
  }
}

/**
 * Applies a configuration update while proportionally recalculating budget estimates if budget or type changed.
 * @param state - Current event plan state
 * @param nextConfig - Updated event configuration
 * @returns Updated `EventPlanState`
 */
function applyConfigUpdate(state: EventPlanState, nextConfig: EventConfig): EventPlanState {
  const safeConfig = sanitizeEventConfig(nextConfig);
  const changed = safeConfig.totalBudget !== state.config.totalBudget || safeConfig.eventType !== state.config.eventType;
  const budgetCategories = changed
    ? calculateBudgetAllocation(safeConfig.totalBudget, safeConfig.eventType, state.budgetCategories)
    : state.budgetCategories;
  return { ...state, config: safeConfig, budgetCategories, lastUpdated: new Date().toISOString() };
}

/**
 * Pure reducer managing all `EventPlanState` transitions deterministically.
 * @param state - Current immutable `EventPlanState`
 * @param action - Dispatched discriminated union `EventAction`
 * @returns Next immutable `EventPlanState`
 */
export function eventReducer(state: EventPlanState, action: EventAction): EventPlanState {
  const now = new Date().toISOString();
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return applyConfigUpdate(state, action.payload);
    case 'SWITCH_PRESET':
      return createInitialEventState(action.payload);
    case 'SELECT_CONCEPT':
      return {
        ...state,
        selectedConceptId: action.payload.id,
        config: { ...state.config, themeVibe: `${action.payload.title} — ${action.payload.tagline}` },
        lastUpdated: now,
      };
    case 'UPDATE_CONCEPTS':
      return {
        ...state,
        concepts: action.payload,
        selectedConceptId: action.payload[0]?.id ?? state.selectedConceptId,
        lastUpdated: now,
      };
    case 'APPLY_BLUEPRINT':
      return {
        ...state,
        concepts: action.payload.concepts,
        selectedConceptId: action.payload.concepts[0]?.id ?? state.selectedConceptId,
        budgetCategories: action.payload.budgetCategories,
        countdownTasks: action.payload.countdownTasks,
        itinerary: action.payload.itinerary,
        vendors: action.payload.vendors,
        lastUpdated: now,
      };
    case 'UPDATE_BUDGET_CATEGORIES':
      return { ...state, budgetCategories: action.payload, lastUpdated: now };
    case 'UPDATE_TOTAL_BUDGET':
      return { ...state, config: { ...state.config, totalBudget: action.payload }, lastUpdated: now };
    case 'UPDATE_COUNTDOWN':
      return { ...state, countdownTasks: action.payload, lastUpdated: now };
    case 'UPDATE_ITINERARY':
      return { ...state, itinerary: action.payload, lastUpdated: now };
    case 'UPDATE_VENDORS':
      return { ...state, vendors: action.payload, lastUpdated: now };
    case 'APPEND_CHAT_MESSAGE':
      return { ...state, chatHistory: [...state.chatHistory, action.payload], lastUpdated: now };
    case 'HYDRATE_STATE':
      return action.payload;
    default:
      return state;
  }
}

/**
 * Strictly typed action creators for `eventReducer`.
 */
export const EventActions = {
  updateConfig: (payload: EventConfig): EventAction => ({ type: 'UPDATE_CONFIG', payload }),
  switchPreset: (payload: EventType): EventAction => ({ type: 'SWITCH_PRESET', payload }),
  selectConcept: (payload: ConceptPackage): EventAction => ({ type: 'SELECT_CONCEPT', payload }),
  updateConcepts: (payload: readonly ConceptPackage[]): EventAction => ({ type: 'UPDATE_CONCEPTS', payload }),
  applyBlueprint: (payload: CompleteBlueprintResponse): EventAction => ({ type: 'APPLY_BLUEPRINT', payload }),
  updateBudgetCategories: (payload: readonly BudgetCategoryItem[]): EventAction => ({ type: 'UPDATE_BUDGET_CATEGORIES', payload }),
  updateTotalBudget: (payload: number): EventAction => ({ type: 'UPDATE_TOTAL_BUDGET', payload }),
  updateCountdown: (payload: readonly CountdownTask[]): EventAction => ({ type: 'UPDATE_COUNTDOWN', payload }),
  updateItinerary: (payload: readonly ItineraryItem[]): EventAction => ({ type: 'UPDATE_ITINERARY', payload }),
  updateVendors: (payload: readonly VendorItem[]): EventAction => ({ type: 'UPDATE_VENDORS', payload }),
  appendChatMessage: (payload: ChatMessage): EventAction => ({ type: 'APPEND_CHAT_MESSAGE', payload }),
} as const;
