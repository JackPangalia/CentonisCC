"use client";
/* This file renders a selected team's dashboard with goals and summaries. */
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalManager } from "@/components/goals/GoalManager";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { TeamManager } from "@/components/teams/TeamManager";
import { useAuth } from "@/hooks/useAuth";
import { BentoGrid } from "@/components/ui/BentoGrid";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  getMembershipForUserInTeam,
  getTeamById,
} from "@/services/teamService";
import type { Team, TeamRole } from "@/types/models";

export default function TeamDashboardPage() {
  const params = useParams<{ teamId: string }>();
  const teamId = params.teamId;
  const { user, isLoading } = useAuth();
  const workspace = useWorkspace("team", teamId);
  const [team, setTeam] = useState<Team | null>(null);
  const [role, setRole] = useState<TeamRole | null>(null);

  useEffect(() => {
    async function loadTeamData() {
      if (!user) {
        return;
      }
      const [teamDoc, membership] = await Promise.all([
        getTeamById(teamId),
        getMembershipForUserInTeam(teamId, user.uid),
      ]);
      setTeam(teamDoc);
      setRole(membership?.role ?? null);
    }
    void loadTeamData();
  }, [teamId, user]);

  if (isLoading || !user || workspace.isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
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

  if (!team || !role) {
    return <p className="text-sm text-red-500">You do not have access to this team.</p>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Team Dashboard: <span className="text-zinc-500 dark:text-zinc-400 font-medium">{team.name}</span>
        </h1>
      </div>
      
      <BentoGrid className="md:auto-rows-auto gap-6">
        <div className="md:col-span-4">
          <SummaryCards summary={workspace.summary} />
        </div>
        
        <SpotlightCard className="md:col-span-3 p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="h-full overflow-hidden p-1">
            <GoalManager
              workspaceType="team"
              workspaceId={teamId}
              goals={workspace.goals}
              tasks={workspace.tasks}
              onRefresh={workspace.refresh}
            />
          </div>
        </SpotlightCard>

        <SpotlightCard className="md:col-span-1 p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="h-full overflow-hidden p-4">
            <TeamManager
              userId={user.uid}
              selectedTeam={team}
              currentRole={role}
            />
          </div>
        </SpotlightCard>
      </BentoGrid>
    </div>
  );
}
