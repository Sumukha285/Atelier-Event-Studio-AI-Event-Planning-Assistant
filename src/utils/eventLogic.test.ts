import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCompactPromptContext,
  calculateBudgetAllocation,
  classifyCategoryBudgetStatus,
  computeBudgetSummary,
  computeTimelineProgress,
  formatCurrency,
  generatePlanMarkdown,
  sanitizeText,
  validateAndHydrateState,
  validateEventConfig,
} from './eventLogic';
import { EventConfig, EventPlanState } from '../types/event';

test('validateEventConfig accepts valid event configuration and rejects invalid inputs', () => {
  const validConfig: EventConfig = {
    eventType: 'Wedding',
    eventName: 'Clara & Julian Autumn Conservatory Wedding',
    date: '2027-05-15',
    location: 'Hudson Valley, NY',
    setting: 'Indoor',
    guestCount: 140,
    currency: 'USD',
    totalBudget: 45000,
    themeVibe: 'Architectural Botanical & Candlelit Modernism',
  };

  const resValid = validateEventConfig(validConfig);
  assert.equal(resValid.valid, true);
  assert.equal(Object.keys(resValid.errors).length, 0);

  const resInvalid = validateEventConfig({
    ...validConfig,
    eventName: '',
    guestCount: 0,
    totalBudget: 20,
  });
  assert.equal(resInvalid.valid, false);
  assert.ok(resInvalid.errors.eventName);
  assert.ok(resInvalid.errors.guestCount);
  assert.ok(resInvalid.errors.totalBudget);
});

test('sanitizeText strips HTML tags and script vectors and buildCompactPromptContext wraps delimiters', () => {
  const dirty = '<script>alert("xss")</script>Grand Gala <b>2027</b>';
  assert.equal(sanitizeText(dirty), 'alert("xss")Grand Gala 2027');

  const ctx = buildCompactPromptContext({
    eventType: 'Birthday',
    eventName: 'Elena <img src=x onerror=alert(1)> 30th',
    date: '2027-03-14',
    location: 'New York',
    setting: 'Indoor',
    guestCount: 65,
    currency: 'EUR',
    totalBudget: 15000,
    themeVibe: 'Milanese Lounge',
  });
  assert.ok(ctx.startsWith('<user_event_input>'));
  assert.ok(ctx.endsWith('</user_event_input>'));
  assert.ok(!ctx.includes('<img'));
  assert.ok(ctx.includes('€15000 (EUR)'));
});

test('calculateBudgetAllocation distributes exact total budget across all 7 categories', () => {
  const items = calculateBudgetAllocation(45000, 'Wedding');
  assert.equal(items.length, 7);

  const sumEstimated = items.reduce((acc, i) => acc + i.estimatedCost, 0);
  const sumPercent = items.reduce((acc, i) => acc + i.recommendedPercent, 0);

  assert.equal(sumEstimated, 45000);
  assert.equal(sumPercent, 100);
});

test('computeBudgetSummary and classifyCategoryBudgetStatus calculate variance, near-limit, and over-budget states accurately', () => {
  const items = calculateBudgetAllocation(20000, 'Birthday');
  items[0].actualSpent = items[0].estimatedCost + 500; // Over Budget
  items[1].actualSpent = Math.round(items[1].estimatedCost * 0.95); // Near Limit (>=90%)
  items[2].actualSpent = Math.round(items[2].estimatedCost * 0.5); // Under Budget

  assert.equal(
    classifyCategoryBudgetStatus(items[0].estimatedCost, items[0].actualSpent).label,
    'Over Budget'
  );
  assert.equal(
    classifyCategoryBudgetStatus(items[1].estimatedCost, items[1].actualSpent).label,
    'Near Limit'
  );
  assert.equal(
    classifyCategoryBudgetStatus(items[2].estimatedCost, items[2].actualSpent).label,
    'Under Budget'
  );

  const summary = computeBudgetSummary(items, 20000);
  assert.equal(summary.totalEstimated, 20000);
  assert.equal(summary.unallocatedBudget, 0);
  assert.equal(summary.overBudgetCount, 1);
  assert.equal(summary.nearLimitCount, 1);
});

