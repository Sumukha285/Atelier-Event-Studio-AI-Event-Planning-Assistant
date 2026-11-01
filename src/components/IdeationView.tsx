/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { EVENT_TYPES, TOAST_DISMISS_MS } from '../constants/event.constants';
import { fetchCompleteBlueprint, fetchConcepts, getRemainingCooldownMs } from '../services/gemini.service';
import { CompleteBlueprintResponse, ConceptPackage, EventConfig, EventType } from '../types/event.types';
import { formatCurrency, validateEventConfig } from '../utils/eventLogic';
import { ConceptCard } from './ConceptCard';
import { EventConfigFormGrid } from './EventConfigFormGrid';
import { StatusAlertBanner } from './ui/AtomicControls';

export interface IdeationViewProps {
  readonly config: EventConfig;
  readonly concepts: readonly ConceptPackage[];
  readonly selectedConceptId: string | null;
  readonly onUpdateConfig: (nextConfig: EventConfig) => void;
  readonly onSwitchEventTypePreset: (eventType: EventType) => void;
  readonly onSelectConcept: (concept: ConceptPackage) => void;
  readonly onUpdateConcepts: (concepts: readonly ConceptPackage[]) => void;
  readonly onApplyCompleteBlueprint?: (blueprint: CompleteBlueprintResponse) => void;
}

/**
 * Renders the Event Setup & AI Ideation Hub with validated inputs, 3-second rate-limit cooldown, and 3 concept packages.
 * @param props - Event configuration, concepts, and state dispatch callbacks
 * @returns IdeationView JSX element
 */
export function IdeationView({
  config,
  concepts,
  selectedConceptId,
  onUpdateConfig,
  onSwitchEventTypePreset,
  onSelectConcept,
  onUpdateConcepts,
  onApplyCompleteBlueprint,
}: IdeationViewProps): React.ReactElement {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [isErrorBanner, setIsErrorBanner] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Readonly<Record<string, string>>>({});

  const showTimedBanner = (msg: string, isError: boolean = false): void => {
    setAiStatusMessage(msg);
    setIsErrorBanner(isError);
    if (!isError) window.setTimeout(() => setAiStatusMessage(null), TOAST_DISMISS_MS);
  };

  const handleFieldChange = <K extends keyof EventConfig>(field: K, value: EventConfig[K]): void => {
    const next = { ...config, [field]: value };
    setValidationErrors(validateEventConfig(next).errors);
    onUpdateConfig(next);
  };

  const handleBrainstormConcepts = async (): Promise<void> => {
    const check = validateEventConfig(config);
    setValidationErrors(check.errors);
    if (!check.valid) return;
    const waitMs = getRemainingCooldownMs();
    if (waitMs > 0) {
      showTimedBanner(`Please wait ${Math.ceil(waitMs / 1000)}s before another AI request.`);
      return;
    }
    setIsGenerating(true);
    try {
      const data = await fetchConcepts(config);
      onUpdateConcepts(data.concepts);
      showTimedBanner(
        data.source === 'gemini'
          ? 'Generated 3 bespoke concept packages with Gemini AI.'
          : 'Synthesized 3 tailored concept packages from your event parameters.'
      );
    } catch {
      showTimedBanner('Unable to reach AI ideation service. Using current studio concepts.', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCompleteBlueprint = async (): Promise<void> => {
    if (!onApplyCompleteBlueprint) return;
    const check = validateEventConfig(config);
    setValidationErrors(check.errors);
    if (!check.valid) return;
    const waitMs = getRemainingCooldownMs();
    if (waitMs > 0) {
      showTimedBanner(`Please wait ${Math.ceil(waitMs / 1000)}s before another AI request.`);
      return;
    }
    setIsGeneratingBlueprint(true);
    try {
      const data = await fetchCompleteBlueprint(config);
      onApplyCompleteBlueprint(data);
      showTimedBanner('Master Event Blueprint synchronized across Concepts, Budget, Timeline & Vendors.');
    } catch {
      showTimedBanner('Unable to synchronize complete blueprint. Please retry.', true);
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  const busy = isGenerating || isGeneratingBlueprint;
  const perGuest = Math.round(config.totalBudget / Math.max(1, config.guestCount));

  return (
    <div className="space-y-6" data-testid="ideation-view">
      <section className="bg-white border border-slate-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Pillar 01 · Event Configuration & Parameters
            </span>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Event Setup & AI Ideation Hub</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Configure your core event parameters or switch presets to tailor concepts, budget ratios, and logistics.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Event Archetype Presets">
            <span className="text-xs font-medium text-slate-600 mr-1">Archetype Preset:</span>
            {EVENT_TYPES.map((type) => {
              const active = config.eventType === type;
              return (
                <button
                  key={type}
                  type="button"
                  data-testid={`preset-btn-${type.toLowerCase().replace(/\s+/g, '-')}`}
                  aria-pressed={active}
                  onClick={() => onSwitchEventTypePreset(type)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    active ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <EventConfigFormGrid config={config} validationErrors={validationErrors} onFieldChange={handleFieldChange} />

        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span>Per-Guest Target: <strong className="font-mono text-slate-900 tabular-nums">{formatCurrency(perGuest, config.currency)}</strong></span>
            <span className="text-slate-300">·</span>
            <span>Setting: <strong className="text-slate-800">{config.setting}</strong></span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {onApplyCompleteBlueprint && (
              <button type="button" data-testid="generate-blueprint-btn" onClick={() => void handleGenerateCompleteBlueprint()} disabled={busy} className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-medium hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer">
                {isGeneratingBlueprint ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Sparkles className="w-4 h-4 text-blue-600" />}
                <span>{isGeneratingBlueprint ? 'Synthesizing Blueprint...' : 'AI Complete Blueprint'}</span>
              </button>
            )}
            <button type="button" data-testid="brainstorm-concepts-btn" onClick={() => void handleBrainstormConcepts()} disabled={busy} className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors disabled:opacity-60 cursor-pointer">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 text-amber-400" />}
              <span>{isGenerating ? 'Synthesizing 3 Concepts...' : 'AI Brainstorm 3 Concept Packages'}</span>
            </button>
          </div>
        </div>

        {aiStatusMessage && (
          <div className="mt-3">
            <StatusAlertBanner message={aiStatusMessage} variant={isErrorBanner ? 'error' : 'info'} onRetry={isErrorBanner ? () => void handleBrainstormConcepts() : undefined} onDismiss={() => setAiStatusMessage(null)} />
          </div>
        )}
      </section>

      <section aria-busy={busy} className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Curated Concept Packages ({concepts.length})</h3>
          <p className="text-xs text-slate-600">Select a concept package to anchor your event palette, decor direction, and culinary style.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {concepts.map((concept, idx) => (
            <ConceptCard key={concept.id} concept={concept} index={idx} isSelected={concept.id === selectedConceptId} onSelect={onSelectConcept} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default IdeationView;
