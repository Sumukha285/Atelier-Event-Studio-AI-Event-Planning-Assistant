import {
  BudgetCategoryItem,
  ConceptPackage,
  CoreBudgetCategoryName,
  CountdownTask,
  CurrencyCode,
  EventConfig,
  EventPlanState,
  EventType,
  ItineraryItem,
  MilestoneWindow,
  SettingType,
  VendorBookingStatus,
} from '../types/event';

export const BUDGET_CATEGORIES: CoreBudgetCategoryName[] = [
  'Venue',
  'Catering',
  'Decor',
  'Entertainment',
  'Photography',
  'Logistics',
  'Contingency',
];

export const MILESTONE_WINDOWS: MilestoneWindow[] = [
  '6 Months Out',
  '3 Months Out',
  '1 Month Out',
  '1 Week Out',
  '1 Day Before',
];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';
  const safeNum = Number.isFinite(amount) ? Math.round(amount) : 0;
  const absFormatted = Math.abs(safeNum).toLocaleString('en-US');
  return safeNum < 0 ? `-${symbol}${absFormatted}` : `${symbol}${absFormatted}`;
}

/**
 * Input Sanitization Guardrail:
 * Strips raw HTML tags, control characters, and script injection vectors,
 * and caps string length before rendering or sending to AI prompts.
 */
export function sanitizeText(input: unknown, maxLength = 300): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // Strip HTML tags
    .replace(/[\u0000-\u001F\u007F]/g, ' ') // Strip control chars
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function sanitizeEventConfig(config: EventConfig): EventConfig {
  const allowedTypes: EventType[] = ['Wedding', 'Birthday', 'Community Event'];
  const allowedSettings: SettingType[] = ['Indoor', 'Outdoor', 'Hybrid / City'];
  const allowedCurrencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

  return {
    eventType: allowedTypes.includes(config.eventType) ? config.eventType : 'Wedding',
    eventName: sanitizeText(config.eventName, 120),
    date: sanitizeText(config.date, 20),
    location: sanitizeText(config.location, 140),
    setting: allowedSettings.includes(config.setting) ? config.setting : 'Indoor',
    guestCount: Math.max(0, Math.min(50000, Math.round(Number(config.guestCount) || 0))),
    currency: allowedCurrencies.includes(config.currency) ? config.currency : 'USD',
    totalBudget: Math.max(0, Math.min(10000000, Math.round(Number(config.totalBudget) || 0))),
    themeVibe: sanitizeText(config.themeVibe, 180),
    notes: config.notes ? sanitizeText(config.notes, 400) : '',
  };
}

/**
 * Compact Context Summary for Token Optimization & Prompt Injection Mitigation.
 * Wraps user-supplied fields inside <user_event_input> tags.
 */
export function buildCompactPromptContext(config: EventConfig): string {
  const clean = sanitizeEventConfig(config);
  const sym = CURRENCY_SYMBOLS[clean.currency] || '$';
  return `<user_event_input>
Event Type: ${clean.eventType}
Event Title: ${clean.eventName}
Target Date: ${clean.date}
Location & Setting: ${clean.location} (${clean.setting})
Guest Count: ${clean.guestCount}
Total Budget: ${sym}${clean.totalBudget} (${clean.currency})
Theme / Vibe Direction: ${clean.themeVibe}
</user_event_input>`;
}

