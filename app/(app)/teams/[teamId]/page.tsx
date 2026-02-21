"use client";
/* This file renders a selected team's dashboard with goals and summaries. */
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GoalManager } from "@/components/goals/GoalManager";
import { SummaryCards } from "@/components/shared/SummaryCards";
import { TeamManager } from "@/components/teams/TeamManager";
import { useAuth } from "@/hooks/useAuth";
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
    return <p className="text-sm text-slate-600">Loading team dashboard...</p>;
  }

  if (!team || !role) {
    return <p className="text-sm text-red-600">You do not have access to this team.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Team Dashboard: {team.name}</h1>
      <SummaryCards summary={workspace.summary} />
      <GoalManager
        workspaceType="team"
        workspaceId={teamId}
        goals={workspace.goals}
        onRefresh={workspace.refresh}
      />
      <TeamManager
        userId={user.uid}
        selectedTeam={team}
        currentRole={role}
      />
    </div>
  );
}
