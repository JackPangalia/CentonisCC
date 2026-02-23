"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { TaskBoard } from "@/components/tasks/TaskBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { CreateTaskForm } from "@/components/tasks/CreateTaskForm";
import { useAuth } from "@/hooks/useAuth";
import { getGoalById } from "@/services/goalService";
import { listTasksByGoal } from "@/services/taskService";
import { listTeamMemberships } from "@/services/teamService";
import type { Goal, Task, TeamMembership } from "@/types/models";

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

  const loadData = useCallback(async () => {
    if (!user || !goalId) return;
    try {
      setErrorMessage("");
      // 1. Fetch Goal
      const goalData = await getGoalById(goalId);
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
    const completedTasks = tasks.filter(t => t.status === "done").length;
    const totalTasks = tasks.length;
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-3xl font-bold tracking-tight text-slate-900">{goal.title}</h1>
             <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
               goal.workspaceType === 'personal' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200'
             }`}>
               {goal.workspaceType === 'personal' ? 'Personal' : 'Team'}
             </span>
          </div>
          <p className="text-slate-600 max-w-2xl text-lg">{goal.description}</p>
          
          {/* Progress Bar */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-2.5 w-48 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-700">{progress}% Complete</span>
            {progress === 100 && (
              <button onClick={triggerConfetti} className="text-xl animate-bounce" title="Celebrate!">
                🎉
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
           <Link
            href={goal.workspaceType === "personal" ? "/dashboard" : `/teams/${goal.workspaceId}`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 transition-colors bg-white text-slate-700 shadow-sm"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* View Switcher & Controls */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setView("board")}
            className={`${
              view === "board"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2`}
          >
            <span>📋</span> Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`${
              view === "list"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2`}
          >
            <span>📝</span> List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`${
              view === "calendar"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
            } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors flex items-center gap-2`}
          >
            <span>📅</span> Calendar
          </button>
        </nav>
      </div>

      {/* Create Task Form */}
      <CreateTaskForm 
        goalId={goal.id}
        workspaceType={goal.workspaceType}
        workspaceId={goal.workspaceId}
        members={members}
        onTaskCreated={handleRefresh}
      />

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {view === "board" && (
          <TaskBoard
            tasks={tasks}
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
            tasks={tasks}
            members={members}
            onUpdate={handleRefresh}
          />
        )}
        {view === "calendar" && (
          <TaskCalendarView
            tasks={tasks}
          />
        )}
      </div>
    </div>
  );
}
