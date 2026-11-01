/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { Check, Music, Palette, Sparkles, UtensilsCrossed } from 'lucide-react';
import { ColorSwatch, ConceptPackage } from '../types/event.types';

export interface ConceptCardProps {
  readonly concept: ConceptPackage;
  readonly index: number;
  readonly isSelected: boolean;
  readonly onSelect: (concept: ConceptPackage) => void;
}

/**
 * @description Renders an individual color swatch cell inside a concept card.
 * @param {{ readonly swatch: ColorSwatch }} props - Swatch item
 * @returns {React.ReactElement} Swatch cell element
 */
function SwatchCell({ swatch }: { readonly swatch: ColorSwatch }): React.ReactElement {
  return (
    <div className="border border-slate-200/80 rounded-md p-1.5 bg-slate-50/50">
      <div
        className="h-6 w-full rounded-sm border border-black/10"
        style={{ backgroundColor: swatch.hex }}
        title={`${swatch.name} (${swatch.hex})`}
      />
      <p className="text-[10px] font-medium text-slate-700 truncate mt-1">{swatch.name}</p>
      <p className="text-[10px] font-mono text-slate-600">{swatch.hex}</p>
    </div>
  );
}

/**
 * @description Renders a single bespoke AI concept package card with color swatches, decor, entertainment, and catering details.
 * @param {ConceptCardProps} props - Concept data, index, selection state, and selection callback
 * @returns {React.ReactElement} Concept card article element
 */
export const ConceptCard = React.memo(function ConceptCard({
  concept,
  index,
  isSelected,
  onSelect,
}: ConceptCardProps): React.ReactElement {
  const handleSelectClick = useCallback((): void => {
    onSelect(concept);
  }, [concept, onSelect]);

  return (
    <article
      data-testid={`concept-card-${index}`}
      className={`bg-white rounded-xl border transition-all flex flex-col justify-between p-5 ${
        isSelected ? 'border-slate-900 ring-1 ring-slate-900' : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600">CONCEPT 0{index + 1}</span>
            <h4 className="text-base font-semibold text-slate-900 mt-0.5 tracking-tight">{concept.title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{concept.tagline}</p>
          </div>
          {isSelected && (
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-700 font-semibold shrink-0 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              Active
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">{concept.atmosphereDescription}</p>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-2">
            <Palette className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Color Palette</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {concept.colorPalette.map((swatch, idx) => (
              <SwatchCell key={`${swatch.hex}-${idx}`} swatch={swatch} />
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 block mb-1.5">
            Spatial & Decor Architecture
          </span>
          <ul className="space-y-1">
            {concept.decorIdeas.map((idea, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 leading-relaxed">
                <span className="text-slate-500 font-mono text-[10px] mt-0.5">0{idx + 1}</span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1">
            <Music className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sonic & Entertainment Programming</span>
          </div>
          <ul className="space-y-1">
            {concept.entertainmentSuggestions.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                <span className="text-slate-500">·</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              <UtensilsCrossed className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Culinary Direction</span>
            </div>
            <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">{concept.cateringStyle}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-2.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 block">Signature Moment</span>
            <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">{concept.signatureMoment}</p>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-slate-100">
        <button
          type="button"
          data-testid={`select-concept-btn-${index}`}
          onClick={handleSelectClick}
          className={`w-full py-2 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
            isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
          }`}
        >
          {isSelected ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />}
          <span>{isSelected ? 'Selected as Active Direction' : 'Apply Concept Direction'}</span>
        </button>
      </div>
    </article>
  );
});
