/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import { Clock, ListChecks, Loader2, Plus, Wand2 } from 'lucide-react';
import { MILESTONE_WINDOWS, TASK_STATUS_OPTIONS, TOAST_DISMISS_MS } from '../constants/event.constants';
import { fetchTimeline, getRemainingCooldownMs } from '../services/gemini.service';
import { CountdownTask, EventConfig, ItineraryItem, MilestoneWindow, TaskStatus } from '../types/event.types';
import { computeTimelineProgress, sanitizeText } from '../utils/eventLogic';
import { CountdownMilestoneList } from './CountdownMilestoneList';
import { ItineraryTable } from './ItineraryTable';
import { StatusAlertBanner } from './ui/AtomicControls';

export interface TimelineViewProps {
  readonly config: EventConfig;
  readonly countdownTasks: readonly CountdownTask[];
  readonly itinerary: readonly ItineraryItem[];
  readonly onUpdateCountdown: (tasks: readonly CountdownTask[]) => void;
  readonly onUpdateItinerary: (items: readonly ItineraryItem[]) => void;
}

const NEXT_STATUS: Readonly<Record<TaskStatus, TaskStatus>> = {
  Pending: 'In Progress',
  'In Progress': 'Completed',
  Completed: 'Pending',
};

/**
 * Renders the Chronological Timeline & Run-of-Show workspace with Countdown Checklist and Day-Of Itinerary sub-tabs.
 * @param props - Event config, countdown tasks, itinerary slots, and update handlers
 * @returns TimelineView JSX element
 */
