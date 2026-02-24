"use client";

import type { Task, TeamMembership } from "@/types/models";
import { updateTask, deleteTask, isTaskBlocked } from "@/services/taskService";
import { useState } from "react";

type TaskListViewProps = {
  tasks: Task[];
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
};

export function TaskListView({ tasks, members, onUpdate }: TaskListViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleStatusChange(task: Task, newStatus: string) {
    await updateTask(task.id, { status: newStatus as any });
    await onUpdate();
  }

  async function handleDelete(taskId: string) {
    if (confirm("Delete this task?")) {
      await deleteTask(taskId);
      await onUpdate();
    }
  }

  // Helper to get blocking task names
  function getBlockingTaskNames(task: Task): string[] {
    if (!task.blockedByTaskIds || task.blockedByTaskIds.length === 0) {
      return [];
    }
    return task.blockedByTaskIds
      .map((id) => {
        const blockingTask = tasks.find((t) => t.id === id);
        return blockingTask?.title || id;
      })
      .filter(Boolean);
  }

  // Helper to check if task is a subtask
  function isSubtask(task: Task): boolean {
    return !!(task.parentTaskId && task.parentTaskId !== null);
  }

  // Helper to get parent task
  function getParentTask(task: Task): Task | undefined {
    if (!task.parentTaskId) return undefined;
    return tasks.find((t) => t.id === task.parentTaskId);
  }

  // Sort tasks: parent tasks first, then subtasks indented
  const sortedTasks = [...tasks].sort((a, b) => {
    const aIsSubtask = isSubtask(a);
    const bIsSubtask = isSubtask(b);
    
    if (aIsSubtask && !bIsSubtask) return 1;
    if (!aIsSubtask && bIsSubtask) return -1;
    
    if (aIsSubtask && bIsSubtask) {
      // Both are subtasks, group by parent
      if (a.parentTaskId !== b.parentTaskId) {
        return (a.parentTaskId || "").localeCompare(b.parentTaskId || "");
      }
    }
    
    return a.title.localeCompare(b.title);
  });

  const statusColors = {
    todo: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    done: "bg-emerald-100 text-emerald-700",
  };

  const priorityColors = {
    low: "text-slate-500",
    medium: "text-blue-600",
    high: "text-red-600 font-medium",
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Title</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Tags</th>
            <th className="px-4 py-3 font-medium">Dependencies</th>
            <th className="px-4 py-3 font-medium">Due Date</th>
            <th className="px-4 py-3 font-medium">Assignee</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sortedTasks.map((task) => {
            const assignee = members.find((m) => m.userId === task.assigneeUserId);
            const taskIsSubtask = isSubtask(task);
            const blockingTaskNames = getBlockingTaskNames(task);
            const isBlocked = isTaskBlocked(task, tasks);
            
            return (
              <tr 
                key={task.id} 
                className={`hover:bg-slate-50/50 transition-colors group ${
                  taskIsSubtask ? "bg-slate-50/30" : ""
                } ${isBlocked ? "opacity-60" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    {taskIsSubtask && (
                      <span className="text-slate-400" title="Subtask">└</span>
                    )}
                    <span>{task.title}</span>
                    {taskIsSubtask && (
                      <span className="text-xs text-slate-400">
                        (of {getParentTask(task)?.title || "Unknown"})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className={`rounded px-2 py-1 text-xs font-medium border-0 cursor-pointer outline-none ${statusColors[task.status]}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs uppercase tracking-wide ${priorityColors[task.priority || "medium"]}`}>
                    {task.priority || "medium"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {task.tags && task.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {blockingTaskNames.length > 0 ? (
                    <div className="space-y-1">
                      {blockingTaskNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 inline-block"
                          title="Blocked by"
                        >
                          ⚠️ {name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {task.dueDate ? new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {assignee ? (assignee.userEmail || "Member") : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity px-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-400 italic">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
