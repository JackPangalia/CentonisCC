"use client";
/* This file renders the personal workspace dashboard page. */
import { GoalManager } from "@/components/goals/GoalManager";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { ProgressChart } from "@/components/dashboard/ProgressChart";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { BentoGrid } from "@/components/ui/BentoGrid";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function PersonalDashboardPage() {
  const { user, isLoading } = useAuth();
  const workspace = useWorkspace("personal", user?.uid);
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  // Calculate progress data for the last 7 days
  const progressData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const isoDate = d.toISOString().split('T')[0];
    
    // Count tasks completed on this specific day
    const completedTasks = workspace.tasks.filter(t => 
      t.status === 'done' && t.updatedAt.startsWith(isoDate)
    ).length;

    return { date: dateStr, completedTasks };
  });

  if (isLoading || !user || workspace.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <BentoGrid className="md:auto-rows-auto gap-6">
          <div className="md:col-span-3">
            <Skeleton className="h-32 w-full" />
          </div>
          <SpotlightCard className="md:col-span-2 min-h-[500px]">
            <Skeleton className="h-full w-full bg-transparent" />
          </SpotlightCard>
          <SpotlightCard className="md:col-span-1 min-h-[500px]">
            <Skeleton className="h-full w-full bg-transparent" />
          </SpotlightCard>
        </BentoGrid>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          {greeting}, {user.email?.split("@")[0] || "there"}
        </h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Here&apos;s a quick overview of your personal workspace today.
        </p>
      </div>
      
      <BentoGrid className="md:auto-rows-auto gap-6">
        <div className="md:col-span-4">
          <SummaryCards summary={workspace.summary} />
        </div>
        
        <div className="md:col-span-4">
          <ProgressChart data={progressData} />
        </div>

        <SpotlightCard className="md:col-span-2 p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="h-full overflow-hidden p-1">
            <TodaysFocus tasks={workspace.tasks} onRefresh={workspace.refresh} />
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-2 p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="h-full overflow-hidden p-1">
            <GoalManager
              workspaceType="personal"
              workspaceId={user.uid}
              goals={workspace.goals}
              tasks={workspace.tasks}
              onRefresh={workspace.refresh}
            />
          </div>
        </SpotlightCard>
      </BentoGrid>
    </div>
  );
}