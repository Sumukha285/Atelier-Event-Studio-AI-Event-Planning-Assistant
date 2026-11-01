import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  RefreshCw,
  Plus,
  Clock,
  CheckCircle2,
  Circle,
  Clock3,
  Trash2,
} from 'lucide-react';
import {
  CountdownTask,
  EventConfig,
  ItineraryItem,
  MilestoneWindow,
  TaskStatus,
} from '../types/event';
import {
  MILESTONE_WINDOWS,
  computeTimelineProgress,
  sanitizeText,
} from '../utils/eventLogic';

interface TimelineRunOfShowProps {
  config: EventConfig;
  countdownTasks: CountdownTask[];
  itinerary: ItineraryItem[];
  onUpdateCountdown: (tasks: CountdownTask[]) => void;
  onUpdateItinerary: (items: ItineraryItem[]) => void;
  onNotify: (message: string, type?: 'success' | 'error', retryFn?: () => void) => void;
}

const STATUS_OPTIONS: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export const TimelineRunOfShow: React.FC<TimelineRunOfShowProps> = ({
  config,
  countdownTasks,
  itinerary,
  onUpdateCountdown,
  onUpdateItinerary,
  onNotify,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'countdown' | 'itinerary'>('countdown');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [phaseFilter, setPhaseFilter] = useState<'All Phases' | MilestoneWindow>('All Phases');
  const [isGenerating, setIsGenerating] = useState(false);
  const [bannerMsg, setBannerMsg] = useState<string | null>(null);

  // Add new countdown task state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMilestone, setNewTaskMilestone] = useState<MilestoneWindow>('3 Months Out');
  const [newTaskCategory, setNewTaskCategory] = useState('Logistics');
  const [newTaskNote, setNewTaskNote] = useState('');

  // Add new itinerary slot state
  const [newSlotTime, setNewSlotTime] = useState('19:00');
  const [newSlotDuration, setNewSlotDuration] = useState(45);
  const [newSlotActivity, setNewSlotActivity] = useState('');
  const [newSlotZone, setNewSlotZone] = useState('Main Salon');
  const [newSlotLead, setNewSlotLead] = useState('Event Coordinator');

  const stats = useMemo(
    () => computeTimelineProgress(countdownTasks, itinerary),
    [countdownTasks, itinerary]
  );

  const handleAIGenerateTimeline = async () => {
    setIsGenerating(true);
    setBannerMsg(null);
    try {
      const res = await fetch('/api/ai/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate timeline.');
      }
      if (Array.isArray(data.countdownTasks)) {
        onUpdateCountdown(data.countdownTasks);
      }
      if (Array.isArray(data.itinerary)) {
        onUpdateItinerary(data.itinerary);
      }
      const msg = `Generated customized Countdown Checklist (${data.countdownTasks?.length || 0} milestones) and Day-of Itinerary (${data.itinerary?.length || 0} time blocks) for ${config.eventName}.`;
      setBannerMsg(msg);
      onNotify(msg, 'success');
    } catch (err: any) {
      const message = err?.message || 'Unable to generate timeline right now.';
      setBannerMsg(message);
      onNotify(message, 'error', handleAIGenerateTimeline);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskStatusChange = (taskId: string, nextStatus: TaskStatus) => {
    onUpdateCountdown(
      countdownTasks.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    onUpdateCountdown(countdownTasks.filter((t) => t.id !== taskId));
  };

  const handleAddCountdownTask = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = sanitizeText(newTaskTitle, 180);
    if (!cleanTitle) return;
    const created: CountdownTask = {
      id: `task-custom-${Date.now()}`,
      milestone: newTaskMilestone,
      title: cleanTitle,
      category: newTaskCategory,
      status: 'Pending',
      assigneeOrNote: sanitizeText(newTaskNote, 120) || 'Added manually',
    };
    onUpdateCountdown([...countdownTasks, created]);
    setNewTaskTitle('');
    setNewTaskNote('');
    onNotify(`Added task "${cleanTitle}" to ${newTaskMilestone}.`, 'success');
  };

  const handleSlotStatusChange = (slotId: string, nextStatus: TaskStatus) => {
    onUpdateItinerary(
      itinerary.map((item) => (item.id === slotId ? { ...item, status: nextStatus } : item))
    );
  };

  const handleDeleteSlot = (slotId: string) => {
    onUpdateItinerary(itinerary.filter((item) => item.id !== slotId));
  };

  const handleAddItinerarySlot = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanActivity = sanitizeText(newSlotActivity, 180);
    if (!cleanActivity) return;
    const created: ItineraryItem = {
      id: `itin-custom-${Date.now()}`,
      timeSlot: newSlotTime,
      durationMinutes: Math.max(5, Number(newSlotDuration) || 30),
      activity: cleanActivity,
      locationZone: sanitizeText(newSlotZone, 80) || 'Main Venue',
      leadOwner: sanitizeText(newSlotLead, 80) || 'Coordinator',
      status: 'Pending',
      notes: 'Custom schedule entry',
    };
    const sorted = [...itinerary, created].sort((a, b) =>
      a.timeSlot.localeCompare(b.timeSlot)
    );
    onUpdateItinerary(sorted);
    setNewSlotActivity('');
    onNotify(`Added "${cleanActivity}" at ${newSlotTime} to Day-of Run-of-Show.`, 'success');
  };

  const visibleMilestones =
    phaseFilter === 'All Phases'
      ? MILESTONE_WINDOWS
      : MILESTONE_WINDOWS.filter((m) => m === phaseFilter);

  return (
    <div className="space-y-8">
      {/* Header & Sub-Tab Controls */}
      <section
        aria-labelledby="timeline-heading"
        className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-medium text-slate-500">
              03 · Production Schedule & Milestones
            </p>
            <h2
              id="timeline-heading"
              className="text-xl lg:text-2xl font-semibold text-slate-900 mt-1"
            >
              Chronological Timeline & Run-of-Show
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Track backwards-planned milestones from 6 months out through hour-by-hour execution on{' '}
              <span className="font-mono tabular-nums font-medium text-slate-900">
                {config.date}
              </span>
              .
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            {/* Sub-Tabs Segmented Control */}
            <div
              role="tablist"
              aria-label="Timeline Views"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeSubTab === 'countdown'}
                onClick={() => setActiveSubTab('countdown')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'countdown'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Countdown Checklist ({countdownTasks.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeSubTab === 'itinerary'}
                onClick={() => setActiveSubTab('itinerary')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  activeSubTab === 'itinerary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Day-of Itinerary ({itinerary.length})
              </button>
            </div>

            <button
              type="button"
              onClick={handleAIGenerateTimeline}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Timeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Generate Timeline</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {bannerMsg && (
            <div
              role="status"
              className="mt-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs text-emerald-900"
            >
              <span>{bannerMsg}</span>
              <button
                type="button"
                onClick={() => setBannerMsg(null)}
                className="text-xs font-medium underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Progress Summary Bar */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <p className="text-xs text-slate-500">Countdown Completion Rate</p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-semibold font-mono tabular-nums text-slate-900">
                {stats.completionPercent}%
              </span>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({stats.completedCount} of {stats.totalTasks} tasks done)
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Countdown checklist completion percentage"
              aria-valuenow={stats.completionPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-2 w-full bg-slate-100 rounded-xs overflow-hidden"
            >
              <div
                className="h-full bg-emerald-600 transition-all"
                style={{ width: `${stats.completionPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-600 md:border-l md:border-slate-200 md:pl-6">
            <div>
              <span className="block text-slate-500">Completed</span>
              <strong className="text-base font-mono tabular-nums text-emerald-700">
                {stats.completedCount}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500">In Progress</span>
              <strong className="text-base font-mono tabular-nums text-amber-700">
                {stats.inProgressCount}
              </strong>
            </div>
            <div>
              <span className="block text-slate-500">Pending</span>
              <strong className="text-base font-mono tabular-nums text-slate-900">
                {stats.pendingCount}
              </strong>
            </div>
          </div>

          <div className="flex items-center justify-start md:justify-end gap-2">
            <span className="text-xs font-medium text-slate-500">Filter Status:</span>
            <div
              role="group"
              aria-label="Filter tasks by status"
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200"
            >
              {(['All', ...STATUS_OPTIONS] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  aria-pressed={statusFilter === st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Phase Filter Bar when viewing Countdown Checklist */}
        {activeSubTab === 'countdown' && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 mr-1">
              Milestone Phase:
            </span>
            <div
              role="group"
              aria-label="Filter by milestone phase"
              className="flex flex-wrap items-center gap-1.5"
            >
              {(['All Phases', ...MILESTONE_WINDOWS] as const).map((phase) => (
                <button
                  key={phase}
                  type="button"
                  aria-pressed={phaseFilter === phase}
                  onClick={() => setPhaseFilter(phase)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    phaseFilter === phase
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Sub-Tab 1: Countdown Checklist */}
      {activeSubTab === 'countdown' && (
        <div className="space-y-6">
          {/* Quick Add Milestone Task Form */}
          <form
            onSubmit={handleAddCountdownTask}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row items-stretch lg:items-end gap-3"
          >
            <div className="w-full lg:w-44">
              <label
                htmlFor="new-task-milestone"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Milestone Window
              </label>
              <select
                id="new-task-milestone"
                value={newTaskMilestone}
                onChange={(e) => setNewTaskMilestone(e.target.value as MilestoneWindow)}
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                {MILESTONE_WINDOWS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label
                htmlFor="new-task-title"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                New Checklist Task
              </label>
              <input
                id="new-task-title"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Confirm shuttle bus arrival schedule with hotel concierge"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="w-full lg:w-36">
              <label
                htmlFor="new-task-category"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Category
              </label>
              <select
                id="new-task-category"
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="Venue">Venue</option>
                <option value="Catering">Catering</option>
                <option value="Decor">Decor</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Photography">Photography</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>

            <div className="w-full lg:w-48">
              <label
                htmlFor="new-task-note"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Owner / Note
              </label>
              <input
                id="new-task-note"
                type="text"
                value={newTaskNote}
                onChange={(e) => setNewTaskNote(e.target.value)}
                placeholder="e.g., Lead Coordinator"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </form>

          {/* Milestone Groups */}
          {visibleMilestones.map((milestone) => {
            const mIndex = MILESTONE_WINDOWS.indexOf(milestone);
            const groupTasks = countdownTasks.filter(
              (t) =>
                t.milestone === milestone &&
                (statusFilter === 'All' || t.status === statusFilter)
            );

            return (
              <section
                key={milestone}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      0{mIndex + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">{milestone}</h3>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {groupTasks.length} {groupTasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                {groupTasks.length === 0 ? (
                  <div className="px-6 py-6 text-xs text-slate-500">
                    No tasks matching "{statusFilter}" in this milestone window.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {groupTasks.map((task) => {
                      const isDone = task.status === 'Completed';
                      return (
                        <div
                          key={task.id}
                          className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              aria-label={`Mark "${task.title}" as ${
                                isDone ? 'Pending' : 'Completed'
                              }`}
                              onClick={() =>
                                handleTaskStatusChange(
                                  task.id,
                                  isDone ? 'Pending' : 'Completed'
                                )
                              }
                              className="mt-0.5 text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              ) : task.status === 'In Progress' ? (
                                <Clock3 className="w-4 h-4 text-amber-600" />
                              ) : (
                                <Circle className="w-4 h-4" />
                              )}
                            </button>
                            <div>
                              <p
                                className={`text-sm font-medium ${
                                  isDone
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-900'
                                }`}
                              >
                                {task.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                                <span>{task.category}</span>
                                <span aria-hidden="true">·</span>
                                <span>{task.assigneeOrNote}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <div
                              role="group"
                              aria-label={`Status for ${task.title}`}
                              className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200"
                            >
                              {STATUS_OPTIONS.map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  aria-pressed={task.status === st}
                                  onClick={() => handleTaskStatusChange(task.id, st)}
                                  className={`px-2.5 py-1 text-[11px] font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                    task.status === st
                                      ? st === 'Completed'
                                        ? 'bg-emerald-700 text-white'
                                        : st === 'In Progress'
                                        ? 'bg-amber-600 text-white'
                                        : 'bg-white text-slate-900 shadow-2xs'
                                      : 'text-slate-600 hover:text-slate-900'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>

                            <button
                              type="button"
                              aria-label={`Delete task ${task.title}`}
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Sub-Tab 2: Day-of Hour-by-Hour Itinerary */}
      {activeSubTab === 'itinerary' && (
        <div className="space-y-6">
          {/* Quick Add Itinerary Slot Form */}
          <form
            onSubmit={handleAddItinerarySlot}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col lg:flex-row items-stretch lg:items-end gap-3"
          >
            <div className="w-full lg:w-28">
              <label
                htmlFor="new-slot-time"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Start Time
              </label>
              <input
                id="new-slot-time"
                type="time"
                value={newSlotTime}
                onChange={(e) => setNewSlotTime(e.target.value)}
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="w-full lg:w-28">
              <label
                htmlFor="new-slot-duration"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Duration (min)
              </label>
              <input
                id="new-slot-duration"
                type="number"
                min={5}
                step={5}
                value={newSlotDuration}
                onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                className="w-full h-9 px-2.5 text-xs font-mono tabular-nums bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="new-slot-activity"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Run-of-Show Activity
              </label>
              <input
                id="new-slot-activity"
                type="text"
                value={newSlotActivity}
                onChange={(e) => setNewSlotActivity(e.target.value)}
                placeholder="e.g., Golden Hour Brass Ensemble & Champagne Toast"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="w-full lg:w-40">
              <label
                htmlFor="new-slot-zone"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Location Zone
              </label>
              <input
                id="new-slot-zone"
                type="text"
                value={newSlotZone}
                onChange={(e) => setNewSlotZone(e.target.value)}
                placeholder="South Terrace"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="w-full lg:w-40">
              <label
                htmlFor="new-slot-lead"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Lead Owner
              </label>
              <input
                id="new-slot-lead"
                type="text"
                value={newSlotLead}
                onChange={(e) => setNewSlotLead(e.target.value)}
                placeholder="Stage Manager"
                className="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="h-9 px-4 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Time Slot</span>
            </button>
          </form>

          {/* Hour-by-Hour Schedule Table */}
          <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-base font-semibold text-slate-900">
                  Day-of Hour-by-Hour Run-of-Show ({config.date})
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {itinerary.length} scheduled blocks
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-6 w-28">Time</th>
                    <th className="py-3 px-4 w-24 text-right">Duration</th>
                    <th className="py-3 px-4">Activity & Cue Notes</th>
                    <th className="py-3 px-4">Zone & Lead</th>
                    <th className="py-3 px-6 text-right">Execution Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {itinerary
                    .filter(
                      (item) =>
                        statusFilter === 'All' || item.status === statusFilter
                    )
                    .map((slot) => {
                      const isDone = slot.status === 'Completed';
                      return (
                        <tr
                          key={slot.id}
                          className="hover:bg-slate-50/75 transition-colors align-top"
                        >
                          <td className="py-4 px-6 font-mono tabular-nums font-semibold text-slate-900">
                            {slot.timeSlot}
                          </td>
                          <td className="py-4 px-4 text-right font-mono tabular-nums text-xs text-slate-600">
                            {slot.durationMinutes} min
                          </td>
                          <td className="py-4 px-4">
                            <p
                              className={`font-medium ${
                                isDone
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900'
                              }`}
                            >
                              {slot.activity}
                            </p>
                            {slot.notes && (
                              <p className="text-xs text-slate-500 mt-1">
                                {slot.notes}
                              </p>
                            )}
                          </td>
                          <td className="py-4 px-4 text-xs text-slate-600">
                            <span className="font-medium text-slate-800">
                              {slot.locationZone}
                            </span>
                            <span aria-hidden="true"> · </span>
                            <span>{slot.leadOwner}</span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              <div
                                role="group"
                                aria-label={`Status for ${slot.activity}`}
                                className="inline-flex items-center p-0.5 bg-slate-100 rounded-md border border-slate-200"
                              >
                                {STATUS_OPTIONS.map((st) => (
                                  <button
                                    key={st}
                                    type="button"
                                    aria-pressed={slot.status === st}
                                    onClick={() => handleSlotStatusChange(slot.id, st)}
                                    className={`px-2 py-1 text-[11px] font-medium rounded-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                      slot.status === st
                                        ? st === 'Completed'
                                          ? 'bg-emerald-700 text-white'
                                          : st === 'In Progress'
                                          ? 'bg-amber-600 text-white'
                                          : 'bg-white text-slate-900 shadow-2xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                              <button
                                type="button"
                                aria-label={`Delete slot ${slot.activity}`}
                                onClick={() => handleDeleteSlot(slot.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
