"use client";
/* This file renders a list of all teams the user belongs to, with ability to create new teams. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createTeam, getTeamsForUser, deleteTeam } from "@/services/teamService";
import type { Team } from "@/types/models";

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

export default function TeamsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState("");
  const [message, setMessage] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    async function loadTeams() {
      if (!user) {
        return;
      }
      const nextTeams = await getTeamsForUser(user.uid);
      setTeams(nextTeams);
    }
    void loadTeams();
  }, [user]);

  async function handleCreateTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      return;
    }
    setIsCreating(true);
    setMessage("");
    try {
      await createTeam(newTeamName, user.uid);
      setNewTeamName("");
      setMessage("Team created successfully!");
      // Reload teams list
      const nextTeams = await getTeamsForUser(user.uid);
      setTeams(nextTeams);
      // Optionally redirect to the new team
      if (nextTeams.length > 0) {
        const newTeam = nextTeams[nextTeams.length - 1];
        setTimeout(() => {
          router.push(`/teams/${newTeam.id}`);
        }, 1000);
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create team.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteTeam(e: React.MouseEvent, teamId: string) {
    e.preventDefault();
    e.stopPropagation(); // Stop link navigation if button is somehow inside link (it won't be, but safe)
    if (!confirm("Are you sure you want to delete this team? This cannot be undone.")) {
      return;
    }
    
    try {
      await deleteTeam(teamId);
      setMessage("Team deleted successfully.");
      const nextTeams = await getTeamsForUser(user!.uid);
      setTeams(nextTeams);
    } catch (error) {
      setMessage("Failed to delete team.");
    }
  }

  if (isLoading || !user) {
    return <p className="text-sm text-slate-600">Loading teams...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
      </div>

      {/* Create Team Section */}
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Create New Team</h2>
        <form onSubmit={handleCreateTeam} className="space-y-3">
          <input
            className="w-full rounded border border-slate-300 p-2"
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            required
            placeholder="Enter team name"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create Team"}
          </button>
        </form>
        {message ? (
          <p
            className={`mt-3 text-sm font-medium ${
              message.includes("successfully")
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>

      {/* Teams List */}
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">
          Your Teams ({teams.length})
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-slate-500">
            You don't belong to any teams yet. Create one above to get started!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group relative rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-blue-500 hover:shadow-md"
              >
                {user.uid === team.ownerUserId && (
                  <button
                    onClick={(e) => handleDeleteTeam(e, team.id)}
                    className="absolute right-2 top-2 z-10 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete Team"
                  >
                    <TrashIcon />
                  </button>
                )}

                <Link
                  href={`/teams/${team.id}`}
                  className="block h-full w-full pt-4"
                >
                  <h3 className="mb-2 font-semibold text-slate-900 group-hover:text-blue-700">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-2 text-sm text-blue-600 group-hover:underline">
                    Open workspace →
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
