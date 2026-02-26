"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import type { TaskFilter, TaskStatus, TaskPriority, Task, TeamMembership } from "@/types/models";

type TaskFilterBarProps = {
  tasks: Task[];
  members: TeamMembership[];
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
};

export function TaskFilterBar({
  tasks,
  members,
  filter,
  onFilterChange,
}: TaskFilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values from tasks for dropdowns
  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach((task) => {
      task.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [tasks]);

  const uniqueAssignees = useMemo(() => {
    const assigneeSet = new Set<string>();
    tasks.forEach((task) => {
      if (task.assigneeUserId) {
        assigneeSet.add(task.assigneeUserId);
      }
    });
    return Array.from(assigneeSet);
  }, [tasks]);

  function updateFilter(updates: Partial<TaskFilter>) {
    onFilterChange({ ...filter, ...updates });
  }

  function clearFilters() {
    onFilterChange({});
  }

  function toggleStatus(status: TaskStatus) {
    const current = filter.status || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    updateFilter({ status: updated.length > 0 ? updated : undefined });
  }

  function togglePriority(priority: TaskPriority) {
    const current = filter.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    updateFilter({ priority: updated.length > 0 ? updated : undefined });
  }

  function toggleTag(tag: string) {
    const current = filter.tags || [];
    const updated = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    updateFilter({ tags: updated.length > 0 ? updated : undefined });
  }

  function toggleAssignee(userId: string) {
    const current = filter.assigneeUserId || [];
    const updated = current.includes(userId)
      ? current.filter((id) => id !== userId)
      : [...current, userId];
    updateFilter({ assigneeUserId: updated.length > 0 ? updated : undefined });
  }

  const hasActiveFilters =
    (filter.status && filter.status.length > 0) ||
    (filter.priority && filter.priority.length > 0) ||
    (filter.assigneeUserId && filter.assigneeUserId.length > 0) ||
    (filter.tags && filter.tags.length > 0) ||
    filter.dateRange?.start ||
    filter.dateRange?.end ||
    (filter.searchQuery && filter.searchQuery.trim()) ||
    filter.showBlocked !== undefined ||
    filter.showSubtasks === false;

  const statusOptions: TaskStatus[] = ["todo", "in_progress", "done"];
  const priorityOptions: TaskPriority[] = ["low", "medium", "high"];

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white/60 dark:bg-zinc-900/50 p-5 shadow-sm backdrop-blur-md dark:border-zinc-800">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filter.searchQuery || ""}
            onChange={(e) => updateFilter({ searchQuery: e.target.value || undefined })}
            className="w-full rounded-xl border border-zinc-200 bg-white/60 dark:bg-zinc-900/50 pl-10 pr-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-700 dark:focus:border-zinc-500 dark:focus:ring-zinc-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex-1 sm:flex-none rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-800/50 px-4 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex-1 sm:flex-none rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${isExpanded ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
          >
             Filters {isExpanded ? "▲" : "▼"}
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-1">
          {filter.status && filter.status.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.status.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20"
                >
                  Status: <span className="capitalize">{s.replace("_", " ")}</span>
                  <button
                    onClick={() => toggleStatus(s)}
                    className="hover:text-blue-900 dark:hover:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/20 p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.priority && filter.priority.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.priority.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                >
                  Priority: <span className="capitalize">{p}</span>
                  <button
                    onClick={() => togglePriority(p)}
                    className="hover:text-purple-900 dark:hover:text-purple-300 rounded-full hover:bg-purple-100 dark:hover:bg-purple-500/20 p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.tags && filter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20"
                >
                  Tag: {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-emerald-900 dark:hover:text-emerald-300 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-500/20 p-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.assigneeUserId && filter.assigneeUserId.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filter.assigneeUserId.map((userId) => {
                const member = members.find((m) => m.userId === userId);
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 px-2.5 py-1 text-xs font-medium text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20"
                  >
                    Assignee: {member?.userEmail || userId}
                    <button
                      onClick={() => toggleAssignee(userId)}
                      className="hover:text-orange-900 dark:hover:text-orange-300 rounded-full hover:bg-orange-100 dark:hover:bg-orange-500/20 p-0.5"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {filter.dateRange?.start && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              From: {filter.dateRange.start}
              <button
                onClick={() =>
                  updateFilter({
                    dateRange: { ...filter.dateRange, start: undefined },
                  })
                }
                className="hover:text-indigo-900 dark:hover:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 p-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filter.dateRange?.end && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              To: {filter.dateRange.end}
              <button
                onClick={() =>
                  updateFilter({
                    dateRange: { ...filter.dateRange, end: undefined },
                  })
                }
                className="hover:text-indigo-900 dark:hover:text-indigo-300 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-500/20 p-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filter.showBlocked !== undefined && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20">
              {filter.showBlocked ? "Blocked" : "Not Blocked"}
              <button
                onClick={() => updateFilter({ showBlocked: undefined })}
                className="hover:text-red-900 dark:hover:text-red-300 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 p-0.5"
              >
                ×
              </button>
            </span>
          )}
          {filter.showSubtasks === false && (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
              Hide Subtasks
              <button
                onClick={() => updateFilter({ showSubtasks: undefined })}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 p-0.5"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="grid gap-6 border-t border-zinc-200 dark:border-zinc-800 pt-5 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-2">
          {/* Status Filter */}
          <div>
            <label className="mb-3 block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filter.status?.includes(status) || false}
                    onChange={() => toggleStatus(status)}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                  />
                  <span className="capitalize group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{status.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="mb-3 block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Priority
            </label>
            <div className="space-y-2">
              {priorityOptions.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filter.priority?.includes(priority) || false}
                    onChange={() => togglePriority(priority)}
                    className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                  />
                  <span className="capitalize group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {members.length > 0 && (
            <div>
              <label className="mb-3 block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Assignee
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {uniqueAssignees.map((userId) => {
                  const member = members.find((m) => m.userId === userId);
                  return (
                    <label
                      key={userId}
                      className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={filter.assigneeUserId?.includes(userId) || false}
                        onChange={() => toggleAssignee(userId)}
                        className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                      />
                      <span className="truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                        {member?.userEmail || userId}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags Filter */}
          {uniqueTags.length > 0 && (
            <div>
              <label className="mb-3 block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Tags
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                {uniqueTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filter.tags?.includes(tag) || false}
                      onChange={() => toggleTag(tag)}
                      className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                    />
                    <span className="truncate group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="sm:col-span-2 lg:col-span-4 mt-2">
            <label className="mb-3 block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Date Range
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500 dark:text-zinc-400 font-medium">From</label>
                <input
                  type="date"
                  value={filter.dateRange?.start || ""}
                  onChange={(e) =>
                    updateFilter({
                      dateRange: {
                        ...filter.dateRange,
                        start: e.target.value || undefined,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-zinc-500 dark:text-zinc-400 font-medium">To</label>
                <input
                  type="date"
                  value={filter.dateRange?.end || ""}
                  onChange={(e) =>
                    updateFilter({
                      dateRange: {
                        ...filter.dateRange,
                        end: e.target.value || undefined,
                      },
                    })
                  }
                  className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="sm:col-span-2 lg:col-span-4 mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filter.showBlocked === true}
                  onChange={(e) =>
                    updateFilter({
                      showBlocked: e.target.checked ? true : undefined,
                    })
                  }
                  className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                />
                <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Show only blocked tasks</span>
              </label>
              <label className="flex items-center gap-2.5 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filter.showSubtasks === false}
                  onChange={(e) =>
                    updateFilter({
                      showSubtasks: e.target.checked ? false : undefined,
                    })
                  }
                  className="rounded border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 focus:ring-zinc-500 dark:bg-zinc-800"
                />
                <span className="group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">Hide subtasks</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
