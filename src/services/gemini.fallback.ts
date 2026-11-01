/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EVENT_PRESETS } from '../constants/presets.data';
import {
  ConceptPackage,
  CountdownTask,
  EventConfig,
  EventPlanState,
  ItineraryItem,
  VendorItem,
} from '../types/event.types';
import { computeBudgetSummary, formatCurrency, resolveEventTypeLabel } from '../utils/eventLogic';

/** @description Generates 3 deterministic fallback concept packages tailored to the user's `EventConfig`. */
export function buildFallbackConcepts(config: EventConfig): ConceptPackage[] {
  const vibe = config.themeVibe || 'Modern Architectural Elegance';
  const loc = config.location || 'Metropolitan Venue';
  const guests = config.guestCount || 100;
  const stamp = Date.now();
  return [
    {
      id: `concept-${stamp}-1`,
      title: `${vibe.split('&')[0].trim()} Atelier`,
      tagline: `Tailored ${config.setting.toLowerCase()} experience for ${guests} guests in ${loc}`,
      atmosphereDescription: `Designed around "${vibe}", this concept layers warm architectural lighting, tactile natural linens, and a focal gathering installation suited for ${loc}.`,
      colorPalette: [
        { name: 'Architectural Slate', hex: '#1E293B' },
        { name: 'Warm Alabaster', hex: '#F5F2EB' },
        { name: 'Botanical Cypress', hex: '#2D4A3E' },
        { name: 'Brushed Ochre', hex: '#C89D54' },
      ],
      decorIdeas: [
        `Custom serpentine tablescapes for ${guests} guests with textured stone linen and low taper clusters`,
        `Statement entry installation referencing ${loc} architecture and ${vibe}`,
        'Warm 2700K perimeter pin-spotting with sculptural foliage vessels',
      ],
      entertainmentSuggestions: [
        'Live acoustic instrumental duo for guest arrival and aperitivo hour',
        `Curated vinyl & contemporary selector set tailored to ${config.eventType.toLowerCase()} energy`,
        'Interactive portrait studio corner with instant archival prints',
      ],
      cateringStyle: `Seasonal shared banquet menu for ${guests} guests featuring regional produce, signature botanical welcome cocktails, and tableside dessert service.`,
      signatureMoment: `Synchronized candle & ambient light transition during the main welcome toast for ${config.eventName}.`,
    },
    {
      id: `concept-${stamp}-2`,
      title: 'Monochrome Gallery & Luminary',
      tagline: 'Sculptural minimalism, high-contrast floral plinths, and progressive tasting stations',
      atmosphereDescription: `Transforms ${loc} into an editorial gallery environment where clean structural lines meet dramatic shadow play and refined acoustic design.`,
      colorPalette: [
        { name: 'Obsidian Ink', hex: '#18181B' },
        { name: 'Travertine Cream', hex: '#EAE5D9' },
        { name: 'Raw Umber', hex: '#5C4738' },
        { name: 'Silver Mist', hex: '#D4D4D8' },
      ],
      decorIdeas: [
        'Fluted travertine plinths supporting mono-botanical floral sculptures',
        'Suspended sheer fabric baffles to soften room acoustics and diffuse overhead light',
        'Custom typographic printed menus and seating index wall at the entrance',
      ],
      entertainmentSuggestions: [
        'Contemporary string trio performing modern minimalist arrangements',
        'High-fidelity lounge audio system transitioning into late-night dance set',
        'Bespoke digestif & espresso tonic bar with live vinyl accompaniment',
      ],
      cateringStyle: 'Chef-led tasting stations and passed architectural canapés paired with low-intervention wines and zero-proof botanical infusions.',
      signatureMoment: `Champagne tower pour framed by dramatic spotlighting at the midpoint of ${config.eventName}.`,
    },
    {
      id: `concept-${stamp}-3`,
      title: 'Golden Hour Terrace & Salon',
      tagline: 'Warm Mediterranean hospitality, abundant grazing tables, and live ensemble music',
      atmosphereDescription: `Brings an effortless indoor-outdoor flow to ${loc}, emphasizing convivial long-table dining, aromatic herbs, and warm lantern illumination.`,
      colorPalette: [
        { name: 'Terracotta Clay', hex: '#B85D3B' },
        { name: 'Olive Grove', hex: '#4D5D53' },
        { name: 'Linen Chalk', hex: '#FAF8F5' },
        { name: 'Amber Honey', hex: '#D97706' },
      ],
      decorIdeas: [
        'Potted olive and citrus trees framing the primary focal zone and lounge corners',
        'Woven lounge seating clusters with raw linen umbrellas and brass lanterns',
        'Hand-lettered ceramic tile table numbers and herb-sprig place settings',
      ],
      entertainmentSuggestions: [
        'Roaming acoustic jazz & brass ensemble during golden hour mingling',
        'High-energy live band followed by club-grade DJ closing set',
        'Late-night artisanal gelato or pastry cart roll-out',
      ],
      cateringStyle: `Abundant artisanal grazing tables, wood-fired mains, and seasonal patisserie tower designed for ${guests} guests.`,
      signatureMoment: `Collective sunset toast and lantern illumination across the main space at ${loc}.`,
    },
  ];
}