export const INDUSTRY_STANDARD_WEIGHTS: Record<EventType, Record<CoreBudgetCategoryName, number>> = {
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

export const CATEGORY_DEFAULT_NOTES: Record<EventType, Record<CoreBudgetCategoryName, string>> = {
  Wedding: {
    Venue: 'Ceremony & reception hall rental, bridal suite, site insurance',
    Catering: 'Cocktail hour hors d’oeuvres, plated 3-course service, bar package, wedding cake',
    Decor: 'Floral installations, table linens, ambient uplighting, ceremony arch',
    Entertainment: 'Live string quartet for ceremony + reception DJ & sound system',
    Photography: '8-hour lead photographer, second shooter, highlight film edit',
    Logistics: 'Guest shuttle transport, valet, coat check, signage & stationery',
    Contingency: 'Weather backup tenting, overtime buffer, service gratuities',
  },
  Birthday: {
    Venue: 'Private dining loft or rooftop terrace buyout',
    Catering: 'Chef grazing stations, signature mocktails/cocktails, custom patisserie cake',
    Decor: 'Bespoke table styling, architectural floral arrangements, custom signage',
    Entertainment: 'Vinyl DJ set, live saxophonist, interactive photo booth',
    Photography: '4-hour candid documentary event photographer & instant prints',
    Logistics: 'Digital RSVP tracking, coat check, late-night guest rideshare codes',
    Contingency: 'Extra guest plates, AV adapters, service staff overtime',
  },
  'Community Event': {
    Venue: 'Civic plaza permit, pavilion rental, ADA accessibility ramps',
    Catering: 'Local food truck vouchers, hydration stations, volunteer meal packs',
    Decor: 'Wayfinding banners, stage backdrop, community art installations',
    Entertainment: 'Main stage PA system, local bands, keynote mic & activities',
    Photography: 'Press & community highlight coverage, roaming social media capture',
    Logistics: 'Security personnel, sanitation stations, municipal permits, first-aid tent',
    Contingency: 'Generator backup, weather tarps, emergency supplies buffer',
  },
};

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEventConfig(config: EventConfig): ValidationResult {
  const errors: Record<string, string> = {};
  const cleanName = sanitizeText(config.eventName, 120);
  const cleanLoc = sanitizeText(config.location, 140);
  const cleanTheme = sanitizeText(config.themeVibe, 180);

  if (!cleanName || cleanName.length < 2) {
    errors.eventName = 'Please enter an event title (at least 2 characters).';
  }

  if (!config.date || !/^\d{4}-\d{2}-\d{2}$/.test(config.date)) {
    errors.date = 'Please provide a valid target date (YYYY-MM-DD).';
  }

  if (!cleanLoc || cleanLoc.length < 2) {
    errors.location = 'Please enter a city or venue location.';
  }

  if (!Number.isFinite(config.guestCount) || config.guestCount < 1 || config.guestCount > 50000) {
    errors.guestCount = 'Guest count must be between 1 and 50,000.';
  }

  if (!Number.isFinite(config.totalBudget) || config.totalBudget < 100 || config.totalBudget > 10000000) {
    errors.totalBudget = 'Total budget must be at least 100.';
  }

  if (!cleanTheme || cleanTheme.length < 2) {
    errors.themeVibe = 'Please describe your preferred theme or vibe.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateBudgetAllocation(
  totalBudget: number,
  eventType: EventType,
  existingCategories?: BudgetCategoryItem[],
  customWeights?: Partial<Record<string, number>>
): BudgetCategoryItem[] {
  const safeBudget = Math.max(0, Math.round(totalBudget));
  const baseWeights = INDUSTRY_STANDARD_WEIGHTS[eventType] || INDUSTRY_STANDARD_WEIGHTS.Wedding;
  const notesMap = CATEGORY_DEFAULT_NOTES[eventType] || CATEGORY_DEFAULT_NOTES.Wedding;

  const rawWeights = BUDGET_CATEGORIES.map((cat) => {
    const w = customWeights?.[cat] ?? baseWeights[cat];
    return Math.max(1, Number(w) || baseWeights[cat]);
  });
  const weightSum = rawWeights.reduce((acc, v) => acc + v, 0);

  let runningEstimated = 0;
  return BUDGET_CATEGORIES.map((category, idx) => {
    const existing = existingCategories?.find((c) => c.category === category);
    const normalizedPercent =
      idx === BUDGET_CATEGORIES.length - 1
        ? Math.max(
            0,
            100 -
              BUDGET_CATEGORIES.slice(0, -1).reduce(
                (acc, _, i) => acc + Math.round((rawWeights[i] / weightSum) * 100),
                0
              )
          )
        : Math.round((rawWeights[idx] / weightSum) * 100);

    const estimatedCost =
      idx === BUDGET_CATEGORIES.length - 1
        ? Math.max(0, safeBudget - runningEstimated)
        : Math.round((safeBudget * normalizedPercent) / 100);

    runningEstimated += estimatedCost;

    return {
      id: existing?.id || `budget-${category.toLowerCase().replace(/\s+/g, '-')}`,
      category,
      recommendedPercent: normalizedPercent,
      estimatedCost,
      actualSpent: existing ? existing.actualSpent : 0,
      notes: existing?.notes || notesMap[category],
    };
  });
}

export type BudgetHealthLabel = 'Under Budget' | 'Near Limit' | 'Over Budget' | 'Unspent';

export function classifyCategoryBudgetStatus(
  estimatedCost: number,
  actualSpent: number
): { label: BudgetHealthLabel; ratioPercent: number } {
  if (actualSpent <= 0) {
    return { label: 'Unspent', ratioPercent: 0 };
  }
  if (estimatedCost <= 0) {
    return { label: 'Over Budget', ratioPercent: 100 };
  }
  const ratioPercent = Math.round((actualSpent / estimatedCost) * 100);
  if (actualSpent > estimatedCost) {
    return { label: 'Over Budget', ratioPercent };
  }
  if (ratioPercent >= 90) {
    return { label: 'Near Limit', ratioPercent };
  }
  return { label: 'Under Budget', ratioPercent };
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalActual: number;
  unallocatedBudget: number;
  remainingFromTotal: number;
  varianceEstimatedVsActual: number;
  estimatedPercentOfTotal: number;
  actualPercentOfTotal: number;
  overBudgetCount: number;
  nearLimitCount: number;
}

export function computeBudgetSummary(
  categories: BudgetCategoryItem[],
  totalBudget: number
): BudgetSummary {
  const safeTotal = Math.max(0, totalBudget);
  const totalEstimated = categories.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
  const totalActual = categories.reduce((sum, item) => sum + (Number(item.actualSpent) || 0), 0);
  const unallocatedBudget = safeTotal - totalEstimated;
  const remainingFromTotal = safeTotal - totalActual;
  const varianceEstimatedVsActual = totalEstimated - totalActual;
  const estimatedPercentOfTotal = safeTotal > 0 ? Math.round((totalEstimated / safeTotal) * 1000) / 10 : 0;
  const actualPercentOfTotal = safeTotal > 0 ? Math.round((totalActual / safeTotal) * 1000) / 10 : 0;
  const overBudgetCount = categories.filter(
    (c) => c.actualSpent > 0 && c.actualSpent > c.estimatedCost
  ).length;
  const nearLimitCount = categories.filter((c) => {
    const status = classifyCategoryBudgetStatus(c.estimatedCost, c.actualSpent);
    return status.label === 'Near Limit';
  }).length;

  return {
    totalBudget: safeTotal,
    totalEstimated,
    totalActual,
    unallocatedBudget,
    remainingFromTotal,
    varianceEstimatedVsActual,
    estimatedPercentOfTotal,
    actualPercentOfTotal,
    overBudgetCount,
    nearLimitCount,
  };
}

export interface TimelineStats {
  totalTasks: number;
  completedCount: number;
  inProgressCount: number;
  pendingCount: number;
  completionPercent: number;
  itineraryCount: number;
  itineraryCompletedCount: number;
  itineraryCompletionPercent: number;
}

export function computeTimelineProgress(
  countdownTasks: CountdownTask[],
  itinerary: ItineraryItem[]
): TimelineStats {
  const totalTasks = countdownTasks.length;
  const completedCount = countdownTasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = countdownTasks.filter((t) => t.status === 'In Progress').length;
  const pendingCount = countdownTasks.filter((t) => t.status === 'Pending').length;
  const completionPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
  const itineraryCount = itinerary.length;
  const itineraryCompletedCount = itinerary.filter((i) => i.status === 'Completed').length;
  const itineraryCompletionPercent =
    itineraryCount > 0 ? Math.round((itineraryCompletedCount / itineraryCount) * 100) : 0;

  return {
    totalTasks,
    completedCount,
    inProgressCount,
    pendingCount,
    completionPercent,
    itineraryCount,
    itineraryCompletedCount,
    itineraryCompletionPercent,
  };
}

/**
 * Safe LocalStorage Hydration Validator:
 * Validates the schema of persisted state from localStorage so corrupted or tampered
 * JSON cannot crash the application.
 */
export function validateAndHydrateState(raw: unknown): EventPlanState | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, any>;

  if (!candidate.config || typeof candidate.config !== 'object') return null;
  if (
    !Array.isArray(candidate.concepts) ||
    !Array.isArray(candidate.budgetCategories) ||
    !Array.isArray(candidate.countdownTasks) ||
    !Array.isArray(candidate.itinerary) ||
    !Array.isArray(candidate.vendors)
  ) {
    return null;
  }

  const sanitizedConfig = sanitizeEventConfig({
    eventType: candidate.config.eventType || 'Wedding',
    eventName: candidate.config.eventName || 'Untitled Event',
    date: candidate.config.date || '2027-05-22',
    location: candidate.config.location || 'New York',
    setting: candidate.config.setting || 'Indoor',
    guestCount: Number(candidate.config.guestCount) || 100,
    currency: candidate.config.currency || 'USD',
    totalBudget: Number(candidate.config.totalBudget) || 25000,
    themeVibe: candidate.config.themeVibe || 'Modern Classic',
    notes: candidate.config.notes || '',
  });

  if (!sanitizedConfig.eventName || sanitizedConfig.totalBudget <= 0) {
    return null;
  }

  const validStatuses: VendorBookingStatus[] = ['Researching', 'Contacted', 'Booked', 'Paid'];
  const hydratedVendors = candidate.vendors.map((v: any, idx: number) => ({
    id: String(v?.id || `v-${idx}`),
    category: sanitizeText(v?.category || 'Vendor', 100),
    roleDescription: sanitizeText(v?.roleDescription || '', 240),
    priority:
      v?.priority === 'Essential' || v?.priority === 'Recommended' || v?.priority === 'Optional'
        ? v.priority
        : 'Recommended',
    bookingStatus: validStatuses.includes(v?.bookingStatus)
      ? v.bookingStatus
      : v?.bookingStatus === 'Quoted' || v?.bookingStatus === 'Shortlisted'
      ? 'Contacted'
      : 'Researching',
    vendorName: sanitizeText(v?.vendorName || '', 120),
    quotedPrice: Math.max(0, Number(v?.quotedPrice) || 0),
    contactInfo: sanitizeText(v?.contactInfo || '', 120),
    vettingQuestions: Array.isArray(v?.vettingQuestions)
      ? v.vettingQuestions.map((q: any) => sanitizeText(q, 240)).filter(Boolean)
      : [],
    contractRedFlags: Array.isArray(v?.contractRedFlags)
      ? v.contractRedFlags.map((f: any) => sanitizeText(f, 240)).filter(Boolean)
      : [],
    isPermitOrCompliance: Boolean(v?.isPermitOrCompliance),
  }));

  return {
    config: sanitizedConfig,
    concepts: candidate.concepts,
    selectedConceptId:
      typeof candidate.selectedConceptId === 'string' ? candidate.selectedConceptId : null,
    budgetCategories: candidate.budgetCategories,
    countdownTasks: candidate.countdownTasks,
    itinerary: candidate.itinerary,
    vendors: hydratedVendors,
    chatHistory: Array.isArray(candidate.chatHistory) ? candidate.chatHistory : [],
    lastUpdated:
      typeof candidate.lastUpdated === 'string'
        ? candidate.lastUpdated
        : new Date().toISOString(),
  };
}

export function generatePlanMarkdown(state: EventPlanState): string {
  const { config, concepts, selectedConceptId, budgetCategories, countdownTasks, itinerary, vendors } = state;
  const currency = config.currency || 'USD';
  const summary = computeBudgetSummary(budgetCategories, config.totalBudget);
  const selectedConcept: ConceptPackage | undefined =
    concepts.find((c) => c.id === selectedConceptId) || concepts[0];

  const lines: string[] = [];
  lines.push(`# ${config.eventName} — Master Event Plan`);
  lines.push('');
  lines.push(`- **Event Type:** ${config.eventType}`);
  lines.push(`- **Date:** ${config.date}`);
  lines.push(`- **Location & Setting:** ${config.location} (${config.setting})`);
  lines.push(`- **Guest Count:** ${config.guestCount.toLocaleString()} guests`);
  lines.push(`- **Total Budget (${currency}):** ${formatCurrency(config.totalBudget, currency)}`);
  lines.push(`- **Theme / Vibe:** ${config.themeVibe}`);
  lines.push('');

  if (selectedConcept) {
    lines.push(`## 1. Pinned Concept Package: ${selectedConcept.title}`);
    lines.push(`_${selectedConcept.tagline}_`);
    lines.push('');
    lines.push(selectedConcept.atmosphereDescription);
    lines.push('');
    lines.push(
      `- **Color Palette:** ${selectedConcept.colorPalette.map((s) => `${s.name} (${s.hex})`).join(', ')}`
    );
    lines.push(`- **Catering Style:** ${selectedConcept.cateringStyle}`);
    lines.push(`- **Signature Moment:** ${selectedConcept.signatureMoment}`);
    lines.push(`- **Decor Highlights:** ${selectedConcept.decorIdeas.join('; ')}`);
    lines.push(`- **Entertainment:** ${selectedConcept.entertainmentSuggestions.join('; ')}`);
    lines.push('');
  }

  lines.push('## 2. Smart Budget Allocation');
  lines.push('');
  lines.push('| Category | Share | Estimated Cost | Actual Spent | Variance | Status | Notes |');
  lines.push('| :--- | ---: | ---: | ---: | ---: | :--- | :--- |');
  for (const item of budgetCategories) {
    const share =
      config.totalBudget > 0 ? Math.round((item.estimatedCost / config.totalBudget) * 100) : 0;
    const variance = item.estimatedCost - item.actualSpent;
    const status = classifyCategoryBudgetStatus(item.estimatedCost, item.actualSpent);
    lines.push(
      `| ${item.category} | ${share}% | ${formatCurrency(item.estimatedCost, currency)} | ${formatCurrency(item.actualSpent, currency)} | ${formatCurrency(variance, currency)} | ${status.label} | ${item.notes} |`
    );
  }
  lines.push(
    `| **Total** | **${summary.estimatedPercentOfTotal}%** | **${formatCurrency(summary.totalEstimated, currency)}** | **${formatCurrency(summary.totalActual, currency)}** | **${formatCurrency(summary.varianceEstimatedVsActual, currency)}** | | |`
  );
  lines.push('');

  lines.push('## 3. Countdown Checklist');
  lines.push('');
  for (const milestone of MILESTONE_WINDOWS) {
    const tasks = countdownTasks.filter((t) => t.milestone === milestone);
    if (tasks.length > 0) {
      lines.push(`### ${milestone}`);
      for (const t of tasks) {
        const mark = t.status === 'Completed' ? '[x]' : t.status === 'In Progress' ? '[-]' : '[ ]';
        lines.push(`- ${mark} **${t.title}** (${t.category} · ${t.status}) — ${t.assigneeOrNote}`);
      }
      lines.push('');
    }
  }

  lines.push('## 4. Day-of Run-of-Show Itinerary');
  lines.push('');
  lines.push('| Time | Duration | Activity | Zone | Lead | Status |');
  lines.push('| :--- | ---: | :--- | :--- | :--- | :--- |');
  for (const slot of itinerary) {
    lines.push(
      `| ${slot.timeSlot} | ${slot.durationMinutes}m | ${slot.activity} | ${slot.locationZone} | ${slot.leadOwner} | ${slot.status} |`
    );
  }
  lines.push('');

  lines.push('## 5. Vendor & Permit Directory');
  lines.push('');
  for (const v of vendors) {
    lines.push(`### ${v.category} (${v.priority} · ${v.bookingStatus})`);
    lines.push(`- **Role:** ${v.roleDescription}`);
    if (v.vendorName) {
      lines.push(`- **Vendor:** ${v.vendorName} (${v.contactInfo || 'No contact listed'})`);
    }
    if (v.quotedPrice > 0) {
      lines.push(`- **Contract / Quoted Amount:** ${formatCurrency(v.quotedPrice, currency)}`);
    }
    if (v.vettingQuestions.length > 0) {
      lines.push('- **Questions to Ask:**');
      v.vettingQuestions.forEach((q, idx) => lines.push(`  ${idx + 1}. ${q}`));
    }
    if (v.contractRedFlags.length > 0) {
      lines.push('- **Contract Red Flags:**');
      v.contractRedFlags.forEach((flag) => lines.push(`  - ⚠️ ${flag}`));
    }
    lines.push('');
  }

  return lines.join('\n');
}
