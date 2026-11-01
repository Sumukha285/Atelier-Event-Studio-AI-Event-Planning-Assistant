/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MAX_BUDGET_LIMIT, STORAGE_KEY } from '../constants/event.constants';
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
  isValidBlueprint,
  ItineraryItem,
  TaskStatus,
  VendorBookingStatus,
  VendorItem,
} from '../types/event.types';
import { calculateBudgetAllocation } from '../utils/domain.utils';
import { clampNumber, roundToDollar, sanitizeEventConfig, validateAndHydrateState } from '../utils/security.utils';

const STATUS_CYCLE_MAP: Readonly<Record<TaskStatus, TaskStatus>> = {
  Pending: 'Completed',
  'In Progress': 'Completed',
  Completed: 'Pending',
};

/**
 * @description Initializes the application state from `localStorage` if valid, falling back to the default Wedding preset.
 * @returns {EventPlanState} Hydrated initial `EventPlanState`
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
 * @description Applies a configuration update and proportionally recalculates budget estimates when total or archetype changes.
 * @param {EventPlanState} state - Current event state
 * @param {EventConfig} nextConfig - Next event configuration
 * @returns {EventPlanState} Updated state
 */
function handleUpdateConfig(state: EventPlanState, nextConfig: EventConfig): EventPlanState {
  const safeConfig = sanitizeEventConfig(nextConfig);
  const changed = safeConfig.totalBudget !== state.config.totalBudget || safeConfig.eventType !== state.config.eventType;
  const budgetCategories = changed
    ? calculateBudgetAllocation(safeConfig.totalBudget, safeConfig.eventType, state.budgetCategories)
    : state.budgetCategories;
  return { ...state, config: safeConfig, budgetCategories, lastUpdated: new Date().toISOString() };
}

/**
 * @description Applies a validated `CompleteBlueprintResponse` to the state.
 * @param {EventPlanState} state - Current event state
 * @param {CompleteBlueprintResponse} blueprint - Validated blueprint payload
 * @returns {EventPlanState} Updated state
 */
function handleHydrateBlueprint(state: EventPlanState, blueprint: CompleteBlueprintResponse): EventPlanState {
  if (!isValidBlueprint(blueprint)) return state;
  return {
    ...state,
    concepts: blueprint.concepts,
    selectedConceptId: blueprint.concepts[0]?.id ?? state.selectedConceptId,
    budgetCategories: blueprint.budgetCategories,
    countdownTasks: blueprint.countdownTasks,
    itinerary: blueprint.itinerary,
    vendors: blueprint.vendors,
    lastUpdated: new Date().toISOString(),
  };
}

type ActionHandlerMap = {
  readonly [K in EventAction['type']]: (
    state: EventPlanState,
    action: Extract<EventAction, { readonly type: K }>
  ) => EventPlanState;
};

