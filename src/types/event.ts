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

export interface EventConfig {
  eventType: EventType;
  eventName: string;
  date: string;
  location: string;
  setting: SettingType;
  guestCount: number;
  currency: CurrencyCode;
  totalBudget: number;
  themeVibe: string;
  notes?: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ConceptPackage {
  id: string;
  title: string;
  tagline: string;
  atmosphereDescription: string;
  colorPalette: ColorSwatch[];
  decorIdeas: string[];
  entertainmentSuggestions: string[];
  cateringStyle: string;
  signatureMoment: string;
}

export interface BudgetCategoryItem {
  id: string;
  category: BudgetCategoryName;
  recommendedPercent: number;
  estimatedCost: number;
  actualSpent: number;
  notes: string;
}

export interface CountdownTask {
  id: string;
  milestone: MilestoneWindow;
  title: string;
  category: string;
  status: TaskStatus;
  assigneeOrNote: string;
}

export interface ItineraryItem {
  id: string;
  timeSlot: string;
  durationMinutes: number;
  activity: string;
  locationZone: string;
  leadOwner: string;
  status: TaskStatus;
  notes: string;
}

export interface VendorItem {
  id: string;
  category: string;
  roleDescription: string;
  priority: 'Essential' | 'Recommended' | 'Optional';
  bookingStatus: VendorBookingStatus;
  vendorName: string;
  quotedPrice: number;
  contactInfo: string;
  vettingQuestions: string[];
  contractRedFlags: string[];
  isPermitOrCompliance?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface EventPlanState {
  config: EventConfig;
  concepts: ConceptPackage[];
  selectedConceptId: string | null;
  budgetCategories: BudgetCategoryItem[];
  countdownTasks: CountdownTask[];
  itinerary: ItineraryItem[];
  vendors: VendorItem[];
  chatHistory: ChatMessage[];
  lastUpdated: string;
}

export interface CompleteBlueprintResponse {
  concepts: ConceptPackage[];
  budgetCategories: BudgetCategoryItem[];
  countdownTasks: CountdownTask[];
  itinerary: ItineraryItem[];
  vendors: VendorItem[];
  source: 'gemini' | 'studio-engine';
}
