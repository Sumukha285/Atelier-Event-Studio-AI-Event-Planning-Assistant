/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EventType = 'Wedding' | 'Birthday' | 'Community Event';

export type SettingType = 'Indoor' | 'Outdoor' | 'Hybrid / City';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export type MilestoneWindow =
  | '6 Months Out'
  | '3 Months Out'
  | '1 Month Out'
  | '1 Week Out'
  | '1 Day Before';

export type CoreBudgetCategoryName =
  | 'Venue'
  | 'Catering'
  | 'Decor'
  | 'Entertainment'
  | 'Photography'
  | 'Logistics'
  | 'Contingency';

export type BudgetCategoryName = CoreBudgetCategoryName | string;

export type VendorBookingStatus =
  | 'Researching'
  | 'Contacted'
  | 'Booked'
  | 'Paid';

export type VendorPriority = 'Essential' | 'Recommended' | 'Optional';

export type BudgetHealthLabel =
  | 'Under Budget'
  | 'Near Limit'
  | 'Over Budget'
  | 'Unspent';

export type ActiveView = 'setup' | 'budget' | 'timeline' | 'vendors';

export interface EventConfig {
  readonly eventType: EventType;
  readonly eventName: string;
  readonly date: string;
  readonly location: string;
  readonly setting: SettingType;
  readonly guestCount: number;
  readonly currency: CurrencyCode;
  readonly totalBudget: number;
  readonly themeVibe: string;
  readonly notes?: string;
}

export interface ColorSwatch {
  readonly name: string;
  readonly hex: string;
}

export interface ConceptPackage {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  readonly atmosphereDescription: string;
  readonly colorPalette: readonly ColorSwatch[];
  readonly decorIdeas: readonly string[];
  readonly entertainmentSuggestions: readonly string[];
  readonly cateringStyle: string;
  readonly signatureMoment: string;
}

export interface BudgetCategoryItem {
  readonly id: string;
  readonly category: BudgetCategoryName;
  readonly recommendedPercent: number;
  readonly estimatedCost: number;
  readonly actualSpent: number;
  readonly notes: string;
}

export interface CountdownTask {
  readonly id: string;
  readonly milestone: MilestoneWindow;
  readonly title: string;
  readonly category: string;
  readonly status: TaskStatus;
  readonly assigneeOrNote: string;
}

export interface ItineraryItem {
  readonly id: string;
  readonly timeSlot: string;
  readonly durationMinutes: number;
  readonly activity: string;
  readonly locationZone: string;
  readonly leadOwner: string;
  readonly status: TaskStatus;
  readonly notes: string;
}

export interface VendorItem {
  readonly id: string;
  readonly category: string;
  readonly roleDescription: string;
  readonly priority: VendorPriority;
  readonly bookingStatus: VendorBookingStatus;
  readonly vendorName: string;
  readonly quotedPrice: number;
  readonly contactInfo: string;
  readonly vettingQuestions: readonly string[];
  readonly contractRedFlags: readonly string[];
  readonly isPermitOrCompliance?: boolean;
}

export interface ChatMessage {
  readonly id: string;
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly timestamp: string;
}

export interface EventPlanState {
  readonly config: EventConfig;
  readonly concepts: readonly ConceptPackage[];
  readonly selectedConceptId: string | null;
  readonly budgetCategories: readonly BudgetCategoryItem[];
  readonly countdownTasks: readonly CountdownTask[];
  readonly itinerary: readonly ItineraryItem[];
  readonly vendors: readonly VendorItem[];
  readonly chatHistory: readonly ChatMessage[];
  readonly lastUpdated: string;
}

export interface CompleteBlueprintResponse {
  readonly concepts: readonly ConceptPackage[];
  readonly budgetCategories: readonly BudgetCategoryItem[];
  readonly countdownTasks: readonly CountdownTask[];
  readonly itinerary: readonly ItineraryItem[];
  readonly vendors: readonly VendorItem[];
  readonly source: 'gemini' | 'studio-engine';
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: Readonly<Record<string, string>>;
}

export interface BudgetSummary {
  readonly totalBudget: number;
  readonly totalEstimated: number;
  readonly totalActual: number;
  readonly unallocatedBudget: number;
  readonly remainingFromTotal: number;
  readonly varianceEstimatedVsActual: number;
  readonly estimatedPercentOfTotal: number;
  readonly actualPercentOfTotal: number;
  readonly overBudgetCount: number;
  readonly nearLimitCount: number;
}

export interface TimelineStats {
  readonly totalTasks: number;
  readonly completedCount: number;
  readonly inProgressCount: number;
  readonly pendingCount: number;
  readonly completionPercent: number;
  readonly itineraryCount: number;
  readonly itineraryCompletedCount: number;
  readonly itineraryCompletionPercent: number;
}

export type EventAction =
  | { readonly type: 'UPDATE_CONFIG'; readonly payload: EventConfig }
  | { readonly type: 'SWITCH_PRESET'; readonly payload: EventType }
  | { readonly type: 'SELECT_CONCEPT'; readonly payload: ConceptPackage }
  | { readonly type: 'UPDATE_CONCEPTS'; readonly payload: readonly ConceptPackage[] }
  | { readonly type: 'APPLY_BLUEPRINT'; readonly payload: CompleteBlueprintResponse }
  | { readonly type: 'UPDATE_BUDGET_CATEGORIES'; readonly payload: readonly BudgetCategoryItem[] }
  | { readonly type: 'UPDATE_TOTAL_BUDGET'; readonly payload: number }
  | { readonly type: 'UPDATE_COUNTDOWN'; readonly payload: readonly CountdownTask[] }
  | { readonly type: 'UPDATE_ITINERARY'; readonly payload: readonly ItineraryItem[] }
  | { readonly type: 'UPDATE_VENDORS'; readonly payload: readonly VendorItem[] }
  | { readonly type: 'APPEND_CHAT_MESSAGE'; readonly payload: ChatMessage }
  | { readonly type: 'HYDRATE_STATE'; readonly payload: EventPlanState };
