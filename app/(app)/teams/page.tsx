"use client";
/* This file renders a list of all teams the user belongs to, with ability to create new teams. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createTeam, getTeamsForUser, deleteTeam } from "@/services/teamService";
import type { Team } from "@/types/models";
import { Trash2 } from "lucide-react";

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
      console.error(error);
      setMessage("Failed to delete team.");
    }
  }

  if (isLoading || !user) {
    return <p className="text-sm text-zinc-400">Loading teams...</p>;
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Teams
        </h1>
      </div>

      {/* Create Team Section */}
      <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 p-5 shadow-sm backdrop-blur-md space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Create New Team
        </h2>
        <form onSubmit={handleCreateTeam} className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/50 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600"
            value={newTeamName}
            onChange={(event) => setNewTeamName(event.target.value)}
            required
            placeholder="Enter team name"
            disabled={isCreating}
          />
          <button
            type="submit"
            disabled={isCreating}
            className="sm:w-32 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Creating..." : "Create Team"}
          </button>
        </form>
        {message ? (
          <p
            className={`mt-2 text-sm font-medium ${
              message.includes("successfully")
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {message}
          </p>
        ) : null}
      </section>

      {/* Teams List */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Your Teams ({teams.length})
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You don&apos;t belong to any teams yet. Create one above to get started!
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 p-5 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-md"
              >
                {user.uid === team.ownerUserId && (
                  <button
                    onClick={(e) => handleDeleteTeam(e, team.id)}
                    className="absolute right-3 top-3 z-10 rounded p-1.5 text-zinc-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center justify-center"
                    title="Delete Team"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <Link
                  href={`/teams/${team.id}`}
                  className="block h-full w-full pt-4"
                >
                  <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
                    {team.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Created {new Date(team.createdAt).toLocaleDateString()}
                  </p>
                  <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 group-hover:underline">
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
