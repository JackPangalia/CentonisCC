"use client";
/* This file renders goal CRUD UI for either personal or team workspace. */
import Link from "next/link";
import { useState } from "react";
import { createGoal, deleteGoal, setGoalStatus, updateGoal } from "@/services/goalService";
import type { Goal, Task, WorkspaceType } from "@/types/models";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";

type GoalManagerProps = {
  workspaceType: WorkspaceType;
  workspaceId: string;
  goals: Goal[];
  tasks: Task[];
  onRefresh: () => Promise<void>;
};

export function GoalManager({
  workspaceType,
  workspaceId,
  goals,
  tasks,
  onRefresh,
}: GoalManagerProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDueDate, setEditDueDate] = useState("");

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createGoal({ workspaceType, workspaceId, title, description, dueDate });
    setTitle("");
    setDescription("");
    setDueDate("");
    await onRefresh();
  }

  async function handleSave(goalId: string) {
    await updateGoal(goalId, {
      title: editTitle,
      description: editDescription,
      dueDate: editDueDate,
    });
    setEditingId(null);
    await onRefresh();
  }

  async function handleDelete(goal: Goal) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await deleteGoal(goal.id, goal.workspaceType, goal.workspaceId);
      toast.success("Goal deleted");
      await onRefresh();
    } catch (error) {
      console.error("Failed to delete goal:", error);
      toast.error(`Failed to delete goal: ${(error as Error).message}`);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <span>🎯</span> Goals
        </h2>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 transition-colors"
            placeholder="New Goal Title..."
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            className="flex-1 rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 transition-colors"
            placeholder="Description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 rounded-xl border border-zinc-200 bg-white/60 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:focus:border-zinc-600 dark:focus:ring-zinc-600 transition-colors"
            type="date"
            required
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
          />
          <button className="sm:w-32 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors">
            Add Goal
          </button>
        </div>
      </form>

      <div className="space-y-3 overflow-y-auto">
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/20 h-full mt-4">
            <div className="text-4xl mb-3 opacity-50">🎯</div>
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">No goals yet</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-[250px]">Create your first goal above to start tracking your progress.</p>
          </div>
        ) : (
          goals.map((goal) => {
          const isEditing = editingId === goal.id;
          const goalTasks = tasks.filter((t) => t.goalId === goal.id);
          const completedTasks = goalTasks.filter((t) => t.status === "done").length;
          const progress = goalTasks.length > 0 ? Math.round((completedTasks / goalTasks.length) * 100) : 0;
          
          return (
            <article key={goal.id} className="group rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/30 p-4 transition-all hover:bg-white/60 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/80">
              {isEditing ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <input
                    className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <input
                    className="w-full sm:w-36 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                  />
                  <button
                    className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    onClick={() => void handleSave(goal.id)}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{goal.title}</p>
                      {goal.status === "Completed" && (
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-100 dark:text-emerald-500 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">Completed</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{goal.description}</p>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1 max-w-[200px] bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
                      </div>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        {progress}% ({completedTasks}/{goalTasks.length})
                      </p>
                    </div>
                    
                    <div className="flex gap-4 mt-3">
                      <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        <span className="text-zinc-400 dark:text-zinc-600 mr-1">Due:</span> 
                        {new Date(goal.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end relative">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="rounded-lg bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors"
                    >
                      Open Tasks
                    </Link>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {goal.status !== "Completed" ? (
                        <button
                          type="button"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-600 hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors"
                          onClick={() => void setGoalStatus(goal.id, "Completed").then(onRefresh)}
                        >
                          Mark Done
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors"
                        onClick={() => {
                          setEditingId(goal.id);
                          setEditTitle(goal.title);
                          setEditDescription(goal.description);
                          setEditDueDate(goal.dueDate);
                        }}
                        title="Edit Goal"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 hover:bg-red-100 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                        onClick={() => void handleDelete(goal)}
                        title="Delete Goal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })
        )}
      </div>
    </div>
  );
}