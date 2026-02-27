"use client";
/* This file lets owners manage team members (add, edit roles, remove). */
import { useState, useEffect, useCallback } from "react";
import { Users } from "lucide-react";
import { 
  addTeamMemberByEmail, 
  listTeamMemberships, 
  updateMemberRole, 
  removeTeamMember 
} from "@/services/teamService";
import type { Team, TeamMembership, TeamRole } from "@/types/models";

type TeamManagerProps = {
  userId: string;
  selectedTeam: Team;
  currentRole: TeamRole;
};

export function TeamManager({
  userId,
  selectedTeam,
  currentRole,
}: TeamManagerProps) {
  const [memberEmail, setMemberEmail] = useState("");
  const [memberRole, setMemberRole] = useState<TeamRole>("member");
  const [message, setMessage] = useState("");

  const [members, setMembers] = useState<TeamMembership[]>([]);

  const loadMembers = useCallback(async () => {
    try {
      const data = await listTeamMemberships(selectedTeam.id);
      setMembers(data);
    } catch (e) {
      console.error(e);
    }
  }, [selectedTeam]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  async function handleAddMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    await addTeamMemberByEmail(selectedTeam.id, memberRole, memberEmail);
    setMemberEmail("");
    setMessage("Member added.");
    await loadMembers();
  }

  async function handleRoleChange(membership: TeamMembership, newRole: TeamRole) {
    if (membership.userId === userId) {
      setMessage("Cannot change your own role here.");
      return;
    }
    try {
      await updateMemberRole(membership.id, newRole);
      setMessage("Role updated.");
      await loadMembers();
    } catch (e) {
      console.error(e);
      setMessage("Failed to update role.");
    }
  }

  async function handleRemoveMember(membershipId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      await removeTeamMember(membershipId);
      setMessage("Member removed.");
      await loadMembers();
    } catch (e) {
      console.error(e);
      setMessage("Failed to remove member.");
    }
  }

  if (currentRole !== "owner") {
    return null;
  }

  return (
    <section className="space-y-4 h-full flex flex-col">
      <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
        <Users className="h-5 w-5" /> Team Management
      </h2>

      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          <div className="space-y-3">
            {members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
                <Users className="h-8 w-8 text-zinc-300 dark:text-zinc-600 mb-2" />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">No members yet</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Team Members</p>
                <ul className="space-y-3">
                  {members.map((m) => (
                    <li key={m.id} className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/30 p-5 transition-all hover:bg-white/80 dark:hover:bg-zinc-800/30 hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {m.userEmail || `User: ${m.userId.substring(0, 8)}...`}
                          </span>
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold mt-0.5 block">{m.role}</span>
                        </div>
                        {m.userId === userId && (
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2.5 py-1 rounded-full font-medium border border-zinc-200 dark:border-zinc-700">You</span>
                        )}
                      </div>
                      
                      {m.userId !== userId && (
                        <div className="flex items-center gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800/50 mt-1">
                          <select 
                            value={m.role}
                            onChange={(e) => void handleRoleChange(m, e.target.value as TeamRole)}
                            className="flex-1 text-xs border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 bg-white/50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 outline-none focus:border-zinc-400 focus:ring-1 focus:ring-zinc-200 dark:focus:ring-zinc-700 transition-all cursor-pointer hover:bg-white dark:hover:bg-zinc-800"
                          >
                            <option value="member">Member</option>
                            <option value="owner">Owner</option>
                          </select>
                          <button 
                            type="button"
                            onClick={() => void handleRemoveMember(m.id)}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-100 dark:hover:border-red-500/20 transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <form onSubmit={handleAddMember} className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Add Member</p>
            <div className="space-y-2">
              <input
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 p-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                required
                placeholder="member@example.com"
              />
              <div className="flex gap-2">
                <select
                  className="w-1/3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/50 p-2.5 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  value={memberRole}
                  onChange={(event) => setMemberRole(event.target.value as TeamRole)}
                >
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                </select>
                <button className="flex-1 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white transition-colors shadow-sm">
                  Add
                </button>
              </div>
            </div>
          </form>
      </div>
      
      {message ? <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-500/10 p-2 rounded-lg border border-emerald-200 dark:border-emerald-500/20">{message}</p> : null}
    </section>
  );
}
