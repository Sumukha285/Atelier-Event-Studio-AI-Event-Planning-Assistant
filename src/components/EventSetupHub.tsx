import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Check,
  MapPin,
  Users,
  DollarSign,
  Palette,
  Utensils,
  Music,
  RefreshCw,
  AlertCircle,
  Pin,
  Layers,
} from 'lucide-react';
import {
  CompleteBlueprintResponse,
  ConceptPackage,
  CurrencyCode,
  EventConfig,
  EventType,
  SettingType,
} from '../types/event';
import {
  CURRENCY_SYMBOLS,
  formatCurrency,
  sanitizeText,
  validateEventConfig,
} from '../utils/eventLogic';

interface EventSetupHubProps {
  config: EventConfig;
  concepts: ConceptPackage[];
  selectedConceptId: string | null;
  onUpdateConfig: (updated: EventConfig) => void;
  onSwitchPreset: (eventType: EventType) => void;
  onSelectConcept: (concept: ConceptPackage) => void;
  onUpdateConcepts: (concepts: ConceptPackage[]) => void;
  onApplyCompleteBlueprint: (blueprint: CompleteBlueprintResponse) => void;
  onNotify: (message: string, type?: 'success' | 'error', retryFn?: () => void) => void;
}

const EVENT_TYPES: EventType[] = ['Wedding', 'Birthday', 'Community Event'];
const SETTING_TYPES: SettingType[] = ['Indoor', 'Outdoor', 'Hybrid / City'];
const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export const EventSetupHub: React.FC<EventSetupHubProps> = ({
  config,
  concepts,
  selectedConceptId,
  onUpdateConfig,
  onSwitchPreset,
  onSelectConcept,
  onUpdateConcepts,
  onApplyCompleteBlueprint,
  onNotify,
}) => {
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const currency = config.currency || 'USD';

  const handleFieldChange = <K extends keyof EventConfig>(key: K, value: EventConfig[K]) => {
    const sanitizedVal =
      typeof value === 'string' && key !== 'date'
        ? (sanitizeText(value, 180) as EventConfig[K])
        : value;
    const updated = { ...config, [key]: value };
    // Preserve natural typing spaces while preventing HTML tags
    if (typeof value === 'string' && /<[^>]*>/.test(value)) {
      updated[key] = sanitizedVal;
    }
    onUpdateConfig(updated);
    if (fieldErrors[key]) {
      const nextErrors = { ...fieldErrors };
      delete nextErrors[key];
      setFieldErrors(nextErrors);
    }
  };

  const handleBrainstorm = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setStatusBanner(null);

    const validation = validateEventConfig(config);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setErrorMsg('Please resolve the highlighted configuration fields before generating concepts.');
      return;
    }

    setFieldErrors({});
    setIsBrainstorming(true);

    try {
      const res = await fetch('/api/ai/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate concepts.');
      }
      if (Array.isArray(data.concepts) && data.concepts.length > 0) {
        onUpdateConcepts(data.concepts);
        const msg = `Generated 3 personalized concept packages tailored for ${config.eventName} (${config.guestCount} guests · ${formatCurrency(config.totalBudget, currency)}).`;
        setStatusBanner(msg);
        onNotify(msg, 'success');
      }
    } catch (err: any) {
      const message = err?.message || 'Unable to generate AI concept packages right now.';
      setErrorMsg(message);
      onNotify(message, 'error', () => handleBrainstorm());
    } finally {
      setIsBrainstorming(false);
    }
  };

  const handleGenerateCompleteBlueprint = async () => {
    setErrorMsg(null);
    setStatusBanner(null);

    const validation = validateEventConfig(config);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setErrorMsg('Please resolve the highlighted configuration fields before generating the blueprint.');
      return;
    }

    setFieldErrors({});
    setIsGeneratingBlueprint(true);

    try {
      const res = await fetch('/api/ai/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate complete blueprint.');
      }
      onApplyCompleteBlueprint(data as CompleteBlueprintResponse);
      const msg = `Complete Event Blueprint generated in a single pass: 3 Concepts, 7 Budget Allocations, ${data.countdownTasks?.length || 0} Milestones, and ${data.vendors?.length || 0} Vendors.`;
      setStatusBanner(msg);
      onNotify(msg, 'success');
    } catch (err: any) {
      const message = err?.message || 'Unable to generate complete blueprint right now.';
      setErrorMsg(message);
      onNotify(message, 'error', handleGenerateCompleteBlueprint);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const perGuestBudget = useMemo(
    () => (config.guestCount > 0 ? Math.round(config.totalBudget / config.guestCount) : 0),
    [config.totalBudget, config.guestCount]
  );

  const isBusy = isBrainstorming || isGeneratingBlueprint;

  return (
    <div className="space-y-8">
      {/* Section 1: Event Configuration & Quick-Setup */}
      <section
        aria-labelledby="setup-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              01 · Event Context & Quick-Setup
            </p>
            <h2
              id="setup-heading"
              className="text-xl lg:text-2xl font-semibold text-slate-900 mt-1"
            >
              Event Setup & AI Ideation Studio
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Configure core parameters for your event or load a curated preset template to generate tailored creative concepts.
            </p>
          </div>

          {/* Preset Template Switcher */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-medium text-slate-500 mr-1">
              Load Template:
            </span>
            <div
              role="group"
              aria-label="Event Type Presets"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200"
            >
              {EVENT_TYPES.map((type) => {
                const isActive = config.eventType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => {
                      setFieldErrors({});
                      setErrorMsg(null);
                      onSwitchPreset(type);
                      setStatusBanner(
                        `Loaded complete ${type} template with tailored budget, timeline, and vendors.`
                      );
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div aria-live="polite">
          {errorMsg && (
            <div
              role="alert"
              className="mt-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between gap-2.5 text-xs text-red-800"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={() => handleBrainstorm()}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-red-300 rounded-md text-red-800 hover:bg-red-100 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {statusBanner && !errorMsg && (
            <div
              role="status"
              className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2.5 text-xs text-emerald-900"
            >
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{statusBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setStatusBanner(null)}
                className="text-xs font-medium text-emerald-800 underline hover:text-emerald-950 whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <form onSubmit={handleBrainstorm} className="mt-6 space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Event Type */}
            <div>
              <label
                htmlFor="event-type-select"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Event Type
              </label>
              <select
                id="event-type-select"
                value={config.eventType}
                onChange={(e) => handleFieldChange('eventType', e.target.value as EventType)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Title */}
            <div className="lg:col-span-2">
              <label
                htmlFor="event-name-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Event Title
              </label>
              <input
                id="event-name-input"
                type="text"
                value={config.eventName}
                onChange={(e) => handleFieldChange('eventName', e.target.value)}
                placeholder="e.g., Clara & Julian Conservatory Wedding"
                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 ${
                  fieldErrors.eventName ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.eventName && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.eventName}</p>
              )}
            </div>

            {/* Event Date */}
            <div>
              <label
                htmlFor="event-date-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Target Date
              </label>
              <input
                id="event-date-input"
                type="date"
                value={config.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className={`w-full h-10 px-3 py-2 text-sm font-mono tabular-nums bg-white border rounded-lg text-slate-900 ${
                  fieldErrors.date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>
              )}
            </div>

            {/* Location / City */}
            <div className="lg:col-span-2">
              <label
                htmlFor="event-location-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Location / Venue City
              </label>
              <input
                id="event-location-input"
                type="text"
                value={config.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="e.g., Hudson Valley Botanical Glasshouse, NY"
                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 ${
                  fieldErrors.location ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.location && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.location}</p>
              )}
            </div>

            {/* Setting */}
            <div>
              <label
                htmlFor="event-setting-select"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Spatial Setting
              </label>
              <select
                id="event-setting-select"
                value={config.setting}
                onChange={(e) => handleFieldChange('setting', e.target.value as SettingType)}
                className="w-full h-10 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                {SETTING_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Guest Count */}
            <div>
              <label
                htmlFor="guest-count-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Guest Count
              </label>
              <input
                id="guest-count-input"
                type="number"
                min={1}
                max={50000}
                value={config.guestCount}
                onChange={(e) => handleFieldChange('guestCount', Number(e.target.value))}
                className={`w-full h-10 px-3 py-2 text-sm font-mono tabular-nums bg-white border rounded-lg text-slate-900 ${
                  fieldErrors.guestCount ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.guestCount && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.guestCount}</p>
              )}
            </div>

            {/* Currency & Total Budget */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor="currency-select"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={currency}
                  onChange={(e) =>
                    handleFieldChange('currency', e.target.value as CurrencyCode)
                  }
                  className="w-full h-10 px-2 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-900"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c} ({CURRENCY_SYMBOLS[c]})
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label
                  htmlFor="total-budget-input"
                  className="block text-xs font-medium text-slate-700 mb-1.5"
                >
                  Total Budget ({CURRENCY_SYMBOLS[currency]})
                </label>
                <input
                  id="total-budget-input"
                  type="number"
                  min={100}
                  step={500}
                  value={config.totalBudget}
                  onChange={(e) => handleFieldChange('totalBudget', Number(e.target.value))}
                  className={`w-full h-10 px-3 py-2 text-sm font-mono tabular-nums bg-white border rounded-lg text-slate-900 ${
                    fieldErrors.totalBudget ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
              </div>
              {fieldErrors.totalBudget && (
                <p className="col-span-3 mt-0.5 text-xs text-red-600">
                  {fieldErrors.totalBudget}
                </p>
              )}
            </div>

            {/* Theme / Vibe Preferences */}
            <div className="lg:col-span-3">
              <label
                htmlFor="theme-vibe-input"
                className="block text-xs font-medium text-slate-700 mb-1.5"
              >
                Theme & Atmosphere Direction
              </label>
              <input
                id="theme-vibe-input"
                type="text"
                value={config.themeVibe}
                onChange={(e) => handleFieldChange('themeVibe', e.target.value)}
                placeholder="e.g., Architectural Botanical & Candlelit Modernism"
                className={`w-full h-10 px-3 py-2 text-sm bg-white border rounded-lg text-slate-900 ${
                  fieldErrors.themeVibe ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {fieldErrors.themeVibe && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.themeVibe}</p>
              )}
            </div>
          </div>

          {/* Summary Bar & Dual AI Action Triggers */}
          <div className="pt-4 border-t border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <strong className="font-mono tabular-nums text-slate-900">
                  {config.guestCount.toLocaleString()}
                </strong>{' '}
                guests
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(config.totalBudget, currency)}
                </strong>{' '}
                total
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Est.{' '}
                <strong className="font-mono tabular-nums text-slate-900">
                  {formatCurrency(perGuestBudget, currency)}
                </strong>{' '}
                / guest
              </span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {config.setting}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                disabled={isBusy}
                onClick={handleGenerateCompleteBlueprint}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Building Full Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Generate Complete Event Blueprint</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isBusy}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isBrainstorming ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing 3 Concepts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI Brainstorm Concepts</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Section 2: AI Concept & Ideation Studio */}
      <section aria-labelledby="concepts-heading" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-medium text-slate-500">
              02 · Personalized Creative Directions
            </p>
            <h3 id="concepts-heading" className="text-lg font-semibold text-slate-900 mt-0.5">
              Curated Concept Packages ({concepts.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Pin a concept package to anchor your event theme, color palette, and culinary direction.
          </p>
        </div>

        {/* Responsive Skeleton Loaders during AI Generation */}
        {isBusy ? (
          <div
            role="status"
            aria-label="Generating personalized event concepts"
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {[0, 1, 2].map((skeletonIdx) => (
              <div
                key={skeletonIdx}
                className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 animate-pulse"
              >
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-slate-200 rounded" />
                  <div className="h-5 w-48 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                </div>
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100">
                  {[0, 1, 2, 3].map((sw) => (
                    <div key={sw} className="h-10 bg-slate-200 rounded-md" />
                  ))}
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="h-3 w-36 bg-slate-200 rounded" />
                  <div className="h-3 w-full bg-slate-100 rounded" />
                  <div className="h-3 w-5/6 bg-slate-100 rounded" />
                </div>
                <div className="h-9 w-full bg-slate-200 rounded-lg mt-4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {concepts.map((concept, index) => {
              const isSelected = selectedConceptId === concept.id;
              return (
                <article
                  key={concept.id}
                  className={`flex flex-col justify-between bg-white rounded-xl border transition-colors p-6 ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-5">
                    {/* Kicker & Title */}
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="font-mono tabular-nums">
                          Concept 0{index + 1} · {config.eventType}
                        </span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                            <Pin className="w-3.5 h-3.5" />
                            Pinned Concept
                          </span>
                        )}
                      </div>
                      <h4 className="text-lg font-semibold text-slate-900 mt-1.5">
                        {concept.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {concept.tagline}
                      </p>
                    </div>

                    {/* Color Palette Swatches */}
                    <div className="pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-2.5">
                        <Palette className="w-3.5 h-3.5 text-slate-400" />
                        <span>Color Palette</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {concept.colorPalette.map((swatch, sIdx) => (
                          <div key={`${concept.id}-swatch-${sIdx}`} className="space-y-1">
                            <div
                              className="h-8 w-full rounded-md border border-slate-200"
                              style={{ backgroundColor: swatch.hex }}
                              title={`${swatch.name} (${swatch.hex})`}
                            />
                            <p className="text-[11px] font-medium text-slate-800 truncate">
                              {swatch.name}
                            </p>
                            <p className="text-[10px] font-mono tabular-nums text-slate-500">
                              {swatch.hex}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Atmosphere */}
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {concept.atmosphereDescription}
                    </p>

                    {/* Decor Ideas */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <p className="text-xs font-semibold text-slate-900">
                        Spatial & Decor Elements
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                        {concept.decorIdeas.map((idea, i) => (
                          <li key={i} className="leading-relaxed">
                            {idea}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Entertainment Suggestions */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                        <Music className="w-3.5 h-3.5 text-slate-400" />
                        <span>Entertainment & Sound</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-600 list-disc pl-4">
                        {concept.entertainmentSuggestions.map((ent, i) => (
                          <li key={i} className="leading-relaxed">
                            {ent}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Catering Style & Signature Moment */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                          <Utensils className="w-3.5 h-3.5 text-slate-400" />
                          <span>Culinary Direction</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {concept.cateringStyle}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          Signature Moment
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {concept.signatureMoment}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Pin Action Button */}
                  <div className="pt-5 mt-6 border-t border-slate-100">
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        onSelectConcept(concept);
                        const msg = `Pinned "${concept.title}" as your active event concept.`;
                        setStatusBanner(msg);
                        onNotify(msg, 'success');
                      }}
                      className={`w-full py-2 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 border border-slate-300'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>
                        {isSelected ? 'Pinned to Event Plan' : `Pin "${concept.title}"`}
                      </span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
