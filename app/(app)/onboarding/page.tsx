"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";
import {
  createWorkspace,
  joinWorkspaceByInviteCode,
} from "@/services/workspaceService";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const { user } = useAuth();
  const { refresh } = useWorkspaceContext();
  const router = useRouter();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setIsSubmitting(true);
    try {
      await createWorkspace(name.trim(), user.uid, user.email || "");
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      const message = (error as Error)?.message || "Unknown error";
      const isPermissionIssue =
        message.toLowerCase().includes("insufficient permissions") ||
        message.toLowerCase().includes("permission-denied");
      toast.error(
        isPermissionIssue
          ? "Failed to create workspace: Firestore rules are not deployed yet."
          : `Failed to create workspace: ${message}`
      );
      setIsSubmitting(false);
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !inviteCode.trim()) return;
    setIsSubmitting(true);
    try {
      await joinWorkspaceByInviteCode(
        inviteCode.trim().toUpperCase(),
        user.uid,
        user.email || ""
      );
      await refresh();
      router.replace("/dashboard");
    } catch (error) {
      const message = (error as Error)?.message || "Unknown error";
      const isPermissionIssue =
        message.toLowerCase().includes("insufficient permissions") ||
        message.toLowerCase().includes("permission-denied");
      toast.error(
        isPermissionIssue
          ? "Failed to join workspace: Firestore rules are not deployed yet."
          : `Failed to join workspace: ${message}`
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Left — brand panel with desert image */}
      <div className="relative flex h-48 shrink-0 flex-col justify-between overflow-hidden bg-zinc-900 px-6 py-6 text-white md:h-auto md:w-1/2 md:px-12 md:py-14">
        <img
          src="/desert.jpg"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

        <div className="relative z-10">
          <span className="text-lg font-bold tracking-tight">CentonisCC</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="text-2xl font-bold leading-tight tracking-tight md:text-5xl">
            Your workspace awaits.
          </h1>
          <p className="mt-2 hidden text-base leading-relaxed text-white/70 md:block">
            One place for your goals, projects, and notes. Set it up in under a minute.
          </p>
        </div>

        <div className="relative z-10 hidden md:block">
          <p className="text-xs text-white/40">
            Made for builders.
          </p>
        </div>
      </div>

      {/* Right — action panel */}
      <div className="flex flex-1 items-center justify-center bg-white px-5 py-8 dark:bg-[#191919] md:px-16 md:py-12">
        <div className="w-full max-w-md space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              Get started
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {mode === "choose" && "Set up your workspace"}
              {mode === "create" && "Create workspace"}
              {mode === "join" && "Join workspace"}
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {mode === "choose" && "Create a new workspace or join an existing one."}
              {mode === "create" && "Pick a name for your workspace. You can change it later."}
              {mode === "join" && "Paste the invite code your teammate shared with you."}
            </p>
          </div>

          {mode === "choose" && (
            <div className="space-y-3">
              <button
                onClick={() => setMode("create")}
                className="flex w-full items-center gap-4 rounded-2xl bg-zinc-50 p-5 text-left transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:focus:ring-zinc-600"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                  +
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Create workspace</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Start a new home base for your goals and projects.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setMode("join")}
                className="flex w-full items-center gap-4 rounded-2xl bg-zinc-50 p-5 text-left transition-colors hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:bg-zinc-800/50 dark:hover:bg-zinc-800 dark:focus:ring-zinc-600"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-semibold text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200">
                  &#x2192;
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Join workspace</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Enter an invite code to join your existing team.
                  </p>
                </div>
              </button>
            </div>
          )}

          {mode === "create" && (
            <form onSubmit={handleCreate} className="space-y-5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                autoFocus
                className="w-full rounded-xl border border-transparent bg-zinc-50 px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-800 dark:focus:ring-zinc-600"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!name.trim() || isSubmitting}
                  className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? "Creating..." : "Create workspace"}
                </button>
              </div>
            </form>
          )}

          {mode === "join" && (
            <form onSubmit={handleJoin} className="space-y-5">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Invite code (e.g. AB3CD5EF)"
                autoFocus
                className="w-full rounded-xl border border-transparent bg-zinc-50 px-4 py-3 text-center font-mono text-sm tracking-wider text-zinc-900 uppercase outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white focus:ring-2 focus:ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:bg-zinc-800 dark:focus:ring-zinc-600"
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMode("choose")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </button>
                <button
                  type="submit"
                  disabled={!inviteCode.trim() || isSubmitting}
                  className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {isSubmitting ? "Joining..." : "Join workspace"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
