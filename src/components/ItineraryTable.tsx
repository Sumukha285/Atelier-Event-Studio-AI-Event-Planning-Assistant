/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, MapPin, Plus, Trash2, User } from 'lucide-react';
import { TASK_STATUS_OPTIONS } from '../constants/event.constants';
import { ItineraryItem, TaskStatus } from '../types/event.types';
import { clampNumber, sanitizeText } from '../utils/eventLogic';

export interface ItineraryTableProps {
  readonly itinerary: readonly ItineraryItem[];
  readonly statusFilter: 'All' | TaskStatus;
  readonly onCycleStatus: (id: string) => void;
  readonly onSetStatus: (id: string, status: TaskStatus) => void;
  readonly onDeleteSlot: (id: string) => void;
  readonly onAddSlot: (slot: ItineraryItem) => void;
}

/**
 * Renders the chronological Day-Of Run-of-Show table and inline slot creation form.
 *
 * @param props - Itinerary slots, filter, and mutation callbacks
 * @returns ItineraryTable JSX element
 */
export function ItineraryTable({
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
  const [newLead, setNewLead] = useState('Lead Coordinator');

  const sorted = [...itinerary]
    .filter((i) => statusFilter === 'All' || i.status === statusFilter)
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const cleanAct = sanitizeText(newActivity, 140);
    if (!cleanAct) return;
    onAddSlot({
      id: `itin-custom-${Date.now()}`,
      timeSlot: sanitizeText(newTimeSlot, 10) || '19:00',
      durationMinutes: clampNumber(newDuration, 10, 480, 45),
      activity: cleanAct,
      locationZone: sanitizeText(newZone, 80) || 'Main Space',
      leadOwner: sanitizeText(newLead, 60) || 'Coordinator',
      status: 'Pending',
      notes: '',
    });
    setNewActivity('');
  };

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
              <tr key={slot.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="py-3 px-4 align-top font-mono font-semibold text-slate-900 tabular-nums">
                  {slot.timeSlot}
                </td>
                <td className="py-3 px-3 align-top font-mono text-xs text-slate-600 tabular-nums">
                  {slot.durationMinutes} min
                </td>
                <td className="py-3 px-4 align-top">
                  <div className="flex items-start gap-2.5">
                    <button
                      type="button"
                      onClick={() => onCycleStatus(slot.id)}
                      aria-label={`Toggle status for ${slot.activity}`}
                      className="mt-0.5 shrink-0 cursor-pointer"
                    >
                      {slot.status === 'Completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : slot.status === 'In Progress' ? (
                        <Clock className="w-4 h-4 text-amber-600" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-medium ${slot.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {slot.activity}
                      </p>
                      {slot.notes && <p className="text-xs text-slate-600 mt-0.5">{slot.notes}</p>}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 align-top text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    {slot.locationZone}
                  </span>
                </td>
                <td className="py-3 px-4 align-top text-xs text-slate-700">
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    {slot.leadOwner}
                  </span>
                </td>
                <td className="py-3 px-4 align-top text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <select
                      aria-label={`Status for ${slot.activity}`}
                      value={slot.status}
                      onChange={(e) => onSetStatus(slot.id, e.target.value as TaskStatus)}
                      className="text-xs font-mono px-2 py-1 rounded border border-slate-200 bg-white text-slate-700"
                    >
                      {TASK_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <button
                      type="button"
                      onClick={() => onDeleteSlot(slot.id)}
                      aria-label={`Remove ${slot.activity}`}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex flex-wrap items-center gap-2.5">
        <input
          type="time"
          aria-label="Slot time"
          value={newTimeSlot}
          onChange={(e) => setNewTimeSlot(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
        />
        <input
          type="number"
          aria-label="Duration minutes"
          min={10}
          max={480}
          step={5}
          value={newDuration}
          onChange={(e) => setNewDuration(Number(e.target.value))}
          className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-md text-slate-900"
        />
        <input
          type="text"
          data-testid="new-itinerary-activity-input"
          placeholder="Add Day-Of schedule activity..."
          value={newActivity}
          onChange={(e) => setNewActivity(e.target.value)}
          maxLength={140}
          className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
        />
        <input
          type="text"
          placeholder="Zone"
          value={newZone}
          onChange={(e) => setNewZone(e.target.value)}
          maxLength={60}
          className="w-32 px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-900"
        />
        <button
          type="submit"
          data-testid="add-itinerary-slot-btn"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Slot</span>
        </button>
      </form>
    </section>
  );
}
