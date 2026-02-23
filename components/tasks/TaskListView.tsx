"use client";

import type { Task, TeamMembership } from "@/types/models";
import { updateTask, deleteTask } from "@/services/taskService";
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
            <th className="px-4 py-3 font-medium">Due Date</th>
            <th className="px-4 py-3 font-medium">Assignee</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tasks.map((task) => {
            const assignee = members.find((m) => m.userId === task.assigneeUserId);
            return (
              <tr key={task.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-3 font-medium text-slate-800">
                  {task.title}
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
          {tasks.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
