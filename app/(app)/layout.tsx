"use client";
/* This file protects app routes and wraps pages in shared workspace navigation. */
import { AppShell } from "@/components/layout/AppShell";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useAuth } from "@/hooks/useAuth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return <main className="p-6 text-sm text-slate-600">Loading...</main>;
  }

  return (
    <AppShell>
      <CommandPalette />
      {children}
    </AppShell>
  );
}
