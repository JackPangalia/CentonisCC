"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { TaskFilterBar } from "@/components/tasks/TaskFilterBar";
import { useAuth } from "@/hooks/useAuth";
import { getGoalById } from "@/services/goalService";
import { listTasksByGoal, filterTasks } from "@/services/taskService";
import { listTeamMemberships } from "@/services/teamService";
import type { Goal, Task, TeamMembership, TaskFilter } from "@/types/models";

export default function GoalTasksPage() {
  const params = useParams<{ goalId: string }>();
  const goalId = params.goalId;
  const { user, isLoading } = useAuth();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<TeamMembership[]>([]);
  const [view, setView] = useState<"board" | "list" | "calendar">("board");
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>({});

  // Apply filters to tasks
  const filteredTasks = filterTasks(tasks, filter);

  const loadData = useCallback(async () => {
    if (!user || !goalId) return;
    try {
      setErrorMessage("");
      // 1. Fetch Goal
      const goalData = await getGoalById(goalId);
      if (!goalData) {
        throw new Error("Goal not found");
      }
      setGoal(goalData);

      // 2. Fetch Tasks
      const tasksData = await listTasksByGoal(goalId, goalData.workspaceType, goalData.workspaceId);
      setTasks(tasksData);

      // 3. Fetch Members (if team)
      if (goalData.workspaceType === "team") {
        const membersData = await listTeamMemberships(goalData.workspaceId);
        setMembers(membersData);
      }
      
      // Check for celebration (100% complete)
      if (tasksData.length > 0 && tasksData.every(t => t.status === "done")) {
         // Only trigger if not already triggered? 
         // For now, just a subtle effect or only on status change would be better.
         // Let's skip auto-trigger on load to avoid annoyance.
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not load goal data.";
      setErrorMessage(message);
    } finally {
      setLoadingData(false);
    }
  }, [goalId, user]);

  useEffect(() => {
    if (!isLoading && user) {
      void loadData();
    }
  }, [isLoading, user, loadData]);

  async function handleRefresh() {
    await loadData();
    
    // Check for celebration after an update
    // const completedTasks = tasks.filter(t => t.status === "done").length;
    // const totalTasks = tasks.length;
    // If we just finished the last task (heuristic: we don't know previous state, but this is okay for "delight")
    // A better way is to pass a "justCompleted" flag, but let's keep it simple.
  }
  
  function triggerConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }

  if (errorMessage) {
    return <div className="p-8 text-center"><p className="rounded bg-red-50 p-4 text-red-600 inline-block">{errorMessage}</p></div>;
  }

  if (isLoading || loadingData || !goal) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-slate-500 animate-pulse">Loading workspace...</div>
      </div>
    );
  }

  const progress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100) 
    : 0;

  // Calculate progress based on filtered tasks if filters are active
  /* const hasActiveFilters = Object.keys(filter).length > 0 && (
    (filter.status && filter.status.length > 0) ||
    (filter.priority && filter.priority.length > 0) ||
    (filter.assigneeUserId && filter.assigneeUserId.length > 0) ||
    (filter.tags && filter.tags.length > 0) ||
    filter.dateRange?.start ||
    filter.dateRange?.end ||
    (filter.searchQuery && filter.searchQuery.trim()) ||
    filter.showBlocked !== undefined ||
    filter.showSubtasks === false
  ); */

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
             <div className="flex items-center gap-3">
               <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                 goal.workspaceType === 'personal' 
                   ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20' 
                   : 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20'
               }`}>
                 {goal.workspaceType === 'personal' ? 'Personal' : 'Team'}
               </span>
               <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{goal.title}</h1>
             </div>
             <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl text-lg leading-relaxed">{goal.description}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-4 pt-2">
            <div className="h-2 w-48 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div 
                className="h-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{progress}% Complete</span>
            {progress === 100 && (
              <button onClick={triggerConfetti} className="text-xl animate-bounce hover:scale-110 transition-transform" title="Celebrate!">
                🎉
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Link
            href={goal.workspaceType === "personal" ? "/dashboard" : `/teams/${goal.workspaceId}`}
            className="rounded-xl border border-zinc-200 bg-white/50 px-4 py-2 text-sm font-medium hover:bg-white hover:border-zinc-300 transition-all text-zinc-700 shadow-sm dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 backdrop-blur-sm"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* View Switcher & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
          <button
            onClick={() => setView("board")}
            className={`${
              view === "board"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            } px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2`}
          >
            <span>📋</span> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`${
              view === "list"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            } px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2`}
          >
            <span>📝</span> List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`${
              view === "calendar"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            } px-4 py-2 text-sm font-medium transition-all rounded-lg flex items-center gap-2`}
          >
            <span>📅</span> Calendar
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <TaskFilterBar
        tasks={tasks}
        members={members}
        filter={filter}
        onFilterChange={setFilter}
      />

      {/* Create Task Form */}
      <CreateTaskForm 
        goalId={goal.id}
        workspaceType={goal.workspaceType}
        workspaceId={goal.workspaceId}
        members={members}
        existingTasks={tasks}
        onTaskCreated={handleRefresh}
      />

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {view === "board" && (
          <TaskBoard
            tasks={filteredTasks}
            members={members}
            onUpdate={handleRefresh}
            goalId={goal.id}
            workspaceType={goal.workspaceType}
            workspaceId={goal.workspaceId}
            userId={user!.uid}
          />
        )}
        {view === "list" && (
          <TaskListView
            tasks={filteredTasks}
            members={members}
            onUpdate={handleRefresh}
          />
        )}
        {view === "calendar" && (
          <TaskCalendarView
            tasks={filteredTasks}
          />
        )}
      </div>
    </div>
  );
}
