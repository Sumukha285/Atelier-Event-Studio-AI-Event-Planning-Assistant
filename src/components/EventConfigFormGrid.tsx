/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import {
  CURRENCY_CODES,
  EVENT_TYPES,
  MAX_BUDGET_LIMIT,
  MAX_GUESTS,
  MIN_BUDGET,
  MIN_GUESTS,
  SETTING_TYPES,
} from '../constants/event.constants';
import { CurrencyCode, EventConfig, EventType, SettingType } from '../types/event.types';
import { clampNumber } from '../utils/security.utils';

export interface EventConfigFormGridProps {
  readonly config: EventConfig;
  readonly validationErrors: Readonly<Record<string, string>>;
  readonly onFieldChange: <K extends keyof EventConfig>(field: K, value: EventConfig[K]) => void;
}

const INPUT_CLASS =
  'w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900';

/** @description Renders the accessible 8-field configuration input grid for the Event Setup & AI Ideation Hub. */
export const EventConfigFormGrid = React.memo(function EventConfigFormGrid({
  config,
  validationErrors,
  onFieldChange,
}: EventConfigFormGridProps): React.ReactElement {
  const handleName = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('eventName', e.target.value), [onFieldChange]);
  const handleType = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => onFieldChange('eventType', e.target.value as EventType), [onFieldChange]);
  const handleDate = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('date', e.target.value), [onFieldChange]);
  const handleLoc = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('location', e.target.value), [onFieldChange]);
  const handleSet = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => onFieldChange('setting', e.target.value as SettingType), [onFieldChange]);
  const handleGuests = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('guestCount', clampNumber(e.target.value, MIN_GUESTS, MAX_GUESTS)), [onFieldChange]);
  const handleCur = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => onFieldChange('currency', e.target.value as CurrencyCode), [onFieldChange]);
  const handleBudget = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('totalBudget', clampNumber(e.target.value, MIN_BUDGET, MAX_BUDGET_LIMIT)), [onFieldChange]);
  const handleTheme = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => onFieldChange('themeVibe', e.target.value), [onFieldChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-5" data-testid="event-config-grid">
      <div className="lg:col-span-2">
        <label htmlFor="input-event-name" className="block text-xs font-medium text-slate-700 mb-1.5">Event Name</label>
        <input id="input-event-name" data-testid="input-event-name" type="text" maxLength={120} value={config.eventName} aria-invalid={Boolean(validationErrors.eventName)} aria-describedby="hint-event-name" onChange={handleName} className={INPUT_CLASS} />
        <span id="hint-event-name" className="text-[11px] text-slate-600 block mt-1">{validationErrors.eventName || 'Official title displayed across timelines and exports.'}</span>
      </div>

      <div>
        <label htmlFor="select-event-type" className="block text-xs font-medium text-slate-700 mb-1.5">Event Category</label>
        <select id="select-event-type" data-testid="select-event-type" value={config.eventType} aria-invalid={false} aria-describedby="hint-event-type" onChange={handleType} className={INPUT_CLASS}>
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <span id="hint-event-type" className="text-[11px] text-slate-600 block mt-1">Select Wedding, Birthday, or Community Event.</span>
      </div>

      <div>
        <label htmlFor="input-event-date" className="block text-xs font-medium text-slate-700 mb-1.5">Target Date</label>
        <input id="input-event-date" data-testid="event-date-input" type="date" value={config.date} aria-invalid={Boolean(validationErrors.date)} aria-describedby="hint-event-date" onChange={handleDate} className={`${INPUT_CLASS} font-mono`} />
        <span id="hint-event-date" className="text-[11px] text-slate-600 block mt-1">Anchors backwards-planned milestones.</span>
      </div>

      <div className="lg:col-span-2">
        <label htmlFor="input-event-location" className="block text-xs font-medium text-slate-700 mb-1.5">Venue / City Location</label>
        <input id="input-event-location" data-testid="event-location-input" type="text" maxLength={140} value={config.location} aria-invalid={Boolean(validationErrors.location)} aria-describedby="hint-event-location" onChange={handleLoc} className={INPUT_CLASS} />
        <span id="hint-event-location" className="text-[11px] text-slate-600 block mt-1">City, venue, or civic district.</span>
      </div>

      <div>
        <label htmlFor="select-event-setting" className="block text-xs font-medium text-slate-700 mb-1.5">Spatial Setting</label>
        <select id="select-event-setting" data-testid="event-setting-select" value={config.setting} aria-invalid={false} aria-describedby="hint-event-setting" onChange={handleSet} className={INPUT_CLASS}>
          {SETTING_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span id="hint-event-setting" className="text-[11px] text-slate-600 block mt-1">Indoor, Outdoor, or Hybrid layout.</span>
      </div>

      <div>
        <label htmlFor="input-guest-count" className="block text-xs font-medium text-slate-700 mb-1.5">Guest Count</label>
        <input id="input-guest-count" data-testid="input-guest-count" type="number" min={MIN_GUESTS} max={MAX_GUESTS} value={config.guestCount} aria-invalid={Boolean(validationErrors.guestCount)} aria-describedby="hint-guest-count" onChange={handleGuests} className={`${INPUT_CLASS} font-mono tabular-nums`} />
        <span id="hint-guest-count" className="text-[11px] text-slate-600 block mt-1">Expected headcount ({MIN_GUESTS}–{MAX_GUESTS}).</span>
      </div>

      <div>
        <label htmlFor="input-total-budget" className="block text-xs font-medium text-slate-700 mb-1.5">Total Budget ({config.currency})</label>
        <div className="flex gap-1.5">
          <label htmlFor="select-currency" className="sr-only">Currency Code</label>
          <select id="select-currency" data-testid="event-currency-select" value={config.currency} aria-invalid={false} aria-describedby="hint-total-budget" onChange={handleCur} className="px-2 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800">
            {CURRENCY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input id="input-total-budget" data-testid="input-total-budget" type="number" min={MIN_BUDGET} max={MAX_BUDGET_LIMIT} step={500} value={config.totalBudget} aria-invalid={Boolean(validationErrors.totalBudget)} aria-describedby="hint-total-budget" onChange={handleBudget} className="w-full px-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-slate-900" />
        </div>
        <span id="hint-total-budget" className="text-[11px] text-slate-600 block mt-1">Includes 10% contingency reserve.</span>
      </div>

      <div className="lg:col-span-3">
        <label htmlFor="input-theme-vibe" className="block text-xs font-medium text-slate-700 mb-1.5">Theme / Aesthetic Vibe & Priorities</label>
        <input id="input-theme-vibe" data-testid="event-theme-input" type="text" maxLength={180} value={config.themeVibe} aria-invalid={false} aria-describedby="hint-theme-vibe" onChange={handleTheme} className={INPUT_CLASS} />
        <span id="hint-theme-vibe" className="text-[11px] text-slate-600 block mt-1">Keywords guiding AI concept curation and catering styles.</span>
      </div>
    </div>
  );
});