test('validateAndHydrateState rejects corrupted payloads and normalizes legacy vendor statuses', () => {
  assert.equal(validateAndHydrateState(null), null);
  assert.equal(validateAndHydrateState({ config: {} }), null);

  const validRaw = {
    config: {
      eventType: 'Community Event',
      eventName: 'Pier Festival',
      date: '2027-08-21',
      location: 'Seattle',
      setting: 'Outdoor',
      guestCount: 500,
      currency: 'CAD',
      totalBudget: 30000,
      themeVibe: 'Waterfront Craft',
    },
    concepts: [],
    selectedConceptId: null,
    budgetCategories: [],
    countdownTasks: [],
    itinerary: [],
    vendors: [
      {
        id: 'v1',
        category: 'Stage Audio',
        roleDescription: 'PA rig',
        priority: 'Essential',
        bookingStatus: 'Quoted', // legacy status should normalize to Contacted
        vendorName: 'Sound Co',
        quotedPrice: 4000,
        contactInfo: 'info@sound.example',
        vettingQuestions: ['Q1'],
        contractRedFlags: ['F1'],
      },
    ],
  };

  const hydrated = validateAndHydrateState(validRaw);
  assert.ok(hydrated);
  assert.equal(hydrated.config.currency, 'CAD');
  assert.equal(hydrated.vendors[0].bookingStatus, 'Contacted');
  assert.equal(formatCurrency(30000, hydrated.config.currency), 'C$30,000');
});

test('computeTimelineProgress and generatePlanMarkdown export complete structured output', () => {
  const budgetCategories = calculateBudgetAllocation(30000, 'Community Event');
  const state: EventPlanState = {
    config: {
      eventType: 'Community Event',
      eventName: 'Harborfront Design & Makers Festival',
      date: '2027-08-21',
      location: 'Seattle Waterfront Pier 62',
      setting: 'Outdoor',
      guestCount: 600,
      currency: 'USD',
      totalBudget: 30000,
      themeVibe: 'Industrial Maritime Craft & Acoustic Sunset',
    },
    concepts: [
      {
        id: 'c1',
        title: 'Maritime Craft Pavilion',
        tagline: 'Open-air coastal artisan showcase',
        atmosphereDescription: 'Warm cedar stalls, canvas sails, and acoustic stage.',
        colorPalette: [{ name: 'Harbor Navy', hex: '#1E293B' }],
        decorIdeas: ['Canvas shade sails'],
        entertainmentSuggestions: ['Indie folk trio'],
        cateringStyle: 'Artisanal food trucks',
        signatureMoment: 'Golden hour harbor lantern lighting',
      },
    ],
    selectedConceptId: 'c1',
    budgetCategories,
    countdownTasks: [
      {
        id: 't1',
        milestone: '6 Months Out',
        title: 'Secure city waterfront permit',
        category: 'Logistics',
        status: 'Completed',
        assigneeOrNote: 'Operations Lead',
      },
    ],
    itinerary: [
      {
        id: 'it1',
        timeSlot: '10:00',
        durationMinutes: 60,
        activity: 'Gates Open & Maker Market Welcome',
        locationZone: 'Main Pier',
        leadOwner: 'Festival Director',
        status: 'Completed',
        notes: 'Check sound levels',
      },
    ],
    vendors: [
      {
        id: 'v1',
        category: 'Sound & Stage Production',
        roleDescription: 'Outdoor line-array PA and stage rigging',
        priority: 'Essential',
        bookingStatus: 'Contacted',
        vendorName: 'Pacific Soundworks',
        quotedPrice: 4500,
        contactInfo: 'ops@pacificsound.example',
        vettingQuestions: ['Is generator backup included?'],
        contractRedFlags: ['No inclement weather clause'],
      },
    ],
    chatHistory: [],
    lastUpdated: '2026-11-01T06:45:00.000Z',
  };

  const stats = computeTimelineProgress(state.countdownTasks, state.itinerary);
  assert.equal(stats.completionPercent, 100);
  assert.equal(stats.itineraryCompletionPercent, 100);

  const md = generatePlanMarkdown(state);
  assert.ok(md.includes('# Harborfront Design & Makers Festival — Master Event Plan'));
  assert.ok(md.includes('Pinned Concept Package: Maritime Craft Pavilion'));
  assert.ok(md.includes('Pacific Soundworks'));
});
