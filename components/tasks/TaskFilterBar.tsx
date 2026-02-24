"use client";

import { useState, useMemo } from "react";
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
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search tasks..."
          value={filter.searchQuery || ""}
          onChange={(e) => updateFilter({ searchQuery: e.target.value || undefined })}
          className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
        />
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          {isExpanded ? "▼" : "▶"} Filters
        </button>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filter.status && filter.status.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filter.status.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 border border-blue-200"
                >
                  Status: {s}
                  <button
                    onClick={() => toggleStatus(s)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.priority && filter.priority.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filter.priority.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 border border-purple-200"
                >
                  Priority: {p}
                  <button
                    onClick={() => togglePriority(p)}
                    className="hover:text-purple-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.tags && filter.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filter.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200"
                >
                  Tag: {tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-emerald-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {filter.assigneeUserId && filter.assigneeUserId.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {filter.assigneeUserId.map((userId) => {
                const member = members.find((m) => m.userId === userId);
                return (
                  <span
                    key={userId}
                    className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 border border-orange-200"
                  >
                    Assignee: {member?.userEmail || userId}
                    <button
                      onClick={() => toggleAssignee(userId)}
                      className="hover:text-orange-900"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
          {filter.dateRange?.start && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
              From: {filter.dateRange.start}
              <button
                onClick={() =>
                  updateFilter({
                    dateRange: { ...filter.dateRange, start: undefined },
                  })
                }
                className="hover:text-indigo-900"
              >
                ×
              </button>
            </span>
          )}
          {filter.dateRange?.end && (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
              To: {filter.dateRange.end}
              <button
                onClick={() =>
                  updateFilter({
                    dateRange: { ...filter.dateRange, end: undefined },
                  })
                }
                className="hover:text-indigo-900"
              >
                ×
              </button>
            </span>
          )}
          {filter.showBlocked !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 border border-red-200">
              {filter.showBlocked ? "Blocked" : "Not Blocked"}
              <button
                onClick={() => updateFilter({ showBlocked: undefined })}
                className="hover:text-red-900"
              >
                ×
              </button>
            </span>
          )}
          {filter.showSubtasks === false && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 border border-slate-200">
              Hide Subtasks
              <button
                onClick={() => updateFilter({ showSubtasks: undefined })}
                className="hover:text-slate-900"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Status Filter */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase">
              Status
            </label>
            <div className="space-y-1">
              {statusOptions.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={filter.status?.includes(status) || false}
                    onChange={() => toggleStatus(status)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{status.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase">
              Priority
            </label>
            <div className="space-y-1">
              {priorityOptions.map((priority) => (
                <label
                  key={priority}
                  className="flex items-center gap-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={filter.priority?.includes(priority) || false}
                    onChange={() => togglePriority(priority)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="capitalize">{priority}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Assignee Filter */}
          {members.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase">
                Assignee
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {uniqueAssignees.map((userId) => {
                  const member = members.find((m) => m.userId === userId);
                  return (
                    <label
                      key={userId}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={filter.assigneeUserId?.includes(userId) || false}
                        onChange={() => toggleAssignee(userId)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="truncate">
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
              <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase">
                Tags
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {uniqueTags.map((tag) => (
                  <label
                    key={tag}
                    className="flex items-center gap-2 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={filter.tags?.includes(tag) || false}
                      onChange={() => toggleTag(tag)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate">{tag}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Date Range Filter */}
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="mb-2 block text-xs font-semibold text-slate-600 uppercase">
              Date Range
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-500">From</label>
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
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">To</label>
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
                  className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="sm:col-span-2 lg:col-span-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filter.showBlocked === true}
                  onChange={(e) =>
                    updateFilter({
                      showBlocked: e.target.checked ? true : undefined,
                    })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Show only blocked tasks</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={filter.showSubtasks === false}
                  onChange={(e) =>
                    updateFilter({
                      showSubtasks: e.target.checked ? false : undefined,
                    })
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Hide subtasks</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
