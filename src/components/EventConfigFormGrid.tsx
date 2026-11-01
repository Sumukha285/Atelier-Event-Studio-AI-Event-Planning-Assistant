/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, DollarSign, MapPin, Users } from 'lucide-react';
import {
  CURRENCY_CODES,
  EVENT_TYPES,
  MAX_BUDGET,
  MAX_GUESTS,
  MIN_BUDGET,
  MIN_GUESTS,
  SETTING_TYPES,
} from '../constants/event.constants';
import { CurrencyCode, EventConfig, EventType, SettingType } from '../types/event.types';
import { clampNumber } from '../utils/eventLogic';

export interface EventConfigFormGridProps {
  readonly config: EventConfig;
  readonly validationErrors: Readonly<Record<string, string>>;
  readonly onFieldChange: <K extends keyof EventConfig>(field: K, value: EventConfig[K]) => void;
}

/**
 * Renders the 8-field configuration input grid for the Event Setup & AI Ideation Hub.
 * @param props - Current config, validation errors, and field change callback
 * @returns Form grid JSX element
 */
export function EventConfigFormGrid({
  config,
  validationErrors,
  onFieldChange,
}: EventConfigFormGridProps): React.ReactElement {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-5">
      <div className="lg:col-span-2">
        <label htmlFor="event-name-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Event Name
        </label>
        <input
          id="event-name-input"
          data-testid="event-name-input"
          type="text"
          maxLength={120}
          value={config.eventName}
          onChange={(e) => onFieldChange('eventName', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
        />
        {validationErrors.eventName && (
          <p className="text-[11px] text-rose-600 mt-1" role="alert">{validationErrors.eventName}</p>
        )}
      </div>

      <div>
        <label htmlFor="event-type-select" className="block text-xs font-medium text-slate-700 mb-1.5">
          Event Category
        </label>
        <select
          id="event-type-select"
          data-testid="event-type-select"
          value={config.eventType}
          onChange={(e) => onFieldChange('eventType', e.target.value as EventType)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
        >
          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="event-date-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Target Date
        </label>
        <div className="relative">
          <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" aria-hidden="true" />
          <input
            id="event-date-input"
            data-testid="event-date-input"
            type="date"
            value={config.date}
            onChange={(e) => onFieldChange('date', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <label htmlFor="event-location-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Venue / City Location
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" aria-hidden="true" />
          <input
            id="event-location-input"
            data-testid="event-location-input"
            type="text"
            maxLength={140}
            value={config.location}
            onChange={(e) => onFieldChange('location', e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="event-setting-select" className="block text-xs font-medium text-slate-700 mb-1.5">
          Spatial Setting
        </label>
        <select
          id="event-setting-select"
          data-testid="event-setting-select"
          value={config.setting}
          onChange={(e) => onFieldChange('setting', e.target.value as SettingType)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
        >
          {SETTING_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="event-guests-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Guest Count
        </label>
        <div className="relative">
          <Users className="w-4 h-4 text-slate-500 absolute left-3 top-2.5 pointer-events-none" aria-hidden="true" />
          <input
            id="event-guests-input"
            data-testid="event-guests-input"
            type="number"
            min={MIN_GUESTS}
            max={MAX_GUESTS}
            value={config.guestCount}
            onChange={(e) => onFieldChange('guestCount', clampNumber(e.target.value, MIN_GUESTS, MAX_GUESTS, MIN_GUESTS))}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-slate-900"
          />
        </div>
      </div>

      <div>
        <label htmlFor="event-budget-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Total Budget ({config.currency})
        </label>
        <div className="flex gap-1.5">
          <select
            aria-label="Currency"
            data-testid="event-currency-select"
            value={config.currency}
            onChange={(e) => onFieldChange('currency', e.target.value as CurrencyCode)}
            className="px-2 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-slate-900"
          >
            {CURRENCY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="relative flex-1">
            <DollarSign className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" aria-hidden="true" />
            <input
              id="event-budget-input"
              data-testid="event-budget-input"
              type="number"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={500}
              value={config.totalBudget}
              onChange={(e) => onFieldChange('totalBudget', clampNumber(e.target.value, MIN_BUDGET, MAX_BUDGET, MIN_BUDGET))}
              className="w-full pl-7 pr-2.5 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 font-mono tabular-nums focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-3">
        <label htmlFor="event-theme-input" className="block text-xs font-medium text-slate-700 mb-1.5">
          Theme / Aesthetic Vibe & Priorities
        </label>
        <input
          id="event-theme-input"
          data-testid="event-theme-input"
          type="text"
          maxLength={180}
          value={config.themeVibe}
          onChange={(e) => onFieldChange('themeVibe', e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </div>
    </div>
  );
}