export function TimelineView({
  config,
  countdownTasks,
  itinerary,
  onUpdateCountdown,
  onUpdateItinerary,
}: TimelineViewProps): React.ReactElement {
  const [subTab, setSubTab] = useState<'countdown' | 'itinerary'>('countdown');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiBanner, setAiBanner] = useState<string | null>(null);
  const [isErrorBanner, setIsErrorBanner] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMilestone, setNewTaskMilestone] = useState<MilestoneWindow>('3 Months Out');
  const [newTaskCategory, setNewTaskCategory] = useState('Logistics');

  const stats = useMemo(() => computeTimelineProgress(countdownTasks, itinerary), [countdownTasks, itinerary]);

  const notify = (msg: string, isError: boolean = false): void => {
    setAiBanner(msg);
    setIsErrorBanner(isError);
    if (!isError) window.setTimeout(() => setAiBanner(null), TOAST_DISMISS_MS);
  };

  const handleGenerateAiTimeline = async (): Promise<void> => {
    const waitMs = getRemainingCooldownMs();
    if (waitMs > 0) {
      notify(`Please wait ${Math.ceil(waitMs / 1000)}s before another AI request.`);
      return;
    }
    setIsGenerating(true);
    try {
      const data = await fetchTimeline(config);
      onUpdateCountdown(data.countdownTasks);
      onUpdateItinerary(data.itinerary);
      notify(
        data.source === 'gemini'
          ? 'Generated customized Countdown Checklist & Day-of Itinerary via Gemini AI.'
          : `Generated tailored timeline milestones for ${config.eventName}.`
      );
    } catch {
      notify('Unable to reach AI timeline service. Please retry.', true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCountdownTask = (e: React.FormEvent): void => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newTaskTitle, 140);
    if (!cleanTitle) return;
    onUpdateCountdown([
      ...countdownTasks,
      { id: `task-custom-${Date.now()}`, milestone: newTaskMilestone, title: cleanTitle, category: sanitizeText(newTaskCategory, 40) || 'Logistics', status: 'Pending', assigneeOrNote: 'Added manually' },
    ]);
    setNewTaskTitle('');
  };

  return (
    <div className="space-y-6" data-testid="timeline-view">
      <section className="bg-white border border-slate-200/90 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
              Pillar 03 · Backwards-Planned Milestones & Hour-by-Hour Cue Sheet
            </span>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Chronological Timeline & Run-of-Show</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Track pre-event milestones across 5 lead windows and orchestrate your Day-Of execution schedule.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5" role="tablist">
              <button type="button" role="tab" data-testid="subtab-countdown" aria-selected={subTab === 'countdown'} onClick={() => setSubTab('countdown')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${subTab === 'countdown' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}>
                <ListChecks className="w-3.5 h-3.5" />
                <span>Countdown Checklist ({countdownTasks.length})</span>
              </button>
              <button type="button" role="tab" data-testid="subtab-itinerary" aria-selected={subTab === 'itinerary'} onClick={() => setSubTab('itinerary')} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer ${subTab === 'itinerary' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Day-of Itinerary ({itinerary.length})</span>
              </button>
            </div>
            <button type="button" data-testid="ai-generate-timeline-btn" onClick={() => void handleGenerateAiTimeline()} disabled={isGenerating} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-60 cursor-pointer">
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isGenerating ? 'Generating...' : 'AI Generate Timeline'}</span>
            </button>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
            <span>Completed: <strong className="font-mono text-emerald-700 tabular-nums">{stats.completedCount}/{stats.totalTasks} ({stats.completionPercent}%)</strong></span>
            <span>In Progress: <strong className="font-mono text-amber-700 tabular-nums">{stats.inProgressCount}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            {(['All', ...TASK_STATUS_OPTIONS] as const).map((st) => (
              <button key={st} type="button" data-testid={`timeline-filter-${st.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => setStatusFilter(st)} className={`px-2.5 py-1 text-xs rounded-md border cursor-pointer ${statusFilter === st ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>
                {st}
              </button>
            ))}
          </div>
        </div>

        {aiBanner && (
          <div className="mt-4">
            <StatusAlertBanner message={aiBanner} variant={isErrorBanner ? 'error' : 'info'} onDismiss={() => setAiBanner(null)} />
          </div>
        )}
      </section>

      {subTab === 'countdown' ? (
        <div className="space-y-4">
          <form onSubmit={handleAddCountdownTask} className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-wrap items-center gap-2.5">
            <select aria-label="Milestone Window" value={newTaskMilestone} onChange={(e) => setNewTaskMilestone(e.target.value as MilestoneWindow)} className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800">
              {MILESTONE_WINDOWS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="text" data-testid="new-countdown-task-input" placeholder="Add custom milestone deliverable..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} maxLength={140} className="flex-1 min-w-[220px] px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900" />
            <input type="text" aria-label="Task Category" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)} maxLength={40} className="w-32 px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900" />
            <button type="submit" data-testid="add-countdown-task-btn" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 text-white text-xs font-medium cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </form>

          <CountdownMilestoneList
            countdownTasks={countdownTasks}
            statusFilter={statusFilter}
            onCycleStatus={(id) => onUpdateCountdown(countdownTasks.map((t) => (t.id === id ? { ...t, status: NEXT_STATUS[t.status] } : t)))}
            onSetStatus={(id, status) => onUpdateCountdown(countdownTasks.map((t) => (t.id === id ? { ...t, status } : t)))}
            onDeleteTask={(id) => onUpdateCountdown(countdownTasks.filter((t) => t.id !== id))}
          />
        </div>
      ) : (
        <ItineraryTable
          itinerary={itinerary}
          statusFilter={statusFilter}
          onCycleStatus={(id) => onUpdateItinerary(itinerary.map((i) => (i.id === id ? { ...i, status: NEXT_STATUS[i.status] } : i)))}
          onSetStatus={(id, status) => onUpdateItinerary(itinerary.map((i) => (i.id === id ? { ...i, status } : i)))}
          onDeleteSlot={(id) => onUpdateItinerary(itinerary.filter((i) => i.id !== id))}
          onAddSlot={(slot) => onUpdateItinerary([...itinerary, slot])}
        />
      )}
    </div>
  );
}

export default TimelineView;
