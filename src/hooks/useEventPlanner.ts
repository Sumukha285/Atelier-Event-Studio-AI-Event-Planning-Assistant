/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { DEBOUNCE_PERSIST_MS, STORAGE_KEY } from '../constants/event.constants';
import { EventActions, eventReducer, initEventState } from '../state/event.reducer';
import {
  ActiveView,
  BudgetCategoryItem,
  BudgetSummary,
  ChatMessage,
  CompleteBlueprintResponse,
  ConceptPackage,
  CountdownTask,
  EventConfig,
  EventPlanState,
  EventType,
  isValidBlueprint,
  ItineraryItem,
  TimelineStats,
  VendorItem,
} from '../types/event.types';
import { calculateBudgetMetrics, computeTimelineProgress } from '../utils/domain.utils';

export interface UseEventPlannerResult {
  readonly state: EventPlanState;
  readonly activeView: ActiveView;
  readonly sidebarCollapsed: boolean;
  readonly coPilotOpen: boolean;
  readonly exportModalOpen: boolean;
  readonly liveAnnouncement: string;
  readonly budgetSummary: BudgetSummary;
  readonly timelineStats: TimelineStats;
  readonly activeConcept: ConceptPackage | undefined;
  readonly setActiveView: (view: ActiveView) => void;
  readonly toggleSidebar: () => void;
  readonly openCoPilot: () => void;
  readonly closeCoPilot: () => void;
  readonly openExportModal: () => void;
  readonly closeExportModal: () => void;
  readonly announceStatus: (message: string) => void;
  readonly updateConfig: (nextConfig: EventConfig) => void;
  readonly switchPreset: (eventType: EventType) => void;
  readonly selectConcept: (concept: ConceptPackage) => void;
  readonly updateConcepts: (concepts: readonly ConceptPackage[]) => void;
  readonly applyBlueprint: (blueprint: CompleteBlueprintResponse) => void;
  readonly updateBudgetCategories: (categories: readonly BudgetCategoryItem[]) => void;
  readonly updateTotalBudget: (totalBudget: number) => void;
  readonly updateCountdown: (tasks: readonly CountdownTask[]) => void;
  readonly updateItinerary: (items: readonly ItineraryItem[]) => void;
  readonly updateVendors: (vendors: readonly VendorItem[]) => void;
  readonly appendChatMessage: (message: ChatMessage) => void;
  readonly resetCurrentPreset: () => void;
}

/** @description Custom React hook encapsulating the `useReducer` state machine, debounced `localStorage` persistence, and memoized dispatchers. */
export function useEventPlanner(): UseEventPlannerResult {
  const [state, dispatch] = useReducer(eventReducer, undefined, initEventState);
  const [activeView, setActiveView] = useState<ActiveView>('setup');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [coPilotOpen, setCoPilotOpen] = useState<boolean>(false);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('Atelier Event Studio ready.');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (isValidBlueprint(state)) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // Ignore storage quota restrictions
      }
    }, DEBOUNCE_PERSIST_MS);
    return () => window.clearTimeout(timer);
  }, [state]);

  const budgetSummary = useMemo(
    () => calculateBudgetMetrics(state.budgetCategories, state.config.totalBudget),
    [state.budgetCategories, state.config.totalBudget]
  );
  const timelineStats = useMemo(
    () => computeTimelineProgress(state.countdownTasks, state.itinerary),
    [state.countdownTasks, state.itinerary]
  );
  const activeConcept = useMemo(
    () => state.concepts.find((c) => c.id === state.selectedConceptId) ?? state.concepts[0],
    [state.concepts, state.selectedConceptId]
  );

  const toggleSidebar = useCallback((): void => setSidebarCollapsed((p) => !p), []);
  const openCoPilot = useCallback((): void => setCoPilotOpen(true), []);
  const closeCoPilot = useCallback((): void => setCoPilotOpen(false), []);
  const openExportModal = useCallback((): void => setExportModalOpen(true), []);
  const closeExportModal = useCallback((): void => setExportModalOpen(false), []);
  const announceStatus = useCallback((msg: string): void => setLiveAnnouncement(msg), []);
  const updateConfig = useCallback((cfg: EventConfig): void => dispatch(EventActions.updateConfig(cfg)), []);
  const switchPreset = useCallback((eventType: EventType): void => {
    dispatch(EventActions.switchPreset(eventType));
    setLiveAnnouncement(`Switched preset to ${eventType}.`);
  }, []);
  const selectConcept = useCallback((concept: ConceptPackage): void => {
    dispatch(EventActions.selectConcept(concept));
    setLiveAnnouncement(`Selected concept ${concept.title}.`);
  }, []);
  const updateConcepts = useCallback((concepts: readonly ConceptPackage[]): void => {
    dispatch(EventActions.updateConcepts(concepts));
    setLiveAnnouncement('Updated 3 AI concept packages.');
  }, []);
  const applyBlueprint = useCallback((bp: CompleteBlueprintResponse): void => {
    dispatch(EventActions.applyBlueprint(bp));
    setLiveAnnouncement('Synchronized complete AI event blueprint.');
  }, []);
  const updateBudgetCategories = useCallback((cats: readonly BudgetCategoryItem[]): void => dispatch(EventActions.updateBudgetCategories(cats)), []);
  const updateTotalBudget = useCallback((tot: number): void => dispatch(EventActions.updateTotalBudget(tot)), []);
  const updateCountdown = useCallback((tasks: readonly CountdownTask[]): void => dispatch(EventActions.updateCountdown(tasks)), []);
  const updateItinerary = useCallback((items: readonly ItineraryItem[]): void => dispatch(EventActions.updateItinerary(items)), []);
  const updateVendors = useCallback((vendors: readonly VendorItem[]): void => dispatch(EventActions.updateVendors(vendors)), []);
  const appendChatMessage = useCallback((msg: ChatMessage): void => dispatch(EventActions.appendChatMessage(msg)), []);
  const resetCurrentPreset = useCallback((): void => {
    dispatch(EventActions.switchPreset(state.config.eventType));
    setLiveAnnouncement(`Reset ${state.config.eventType} preset state.`);
  }, [state.config.eventType]);

  return {
    state, activeView, sidebarCollapsed, coPilotOpen, exportModalOpen, liveAnnouncement,
    budgetSummary, timelineStats, activeConcept, setActiveView, toggleSidebar, openCoPilot,
    closeCoPilot, openExportModal, closeExportModal, announceStatus, updateConfig,
    switchPreset, selectConcept, updateConcepts, applyBlueprint, updateBudgetCategories,
    updateTotalBudget, updateCountdown, updateItinerary, updateVendors, appendChatMessage,
    resetCurrentPreset,
  };
}