const ACTION_HANDLERS: ActionHandlerMap = {
  UPDATE_CONFIG: (state, action) => handleUpdateConfig(state, action.payload),
  SWITCH_PRESET: (_state, action) => createInitialEventState(action.payload),
  SELECT_CONCEPT: (state, action) => ({
    ...state,
    selectedConceptId: action.payload.id,
    config: { ...state.config, themeVibe: `${action.payload.title} — ${action.payload.tagline}` },
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_CONCEPTS: (state, action) => ({
    ...state,
    concepts: action.payload,
    selectedConceptId: action.payload[0]?.id ?? state.selectedConceptId,
    lastUpdated: new Date().toISOString(),
  }),
  APPLY_BLUEPRINT: (state, action) => handleHydrateBlueprint(state, action.payload),
  HYDRATE_BLUEPRINT: (state, action) => handleHydrateBlueprint(state, action.payload),
  UPDATE_BUDGET_CATEGORIES: (state, action) => ({
    ...state,
    budgetCategories: action.payload,
    lastUpdated: new Date().toISOString(),
  }),
  ADD_BUDGET_ITEM: (state, action) => ({
    ...state,
    budgetCategories: [...state.budgetCategories, action.payload],
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_ACTUAL_COST: (state, action) => ({
    ...state,
    budgetCategories: state.budgetCategories.map((item) =>
      item.id === action.payload.id
        ? { ...item, actualSpent: roundToDollar(clampNumber(action.payload.actualSpent, 0, MAX_BUDGET_LIMIT)) }
        : item
    ),
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_TOTAL_BUDGET: (state, action) => ({
    ...state,
    config: { ...state.config, totalBudget: roundToDollar(clampNumber(action.payload, 0, MAX_BUDGET_LIMIT)) },
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_COUNTDOWN: (state, action) => ({
    ...state,
    countdownTasks: action.payload,
    lastUpdated: new Date().toISOString(),
  }),
  TOGGLE_TIMELINE_TASK: (state, action) => ({
    ...state,
    countdownTasks: state.countdownTasks.map((task) =>
      task.id === action.payload ? { ...task, status: STATUS_CYCLE_MAP[task.status] } : task
    ),
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_ITINERARY: (state, action) => ({
    ...state,
    itinerary: action.payload,
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_VENDORS: (state, action) => ({
    ...state,
    vendors: action.payload,
    lastUpdated: new Date().toISOString(),
  }),
  UPDATE_VENDOR_STATUS: (state, action) => ({
    ...state,
    vendors: state.vendors.map((v) =>
      v.id === action.payload.id ? { ...v, bookingStatus: action.payload.bookingStatus } : v
    ),
    lastUpdated: new Date().toISOString(),
  }),
  APPEND_CHAT_MESSAGE: (state, action) => ({
    ...state,
    chatHistory: [...state.chatHistory, action.payload],
    lastUpdated: new Date().toISOString(),
  }),
  HYDRATE_STATE: (_state, action) => action.payload,
};

/**
 * @description Pure lookup-driven reducer managing all `EventPlanState` transitions with cyclomatic complexity <= 2.
 * @param {EventPlanState} state - Current immutable `EventPlanState`
 * @param {EventAction} action - Dispatched discriminated union `EventAction`
 * @returns {EventPlanState} Next immutable `EventPlanState`
 */
export function eventReducer(state: EventPlanState, action: EventAction): EventPlanState {
  const handler = ACTION_HANDLERS[action.type] as (s: EventPlanState, a: EventAction) => EventPlanState;
  return handler ? handler(state, action) : state;
}

/** Strictly typed action creators for `eventReducer`. */
export const EventActions = {
  updateConfig: (payload: EventConfig): EventAction => ({ type: 'UPDATE_CONFIG', payload }),
  switchPreset: (payload: EventType): EventAction => ({ type: 'SWITCH_PRESET', payload }),
  selectConcept: (payload: ConceptPackage): EventAction => ({ type: 'SELECT_CONCEPT', payload }),
  updateConcepts: (payload: readonly ConceptPackage[]): EventAction => ({ type: 'UPDATE_CONCEPTS', payload }),
  applyBlueprint: (payload: CompleteBlueprintResponse): EventAction => ({ type: 'APPLY_BLUEPRINT', payload }),
  hydrateBlueprint: (payload: CompleteBlueprintResponse): EventAction => ({ type: 'HYDRATE_BLUEPRINT', payload }),
  updateBudgetCategories: (payload: readonly BudgetCategoryItem[]): EventAction => ({ type: 'UPDATE_BUDGET_CATEGORIES', payload }),
  addBudgetItem: (payload: BudgetCategoryItem): EventAction => ({ type: 'ADD_BUDGET_ITEM', payload }),
  updateActualCost: (id: string, actualSpent: number): EventAction => ({ type: 'UPDATE_ACTUAL_COST', payload: { id, actualSpent } }),
  updateTotalBudget: (payload: number): EventAction => ({ type: 'UPDATE_TOTAL_BUDGET', payload }),
  updateCountdown: (payload: readonly CountdownTask[]): EventAction => ({ type: 'UPDATE_COUNTDOWN', payload }),
  toggleTimelineTask: (payload: string): EventAction => ({ type: 'TOGGLE_TIMELINE_TASK', payload }),
  updateItinerary: (payload: readonly ItineraryItem[]): EventAction => ({ type: 'UPDATE_ITINERARY', payload }),
  updateVendors: (payload: readonly VendorItem[]): EventAction => ({ type: 'UPDATE_VENDORS', payload }),
  updateVendorStatus: (id: string, bookingStatus: VendorBookingStatus): EventAction => ({ type: 'UPDATE_VENDOR_STATUS', payload: { id, bookingStatus } }),
  appendChatMessage: (payload: ChatMessage): EventAction => ({ type: 'APPEND_CHAT_MESSAGE', payload }),
} as const;