/** @description Generates deterministic countdown tasks and run-of-show itinerary slots for a given `EventConfig`. */
export function buildFallbackTimeline(config: EventConfig): {
  readonly countdownTasks: CountdownTask[];
  readonly itinerary: ItineraryItem[];
} {
  const preset = EVENT_PRESETS[resolveEventTypeLabel(config.eventType)];
  const stamp = Date.now();
  return {
    countdownTasks: preset.countdownTasks.map((t, idx) => ({ ...t, id: `task-${stamp}-${idx}` })),
    itinerary: preset.itinerary.map((i, idx) => ({ ...i, id: `itin-${stamp}-${idx}` })),
  };
}

/** @description Generates deterministic vendor directory entries scaled to the event budget. */
export function buildFallbackVendors(config: EventConfig): VendorItem[] {
  const preset = EVENT_PRESETS[resolveEventTypeLabel(config.eventType)];
  const ratio = config.totalBudget / (preset.config.totalBudget || 1);
  return preset.vendors.map((v, idx) => ({ ...v, id: `vendor-${Date.now()}-${idx}`, quotedPrice: Math.round(v.quotedPrice * ratio) }));
}

/** @description Generates 5 deterministic vetting questions and 3 contract red flags for a vendor category. */
export function buildFallbackVendorVetting(
  config: EventConfig,
  vendorCategory: string
): { readonly vettingQuestions: string[]; readonly contractRedFlags: string[] } {
  return {
    vettingQuestions: [
      `What is your exact load-in, setup, and strike window at ${config.location} before overtime fees apply?`,
      `How do you staff and scale ${vendorCategory} operations for ${config.guestCount} guests (${config.setting} setting)?`,
      'Can you provide a Certificate of Insurance ($2M aggregate) naming the venue as additionally insured?',
      'What is your backup equipment and contingency staffing protocol in case of technical failure or illness?',
      'Are all delivery, setup, tax, and service gratuities itemized in the base contract quote?',
    ],
    contractRedFlags: [
      'Uncapped hourly overtime surcharges if strike extends past midnight',
      'Vague substitution clauses allowing unapproved changes to lead personnel or materials',
      'Non-refundable full balance due more than 60 days prior to the event date without milestone deliverables',
    ],
  };
}

/** @description Synthesizes a grounded Event Co-Pilot response when the live AI key is unavailable. */
export function buildFallbackCoPilotReply(message: string, state: EventPlanState): string {
  const { config, budgetCategories } = state;
  const summary = computeBudgetSummary(config.totalBudget, budgetCategories);
  const perGuest = Math.round(config.totalBudget / Math.max(1, config.guestCount));
  const cur = config.currency;
  if (/email|draft|inquir|vendor|quote/i.test(message)) {
    return [
      `### Subject: Event Inquiry — ${config.eventName} (${config.date} · ${config.guestCount} Guests)`,
      `Dear Events & Production Team,\n\nWe are organizing **${config.eventName}** (${config.eventType}) on **${config.date}** at **${config.location}** (${config.setting} setting) for **${config.guestCount} guests**.`,
      `- **Aesthetic Direction:** ${config.themeVibe}\n- **Target Total Budget:** ${formatCurrency(config.totalBudget, cur)}\n\nPlease share your availability, itemized package pricing, staffing ratios, and sample contract terms.\n\nWarm regards,\nEvent Planning Team`,
    ].join('\n\n');
  }
  return [
    `### Studio Co-Pilot Analysis for ${config.eventName}`,
    `- **Budget Health:** ${formatCurrency(summary.totalEstimated, cur)} allocated of ${formatCurrency(config.totalBudget, cur)} (${formatCurrency(perGuest, cur)}/guest across ${config.guestCount} guests). Actual spent: ${formatCurrency(summary.totalActual, cur)}.`,
    `- **Recommended Next Step:** Prioritize locking contracts for your top two cost centers (**Venue** and **Catering**), while preserving a **${formatCurrency(Math.round(config.totalBudget * 0.06), cur)}** contingency buffer for ${config.setting.toLowerCase()} logistics.`,
  ].join('\n\n');
}
