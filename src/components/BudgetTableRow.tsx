/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';
import { CATEGORY_COLORS, MAX_BUDGET_LIMIT } from '../constants/event.constants';
import { BudgetCategoryItem, CurrencyCode } from '../types/event.types';
import { classifyCategoryBudgetStatus, formatCurrency } from '../utils/domain.utils';

export interface BudgetTableRowProps {
  readonly item: BudgetCategoryItem;
  readonly totalBudget: number;
  readonly currency: CurrencyCode;
  readonly canDelete: boolean;
  readonly onUpdateAmount: (id: string, field: 'estimatedCost' | 'actualSpent', rawValue: string) => void;
  readonly onUpdateNotes: (id: string, notes: string) => void;
  readonly onDelete: (id: string) => void;
}

const STATUS_BADGE_STYLES: Readonly<Record<string, string>> = {
  'Over Budget': 'text-rose-700 bg-rose-50 border-rose-200',
  'Near Limit': 'text-amber-800 bg-amber-50 border-amber-200',
  'Under Budget': 'text-emerald-800 bg-emerald-50 border-emerald-200',
  Unspent: 'text-slate-600 bg-slate-50 border-slate-200',
};

/**
 * @description Renders a single interactive row in the Smart Budget Allocator ledger table with icon+text health badges.
 * @param {BudgetTableRowProps} props - Row item, currency, and update callbacks
 * @returns {React.ReactElement} Memoized table row JSX element
 */
export const BudgetTableRow = React.memo(function BudgetTableRow({
  item,
  totalBudget,
  currency,
  canDelete,
  onUpdateAmount,
  onUpdateNotes,
  onDelete,
}: BudgetTableRowProps): React.ReactElement {
  const variance = item.estimatedCost - item.actualSpent;
  const statusLabel = classifyCategoryBudgetStatus(item.estimatedCost, item.actualSpent);
  const shareOfTotal = totalBudget > 0 ? Math.round((item.estimatedCost / totalBudget) * 100) : 0;
  const spentOfEst = item.estimatedCost > 0
    ? Math.min(100, Math.round((item.actualSpent / item.estimatedCost) * 100))
    : item.actualSpent > 0 ? 100 : 0;
  const color = CATEGORY_COLORS[item.category] ?? '#334155';
  const slug = item.category.toLowerCase().replace(/\s+/g, '-');

  const handleNotesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onUpdateNotes(item.id, e.target.value), [item.id, onUpdateNotes]);
  const handleEstChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onUpdateAmount(item.id, 'estimatedCost', e.target.value), [item.id, onUpdateAmount]);
  const handleActChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => onUpdateAmount(item.id, 'actualSpent', e.target.value), [item.id, onUpdateAmount]);
  const handleDeleteClick = useCallback(() => onDelete(item.id), [item.id, onDelete]);

  return (
    <tr data-testid={`budget-row-${slug}`} className="hover:bg-slate-50/70 transition-colors">
      <td className="px-5 py-3.5 align-top">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium text-slate-900">{item.category}</span>
        </div>
        <span id={`desc-share-${slug}`} className="text-[11px] font-mono text-slate-600 mt-0.5 block tabular-nums">
          {shareOfTotal}% of total ({item.recommendedPercent}% std)
        </span>
      </td>

      <td className="px-4 py-3.5 align-top">
        <label htmlFor={`notes-${slug}`} className="sr-only">{item.category} scope notes</label>
        <input
          id={`notes-${slug}`}
          type="text"
          value={item.notes}
          aria-invalid={false}
          aria-describedby={`desc-share-${slug}`}
          onChange={handleNotesChange}
          className="w-full text-xs text-slate-700 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-900 focus:bg-white rounded px-2 py-1 focus:outline-none"
        />
        <div className="mt-2 flex items-center gap-2 px-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${statusLabel === 'Over Budget' ? 'bg-rose-600' : statusLabel === 'Near Limit' ? 'bg-amber-500' : 'bg-slate-800'}`}
              style={{ width: `${spentOfEst}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-600 tabular-nums w-9 text-right">{spentOfEst}%</span>
        </div>
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <label htmlFor={`est-${slug}`} className="sr-only">{item.category} estimated cost</label>
        <input
          id={`est-${slug}`}
          type="number"
          data-testid={`budget-estimated-${slug}`}
          min={0}
          max={MAX_BUDGET_LIMIT}
          step={100}
          value={item.estimatedCost}
          aria-invalid={false}
          aria-describedby={`desc-share-${slug}`}
          onChange={handleEstChange}
          className="w-28 text-right px-2.5 py-1.5 text-xs font-mono tabular-nums bg-slate-50 border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <label htmlFor={`act-${slug}`} className="sr-only">{item.category} actual spent</label>
        <input
          id={`act-${slug}`}
          type="number"
          data-testid={`budget-actual-${slug}`}
          min={0}
          max={MAX_BUDGET_LIMIT}
          step={100}
          value={item.actualSpent}
          aria-invalid={statusLabel === 'Over Budget'}
          aria-describedby={`status-${slug}`}
          onChange={handleActChange}
          className="w-28 text-right px-2.5 py-1.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-md text-slate-900 focus:outline-none focus:border-slate-900"
        />
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        <div className={`text-xs font-mono font-semibold tabular-nums ${variance >= 0 ? 'text-slate-800' : 'text-rose-700'}`}>
          {variance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(variance), currency)}
        </div>
        <span
          id={`status-${slug}`}
          className={`inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded border ${STATUS_BADGE_STYLES[statusLabel] ?? 'text-slate-600'}`}
        >
          {statusLabel === 'Over Budget' ? <AlertOctagon className="w-3 h-3" aria-hidden="true" /> : statusLabel === 'Near Limit' ? <AlertTriangle className="w-3 h-3" aria-hidden="true" /> : <CheckCircle2 className="w-3 h-3" aria-hidden="true" />}
          <span>{statusLabel}</span>
        </span>
      </td>

      <td className="px-4 py-3.5 align-top text-right">
        {canDelete && (
          <button type="button" onClick={handleDeleteClick} aria-label={`Remove ${item.category} category`} className="p-1.5 text-slate-500 hover:text-rose-600 rounded cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  );
});
