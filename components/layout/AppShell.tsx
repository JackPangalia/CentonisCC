"use client";
/* This file renders shared authenticated navigation for personal and teams. */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/authService";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className={`rounded px-3 py-2 text-sm ${
                pathname === "/dashboard" ? "bg-slate-900 text-white" : "bg-slate-100"
              }`}
            >
              Personal
            </Link>
            <Link
              href="/teams"
              className={`rounded px-3 py-2 text-sm ${
                pathname === "/teams" || pathname.startsWith("/teams/")
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100"
              }`}
            >
              Teams
            </Link>
          </div>
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-5">{children}</main>
    </div>
  );
}
