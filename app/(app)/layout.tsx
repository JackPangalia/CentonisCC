"use client";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useAuth } from "@/hooks/useAuth";
import { WorkspaceProvider } from "@/hooks/useWorkspaceContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const isFullscreenPage =
    pathname?.match(/^\/entry\/[^/]+$/) || pathname?.match(/^\/projects\/[^/]+$/) || pathname === "/onboarding";

  if (isLoading || !user) {
    return <main className="p-6 text-sm text-slate-600">Loading...</main>;
  }

  return (
    <WorkspaceProvider>
      <AppShell fullscreen={!!isFullscreenPage}>
        <CommandPalette />
        {children}
      </AppShell>
    </WorkspaceProvider>
  );
}
