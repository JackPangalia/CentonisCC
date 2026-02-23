"use client";
/* This component shows today's high priority tasks and progress. */
import type { Task } from "@/types/models";
import { useMemo } from "react";
import Link from "next/link";
import { deleteTask } from "@/services/taskService";

type TodaysFocusProps = {
  tasks: Task[];
  onRefresh: () => Promise<void>;
};

export function TodaysFocus({ tasks, onRefresh }: TodaysFocusProps) {
  // Use local date for "today" comparison
  const today = new Date().toLocaleDateString('en-CA');

  const todaysTasks = useMemo(() => {
    return tasks.filter((task) => {
      const isDueToday = task.dueDate === today;
      const isOverdue = task.dueDate < today && task.status !== "done";
      const isHighPriority = task.priority === "high" && task.status !== "done";
      return (isDueToday || isOverdue || isHighPriority) && task.status !== "done";
    });
  }, [tasks, today]);

  const totalDueToday = useMemo(() => {
    // Count all tasks that are part of today's focus (due today, overdue, or high priority)
    return tasks.filter((task) => {
      const isDueToday = task.dueDate === today;
      const isOverdue = task.dueDate < today && task.status !== "done";
      const isHighPriority = task.priority === "high" && task.status !== "done";
      return isDueToday || isOverdue || isHighPriority || (task.status === "done" && task.dueDate === today);
    }).length;
  }, [tasks, today]);

  const completedToday = useMemo(() => {
    // Count completed tasks that were due today or part of the focus group
    return tasks.filter((task) => {
      const isDone = task.status === "done";
      if (!isDone) return false;
      
      const isDueToday = task.dueDate === today;
      const wasOverdue = task.dueDate < today; // simplified assumption
      const wasHighPriority = task.priority === "high";
      
      return isDueToday || wasOverdue || wasHighPriority;
    }).length;
  }, [tasks, today]);

  const progress = totalDueToday > 0 ? Math.round((completedToday / totalDueToday) * 100) : 0;

  async function handleDelete(taskId: string) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    await deleteTask(taskId);
    await onRefresh();
  }

  return (
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm border border-blue-100">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800">🎯 Today's Focus</h2>
        <div className="text-sm text-slate-500">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg">
        <div className="flex-1">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Daily Progress</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{progress}%</p>
          <p className="text-xs text-slate-500">{completedToday} of {totalDueToday} completed</p>
        </div>
      </div>

      <div className="space-y-2">
        {todaysTasks.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-2">No high priority tasks for today. Good job!</p>
        ) : (
          todaysTasks.map((task) => (
            <div key={task.id} className={`flex items-center justify-between p-3 rounded border ${task.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-blue-500' : 'bg-slate-400'}`}></span>
                  <p className="font-medium text-slate-800">{task.title}</p>
                </div>
                <div className="flex gap-2 text-xs text-slate-500 mt-1 ml-4">
                   {task.dueDate < today ? (
                     <span className="text-red-600 font-bold">Overdue ({new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
                   ) : (
                     <span>Due: {new Date(task.dueDate + 'T12:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                   )}
                   {task.estimatedMinutes ? <span>⏱ {task.estimatedMinutes}m est.</span> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/goals/${task.goalId}`} className="text-xs px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50">
                  View
                </Link>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-xs px-2 py-1 bg-white border border-red-200 text-red-600 rounded hover:bg-red-50"
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
