"use client";

import { updateTask, deleteTask, isTaskBlocked } from "@/services/taskService";
import { Trash2 } from "lucide-react";

type TaskListViewProps = {
  tasks: Task[];
  members: TeamMembership[];
  onUpdate: () => Promise<void>;
};

export function TaskListView({ tasks, members, onUpdate }: TaskListViewProps) {
  async function handleStatusChange(task: Task, newStatus: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    todo: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    in_progress: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    done: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  };

  const priorityColors = {
    low: "text-zinc-500 dark:text-zinc-400",
    medium: "text-blue-600 dark:text-blue-400",
    high: "text-red-600 dark:text-red-400 font-medium",
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white/60 dark:bg-zinc-900/50 shadow-sm backdrop-blur-md dark:border-zinc-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50/50 text-zinc-500 dark:bg-zinc-800/50 dark:text-zinc-400">
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
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
          {sortedTasks.map((task) => {
            const assignee = members.find((m) => m.userId === task.assigneeUserId);
            const taskIsSubtask = isSubtask(task);
            const blockingTaskNames = getBlockingTaskNames(task);
            const isBlocked = isTaskBlocked(task, tasks);
            
            return (
              <tr 
                key={task.id} 
                className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group ${
                  taskIsSubtask ? "bg-zinc-50/30 dark:bg-zinc-800/10" : ""
                } ${isBlocked ? "opacity-60" : ""}`}
              >
                <td className="px-4 py-3 font-medium text-zinc-800 dark:text-zinc-200">
                  <div className="flex items-center gap-2">
                    {taskIsSubtask && (
                      <span className="text-zinc-400 dark:text-zinc-600" title="Subtask">└</span>
                    )}
                    <span>{task.title}</span>
                    {taskIsSubtask && (
                      <span className="text-xs text-zinc-400 dark:text-zinc-600">
                        (of {getParentTask(task)?.title || "Unknown"})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task, e.target.value)}
                    className={`rounded-lg px-2 py-1 text-xs font-medium border-0 cursor-pointer outline-none transition-colors ${statusColors[task.status]}`}
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
                          className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/50"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {blockingTaskNames.length > 0 ? (
                    <div className="space-y-1">
                      {blockingTaskNames.map((name, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded px-1.5 py-0.5 inline-block"
                          title="Blocked by"
                        >
                          ⚠️ {name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-zinc-400 dark:text-zinc-600">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {task.dueDate ? new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "-"}
                </td>
                <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                  {assignee ? (assignee.userEmail || "Member") : "-"}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center ml-auto"
                    title="Delete task"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            );
          })}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-zinc-400 dark:text-zinc-500 italic">
                No tasks found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
