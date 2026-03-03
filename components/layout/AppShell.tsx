"use client";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/services/authService";
import { FloatingDock } from "@/components/ui/FloatingDock";
import { Home, CalendarDays, Settings, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useWorkspaceContext } from "@/hooks/useWorkspaceContext";

type AppShellProps = {
  children: React.ReactNode;
  fullscreen?: boolean;
};

export function AppShell({ children, fullscreen }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { workspace } = useWorkspaceContext();
  const isOnboarding = pathname === "/onboarding";

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  const navItems = [
    { title: "Home", href: "/dashboard", icon: <Home className="h-5 w-5" /> },
    { title: "Daily", href: "/daily", icon: <CalendarDays className="h-5 w-5" /> },
    { title: "Settings", href: "/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  if (fullscreen) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  const isWideLayout = pathname?.startsWith("/daily");

  return (
    <div className="min-h-screen pb-24">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between p-4 pointer-events-none bg-white/50 dark:bg-[#191919]/50 backdrop-blur-sm border-b border-transparent">
        {workspace && (
          <span className="pointer-events-auto text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full px-4 py-2">
            {workspace.name}
          </span>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="pointer-events-auto flex items-center gap-2 rounded-full border border-zinc-200 bg-white/50 px-4 py-2 text-sm text-zinc-600 backdrop-blur-md transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className={`mx-auto max-w-[1400px] pt-16 space-y-4 ${isWideLayout ? "" : "px-4 sm:px-8"}`}>
        {children}
      </main>

      {!isOnboarding && <FloatingDock items={navItems} />}
    </div>
  );
}
