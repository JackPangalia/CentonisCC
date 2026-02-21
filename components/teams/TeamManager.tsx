"use client";
/* This file lets owners manage team members (add, edit roles, remove). */
import { useEffect, useState, useCallback } from "react";
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
    <section className="space-y-4 rounded-lg bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold">Team Management</h2>

      <form onSubmit={handleAddMember} className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium">Add Member by Email</p>
            <input
              className="w-full rounded border border-slate-300 p-2"
              type="email"
              value={memberEmail}
              onChange={(event) => setMemberEmail(event.target.value)}
              required
              placeholder="member@example.com"
            />
            <select
              className="w-full rounded border border-slate-300 p-2"
              value={memberRole}
              onChange={(event) => setMemberRole(event.target.value as TeamRole)}
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
            <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white">
              Add Member
            </button>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Team Members</p>
            <ul className="space-y-2">
              {members.map((m) => (
                <li key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 gap-2">
                  <div>
                    <span className="block text-sm font-medium text-slate-800">
                      {m.userEmail || `User: ${m.userId.substring(0, 8)}...`}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{m.role}</span>
                  </div>
                  {m.userId !== userId ? (
                    <div className="flex items-center gap-2">
                      <select 
                        value={m.role}
                        onChange={(e) => void handleRoleChange(m, e.target.value as TeamRole)}
                        className="text-xs border border-slate-300 rounded p-1 bg-white"
                      >
                        <option value="member">Member</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button 
                        type="button"
                        onClick={() => void handleRemoveMember(m.id)}
                        className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">You</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

      {message ? <p className="text-sm text-emerald-700 font-medium">{message}</p> : null}
    </section>
  );
}
