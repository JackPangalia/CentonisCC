"use client";
/* This file renders goal CRUD UI for either personal or team workspace. */
import Link from "next/link";
import { useState } from "react";
import { createGoal, deleteGoal, setGoalStatus, updateGoal } from "@/services/goalService";
import type { Goal, Task, WorkspaceType } from "@/types/models";

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

  async function handleDelete(goalId: string) {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    await deleteGoal(goalId);
    await onRefresh();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Goals</h2>
      <form onSubmit={handleCreate} className="grid gap-2 md:grid-cols-4">
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Title"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          placeholder="Description"
          required
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <input
          className="rounded border border-slate-300 p-2"
          type="date"
          required
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
        />
        <button className="rounded bg-slate-900 px-3 py-2 text-sm text-white">
          Add Goal
        </button>
      </form>

      <div className="space-y-3">
        {goals.map((goal) => {
          const isEditing = editingId === goal.id;
          const goalTasks = tasks.filter((t) => t.goalId === goal.id);
          const completedTasks = goalTasks.filter((t) => t.status === "done").length;
          const progress = goalTasks.length > 0 ? Math.round((completedTasks / goalTasks.length) * 100) : 0;
          
          return (
            <article key={goal.id} className="rounded border border-slate-200 p-3">
              {isEditing ? (
                <div className="grid gap-2 md:grid-cols-4">
                  <input
                    className="rounded border border-slate-300 p-2"
                    value={editTitle}
                    onChange={(event) => setEditTitle(event.target.value)}
                  />
                  <input
                    className="rounded border border-slate-300 p-2"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                  />
                  <input
                    className="rounded border border-slate-300 p-2"
                    type="date"
                    value={editDueDate}
                    onChange={(event) => setEditDueDate(event.target.value)}
                  />
                  <button
                    className="rounded bg-blue-600 px-3 py-2 text-sm text-white"
                    onClick={() => void handleSave(goal.id)}
                    type="button"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-medium">{goal.title}</p>
                    <p className="text-sm text-slate-600">{goal.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2 mb-1">
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-500 mb-1">{progress}% Complete ({completedTasks}/{goalTasks.length} tasks)</p>
                    <p className="text-xs text-slate-500">Due: {new Date(goal.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    <p className="text-xs text-slate-500">Status: {goal.status}</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Link
                      href={`/goals/${goal.id}`}
                      className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                    >
                      Open Tasks
                    </Link>
                    <div className="flex gap-2">
                      {goal.status !== "Completed" ? (
                        <button
                          type="button"
                          className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                          onClick={() => void setGoalStatus(goal.id, "Completed").then(onRefresh)}
                        >
                          Mark Done
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                        onClick={() => {
                          setEditingId(goal.id);
                          setEditTitle(goal.title);
                          setEditDescription(goal.description);
                          setEditDueDate(goal.dueDate);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                        onClick={() => void handleDelete(goal.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
