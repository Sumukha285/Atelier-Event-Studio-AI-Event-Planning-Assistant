/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { CheckCircle2, Circle, Clock, MapPin, Plus, Trash2, User } from 'lucide-react';
import { TASK_STATUS_OPTIONS } from '../constants/event.constants';
import { ItineraryItem, TaskStatus } from '../types/event.types';
import { clampNumber, sanitizeText } from '../utils/security.utils';

export interface ItineraryTableProps {
  readonly itinerary: readonly ItineraryItem[];
  readonly statusFilter: 'All' | TaskStatus;
  readonly onCycleStatus: (id: string) => void;
  readonly onSetStatus: (id: string, status: TaskStatus) => void;
  readonly onDeleteSlot: (id: string) => void;
  readonly onAddSlot: (slot: ItineraryItem) => void;
}

interface SlotRowProps {
  readonly slot: ItineraryItem;
  readonly onCycleStatus: (id: string) => void;
  readonly onSetStatus: (id: string, status: TaskStatus) => void;
  readonly onDeleteSlot: (id: string) => void;
}

const SlotRow = React.memo(function SlotRow({
  slot,
  onCycleStatus,
  onSetStatus,
  onDeleteSlot,
}: SlotRowProps): React.ReactElement {
  const handleToggle = useCallback((): void => onCycleStatus(slot.id), [onCycleStatus, slot.id]);
  const handleSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    onSetStatus(slot.id, e.target.value as TaskStatus);
  }, [onSetStatus, slot.id]);
  const handleDelete = useCallback((): void => onDeleteSlot(slot.id), [onDeleteSlot, slot.id]);

  return (
    <tr className="hover:bg-slate-50/70 transition-colors">
      <td className="py-3 px-4 align-top font-mono font-semibold text-slate-900 tabular-nums">{slot.timeSlot}</td>
      <td className="py-3 px-3 align-top font-mono text-xs text-slate-600 tabular-nums">{slot.durationMinutes} min</td>
      <td className="py-3 px-4 align-top">
        <div className="flex items-start gap-2.5">
          <button type="button" onClick={handleToggle} aria-label={`Toggle status for ${slot.activity}`} className="mt-0.5 shrink-0 cursor-pointer">
            {slot.status === 'Completed' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : slot.status === 'In Progress' ? <Clock className="w-4 h-4 text-amber-600" /> : <Circle className="w-4 h-4 text-slate-400" />}
          </button>
          <div>
            <p className={`text-sm font-medium ${slot.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{slot.activity}</p>
            {slot.notes && <p id={`slot-desc-${slot.id}`} className="text-xs text-slate-600 mt-0.5">{slot.notes}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 px-4 align-top text-xs text-slate-700"><span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />{slot.locationZone}</span></td>
      <td className="py-3 px-4 align-top text-xs text-slate-700"><span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />{slot.leadOwner}</span></td>
      <td className="py-3 px-4 align-top text-right">
        <div className="inline-flex items-center gap-1.5">
          <label htmlFor={`slot-status-${slot.id}`} className="sr-only">Status for {slot.activity}</label>
          <select id={`slot-status-${slot.id}`} value={slot.status} aria-invalid={false} aria-describedby={`slot-desc-${slot.id}`} onChange={handleSelect} className="text-xs font-mono px-2 py-1 rounded border border-slate-200 bg-white text-slate-700">
            {TASK_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <button type="button" onClick={handleDelete} aria-label={`Remove ${slot.activity}`} className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </td>
    </tr>
  );
});

/**
 * @description Renders the chronological Day-Of Run-of-Show table and inline slot creation form.
 * @param {ItineraryTableProps} props - Itinerary slots, filter, and mutation callbacks
 * @returns {React.ReactElement} Memoized ItineraryTable JSX element
 */
export const ItineraryTable = React.memo(function ItineraryTable({
  itinerary,
  statusFilter,
  onCycleStatus,
  onSetStatus,
  onDeleteSlot,
  onAddSlot,
}: ItineraryTableProps): React.ReactElement {
  const [newTimeSlot, setNewTimeSlot] = useState('19:00');
  const [newDuration, setNewDuration] = useState(45);
  const [newActivity, setNewActivity] = useState('');
  const [newZone, setNewZone] = useState('Main Hall');

  const sorted = [...itinerary]
    .filter((i) => statusFilter === 'All' || i.status === statusFilter)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const handleSubmit = useCallback((e: React.FormEvent): void => {
    e.preventDefault();
    const cleanAct = sanitizeText(newActivity, 140);
    if (!cleanAct) return;
    onAddSlot({
      id: `itin-custom-${Date.now()}`,
      timeSlot: sanitizeText(newTimeSlot, 10) || '19:00',
      durationMinutes: clampNumber(newDuration, 10, 480),
      activity: cleanAct,
      locationZone: sanitizeText(newZone, 80) || 'Main Space',
      leadOwner: 'Lead Coordinator',
      status: 'Pending',
      notes: '',
    });
    setNewActivity('');
  }, [newActivity, newDuration, newTimeSlot, newZone, onAddSlot]);

  return (
    <section className="bg-white border border-slate-200/90 rounded-xl overflow-hidden" data-testid="itinerary-table-section">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
              <th className="py-3 px-4 w-28">Time</th>
              <th className="py-3 px-3 w-24">Duration</th>
              <th className="py-3 px-4">Run-of-Show Cue & Production Notes</th>
              <th className="py-3 px-4">Spatial Zone</th>
              <th className="py-3 px-4">Lead Owner</th>
              <th className="py-3 px-4 text-right w-36">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/60 text-sm">
            {sorted.map((slot) => (
              <SlotRow key={slot.id} slot={slot} onCycleStatus={onCycleStatus} onSetStatus={onSetStatus} onDeleteSlot={onDeleteSlot} />
            ))}
          </tbody>
        </table>
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
        <label htmlFor="slot-time-input" className="sr-only">Slot time</label>
        <input id="slot-time-input" type="time" value={newTimeSlot} aria-invalid={false} aria-describedby="slot-form-desc" onChange={(e) => setNewTimeSlot(e.target.value)} className="px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900" />
        <label htmlFor="slot-duration-input" className="sr-only">Duration minutes</label>
        <input id="slot-duration-input" type="number" min={10} max={480} step={5} value={newDuration} aria-invalid={false} aria-describedby="slot-form-desc" onChange={(e) => setNewDuration(Number(e.target.value))} className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900" />
        <label htmlFor="new-itinerary-activity-input" className="sr-only">Schedule activity</label>
        <input id="new-itinerary-activity-input" type="text" data-testid="new-itinerary-activity-input" placeholder="Add Day-Of schedule activity..." value={newActivity} aria-invalid={false} aria-describedby="slot-form-desc" onChange={(e) => setNewActivity(e.target.value)} maxLength={140} className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900" />
        <label htmlFor="slot-zone-input" className="sr-only">Spatial Zone</label>
        <input id="slot-zone-input" type="text" placeholder="Zone" value={newZone} aria-invalid={false} aria-describedby="slot-form-desc" onChange={(e) => setNewZone(e.target.value)} maxLength={60} className="w-32 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900" />
        <span id="slot-form-desc" className="sr-only">Add a custom run-of-show activity slot.</span>
        <button type="submit" data-testid="add-itinerary-slot-btn" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Slot</span>
        </button>
      </form>
    </section>
  );
});
