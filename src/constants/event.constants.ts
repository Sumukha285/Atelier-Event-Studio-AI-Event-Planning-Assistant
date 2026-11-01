/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CoreBudgetCategoryName,
  CurrencyCode,
  EventType,
  MilestoneWindow,
  SettingType,
  TaskStatus,
  VendorBookingStatus,
  VendorPriority,
} from '../types/event.types';

/** Cooldown interval in milliseconds between AI generation calls. */
export const API_COOLDOWN_MS = 3000;

/** Debounce interval in milliseconds before persisting state to localStorage. */
export const DEBOUNCE_PERSIST_MS = 250;

/** Auto-dismiss duration in milliseconds for success toast notifications. */
export const TOAST_DISMISS_MS = 5000;

/** LocalStorage key for persisting the event planning state. */
export const STORAGE_KEY = 'atelier_event_studio_state_v1';

/** Numeric clamping limits for event parameters. */
export const MIN_BUDGET = 100;
export const MAX_BUDGET = 10_000_000;
export const DEFAULT_BUDGET = 25_000;

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 50_000;
export const DEFAULT_GUESTS = 100;

export const MAX_TEXT_LENGTH = 300;
export const MAX_TITLE_LENGTH = 120;
export const MAX_LOCATION_LENGTH = 140;
export const MAX_THEME_LENGTH = 180;
export const MAX_NOTES_LENGTH = 400;

/** Near-limit threshold percentage for category budget health classification. */
export const NEAR_LIMIT_PERCENT = 90;

export const EVENT_TYPES: readonly EventType[] = [
  'Wedding',
  'Birthday',
  'Community Event',
];

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
  Record<EventType, Readonly<Record<CoreBudgetCategoryName, number>>>
> = {
  Wedding: {
    Venue: 28,
    Catering: 30,
    Decor: 12,
    Entertainment: 10,
    Photography: 10,
    Logistics: 4,
    Contingency: 6,
  },
  Birthday: {
    Venue: 22,
    Catering: 34,
    Decor: 16,
    Entertainment: 14,
    Photography: 6,
    Logistics: 3,
    Contingency: 5,
  },
  'Community Event': {
    Venue: 20,
    Catering: 25,
    Decor: 10,
    Entertainment: 15,
    Photography: 6,
    Logistics: 16,
    Contingency: 8,
  },
};

export const CATEGORY_DEFAULT_NOTES: Readonly<
  Record<EventType, Readonly<Record<CoreBudgetCategoryName, string>>>
> = {
  Wedding: {
    Venue: 'Ceremony & reception hall rental, bridal suite, site insurance',
    Catering:
      'Cocktail hour hors d’oeuvres, plated 3-course service, bar package, wedding cake',
    Decor: 'Floral installations, table linens, ambient uplighting, ceremony arch',
    Entertainment:
      'Live string quartet for ceremony + reception DJ & sound system',
    Photography: '8-hour lead photographer, second shooter, highlight film edit',
    Logistics: 'Guest shuttle transport, valet, coat check, signage & stationery',
    Contingency: 'Weather backup tenting, overtime buffer, service gratuities',
  },
  Birthday: {
    Venue: 'Private dining loft or rooftop terrace buyout',
    Catering:
      'Chef grazing stations, signature mocktails/cocktails, custom patisserie cake',
    Decor:
      'Bespoke table styling, architectural floral arrangements, custom signage',
    Entertainment: 'Vinyl DJ set, live saxophonist, interactive photo booth',
    Photography:
      '4-hour candid documentary event photographer & instant prints',
    Logistics:
      'Digital RSVP tracking, coat check, late-night guest rideshare codes',
    Contingency: 'Extra guest plates, AV adapters, service staff overtime',
  },
  'Community Event': {
    Venue: 'Civic plaza permit, pavilion rental, ADA accessibility ramps',
    Catering:
      'Local food truck vouchers, hydration stations, volunteer meal packs',
    Decor: 'Wayfinding banners, stage backdrop, community art installations',
    Entertainment: 'Main stage PA system, local bands, keynote mic & activities',
    Photography:
      'Press & community highlight coverage, roaming social media capture',
    Logistics:
      'Security personnel, sanitation stations, municipal permits, first-aid tent',
    Contingency: 'Generator backup, weather tarps, emergency supplies buffer',
  },
};

export { EVENT_PRESETS, createInitialEventState } from '../data/presets';

