/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CoreBudgetCategoryName,
  CurrencyCode,
  EventType,
  EventTypeLabel,
  MilestoneWindow,
  SettingType,
  TaskStatus,
  VendorBookingStatus,
  VendorPriority,
} from '../types/event.types';

/** Default 10% contingency reserve rate across event budgets. */
export const CONTINGENCY_RATE = 0.10;

/** Cooldown interval in milliseconds between AI generation calls. */
export const API_COOLDOWN_MS = 3000;

/** Request timeout in milliseconds for AbortController cancellation. */
export const API_TIMEOUT_MS = 15000;

/** Debounce interval in milliseconds before persisting state to localStorage. */
export const DEBOUNCE_PERSIST_MS = 250;

/** Auto-dismiss duration in milliseconds for status notifications. */
export const TOAST_DISMISS_MS = 5000;

/** LocalStorage key for persisting the event planning state. */
export const STORAGE_KEY = 'EVENT_PLANNER_STATE_V1';

/** Numeric clamping limits and mathematical constants. */
export const MIN_BUDGET = 100;
export const MAX_BUDGET_LIMIT = 100000000;
export const MAX_BUDGET = MAX_BUDGET_LIMIT;
export const DEFAULT_BUDGET = 25000;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 50000;
export const DEFAULT_GUESTS = 100;

export const PERCENTAGE_BASE = 100;
export const CENTS_MULTIPLIER = 100;
export const NEAR_LIMIT_PERCENT = 90;
export const OVER_BUDGET_PERCENT = 100;

export const MAX_TEXT_LENGTH = 300;
export const MAX_TITLE_LENGTH = 120;
export const MAX_LOCATION_LENGTH = 140;
export const MAX_THEME_LENGTH = 180;
export const MAX_NOTES_LENGTH = 400;
export const MIN_NAME_LENGTH = 2;
export const MIN_THEME_LENGTH = 3;

export const EVENT_TYPES: readonly EventTypeLabel[] = [
  'Wedding',
  'Birthday',
  'Community Event',
];

export const EVENT_TYPE_CODE_TO_LABEL: Readonly<Record<EventType, EventTypeLabel>> = {
  Wedding: 'Wedding',
  Birthday: 'Birthday',
  'Community Event': 'Community Event',
  WEDDING: 'Wedding',
  BIRTHDAY: 'Birthday',
  COMMUNITY: 'Community Event',
};

export const SETTING_TYPES: readonly SettingType[] = [
  'Indoor',
  'Outdoor',
  'Hybrid / City',
];

export const CURRENCY_CODES: readonly CurrencyCode[] = [
  'USD',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
];

export const TASK_STATUS_OPTIONS: readonly TaskStatus[] = [
  'Pending',
  'In Progress',
  'Completed',
];

export const VENDOR_BOOKING_STATUSES: readonly VendorBookingStatus[] = [
  'Researching',
  'Contacted',
  'Booked',
  'Paid',
];

export const VENDOR_PRIORITIES: readonly VendorPriority[] = [
  'Essential',
  'Recommended',
  'Optional',
];

export const BUDGET_CATEGORIES: readonly CoreBudgetCategoryName[] = [
  'Venue',
  'Catering',
  'Decor',
  'Entertainment',
  'Photography',
  'Logistics',
  'Contingency',
];

export const MILESTONE_WINDOWS: readonly MilestoneWindow[] = [
  '6 Months Out',
  '3 Months Out',
  '1 Month Out',
  '1 Week Out',
  '1 Day Before',
];

export const CURRENCY_SYMBOLS: Readonly<Record<CurrencyCode, string>> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export const CATEGORY_COLORS: Readonly<Record<string, string>> = {
  Venue: '#0F172A',
  Catering: '#2563EB',
  Decor: '#0D9488',
  Entertainment: '#D97706',
  Photography: '#7C3AED',
  Logistics: '#475569',
  Contingency: '#16A34A',
};

export const INDUSTRY_STANDARD_WEIGHTS: Readonly<
  Record<EventTypeLabel, Readonly<Record<CoreBudgetCategoryName, number>>>
> = {
  Wedding: {
    Venue: 26,
    Catering: 28,
    Decor: 12,
    Entertainment: 10,
    Photography: 10,
    Logistics: 4,
    Contingency: 10,
  },
  Birthday: {
    Venue: 20,
    Catering: 32,
    Decor: 15,
    Entertainment: 14,
    Photography: 6,
    Logistics: 3,
    Contingency: 10,
  },
  'Community Event': {
    Venue: 18,
    Catering: 25,
    Decor: 10,
    Entertainment: 15,
    Photography: 6,
    Logistics: 16,
    Contingency: 10,
  },
};

export const CATEGORY_DEFAULT_NOTES: Readonly<
  Record<EventTypeLabel, Readonly<Record<CoreBudgetCategoryName, string>>>
> = {
  Wedding: {
    Venue: 'Ceremony & reception hall rental, bridal suite, site insurance',
    Catering: 'Cocktail hour hors d’oeuvres, plated 3-course service, bar package, wedding cake',
    Decor: 'Floral installations, table linens, ambient uplighting, ceremony arch',
    Entertainment: 'Live string quartet for ceremony + reception DJ & sound system',
    Photography: '8-hour lead photographer, second shooter, highlight film edit',
    Logistics: 'Guest shuttle transport, valet, coat check, signage & stationery',
    Contingency: '10% reserve for weather backup tenting, overtime buffer, and service gratuities',
  },
  Birthday: {
    Venue: 'Private dining loft or rooftop terrace buyout',
    Catering: 'Chef grazing stations, signature mocktails/cocktails, custom patisserie cake',
    Decor: 'Bespoke table styling, architectural floral arrangements, custom signage',
    Entertainment: 'Vinyl DJ set, live saxophonist, interactive photo booth',
    Photography: '4-hour candid documentary event photographer & instant prints',
    Logistics: 'Digital RSVP tracking, coat check, late-night guest rideshare codes',
    Contingency: '10% reserve for extra guest plates, AV adapters, and staff overtime',
  },
  'Community Event': {
    Venue: 'Civic plaza permit, pavilion rental, ADA accessibility ramps',
    Catering: 'Local food truck vouchers, hydration stations, volunteer meal packs',
    Decor: 'Wayfinding banners, stage backdrop, community art installations',
    Entertainment: 'Main stage PA system, local bands, keynote mic & activities',
    Photography: 'Press & community highlight coverage, roaming social media capture',
    Logistics: 'Security personnel, sanitation stations, municipal permits, first-aid tent',
    Contingency: '10% reserve for generator backup, weather tarps, and emergency supplies',
  },
};
