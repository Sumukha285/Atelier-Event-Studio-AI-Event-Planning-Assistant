/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback } from 'react';
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react';
import { MILESTONE_WINDOWS, TASK_STATUS_OPTIONS } from '../constants/event.constants';
import { CountdownTask, TaskStatus } from '../types/event.types';

export interface CountdownMilestoneListProps {
  readonly countdownTasks: readonly CountdownTask[];
  readonly statusFilter: 'All' | TaskStatus;
  readonly onCycleStatus: (id: string) => void;
  readonly onSetStatus: (id: string, status: TaskStatus) => void;
  readonly onDeleteTask: (id: string) => void;
}

interface TaskRowProps {
  readonly task: CountdownTask;
  readonly index: number;
  readonly onCycleStatus: (id: string) => void;
  readonly onSetStatus: (id: string, status: TaskStatus) => void;
  readonly onDeleteTask: (id: string) => void;
}

const TaskRow = React.memo(function TaskRow({
  task,
  index,
  onCycleStatus,
  onSetStatus,
  onDeleteTask,
}: TaskRowProps): React.ReactElement {
  const handleToggle = useCallback((): void => onCycleStatus(task.id), [onCycleStatus, task.id]);
  const handleSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>): void => {
    onSetStatus(task.id, e.target.value as TaskStatus);
  }, [onSetStatus, task.id]);
  const handleDelete = useCallback((): void => onDeleteTask(task.id), [onDeleteTask, task.id]);

  return (
    <div className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60">
      <div className="flex items-start gap-3">
        <button
          type="button"
          data-testid={`timeline-checkbox-${index}`}
          onClick={handleToggle}
          aria-label={`Cycle status for ${task.title}`}
          className="mt-0.5 shrink-0 cursor-pointer"
        >
          {task.status === 'Completed' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ) : task.status === 'In Progress' ? (
            <Clock className="w-4 h-4 text-amber-600" />
          ) : (
            <Circle className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <div>
          <p className={`text-sm font-medium ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {task.title}
          </p>
          <p id={`task-desc-${task.id}`} className="text-[11px] font-mono text-slate-600 mt-0.5">
            {task.category} {task.assigneeOrNote ? `· ${task.assigneeOrNote}` : ''}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label htmlFor={`task-status-${task.id}`} className="sr-only">Status for {task.title}</label>
        <select
          id={`task-status-${task.id}`}
          data-testid={`timeline-status-select-${index}`}
          value={task.status}
          aria-invalid={false}
          aria-describedby={`task-desc-${task.id}`}
          onChange={handleSelect}
          className="text-xs font-mono px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700"
        >
          {TASK_STATUS_OPTIONS.map((st) => <option key={st} value={st}>{st}</option>)}
        </select>
        <button
          type="button"
          data-testid={`timeline-delete-btn-${index}`}
          onClick={handleDelete}
          aria-label={`Delete ${task.title}`}
          className="p-1 text-slate-500 hover:text-rose-600 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
});

/**
 * @description Renders the 5 chronological countdown milestone sections with interactive status selectors.
 * @param {CountdownMilestoneListProps} props - Countdown tasks, filter, and task mutation callbacks
 * @returns {React.ReactElement} Memoized milestone sections JSX element
 */
export const CountdownMilestoneList = React.memo(function CountdownMilestoneList({
  countdownTasks,
  statusFilter,
  onCycleStatus,
  onSetStatus,
  onDeleteTask,
}: CountdownMilestoneListProps): React.ReactElement {
  return (
    <div className="space-y-4">
      {MILESTONE_WINDOWS.map((window) => {
        const list = countdownTasks.filter((t) => t.milestone === window && (statusFilter === 'All' || t.status === statusFilter));
        if (list.length === 0) return null;
        return (
          <section key={window} className="bg-white border border-slate-200/90 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 font-mono">{window}</h3>
              <span className="text-[11px] font-mono text-slate-600">{list.length} items</span>
            </div>
            <div className="divide-y divide-slate-200/60">
              {list.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={countdownTasks.indexOf(task)}
                  onCycleStatus={onCycleStatus}
                  onSetStatus={onSetStatus}
                  onDeleteTask={onDeleteTask}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
});
