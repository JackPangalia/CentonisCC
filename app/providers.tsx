"use client";
/* This file wraps the app with client-side providers like authentication state. */
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useTheme } from "next-themes";

// We need a wrapper to make the Toaster theme dynamic
function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme as "light" | "dark" | "system"}
      position="bottom-right"
      className="font-sans"
      richColors
      toastOptions={{
        style: {
          borderRadius: '12px',
          padding: '16px',
        },
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-lg dark:group-[.toaster]:bg-zinc-900/90 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800 backdrop-blur-md",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400",
          actionButton: "group-[.toast]:bg-zinc-900 group-[.toast]:text-zinc-50 dark:group-[.toast]:bg-zinc-50 dark:group-[.toast]:text-zinc-900",
          cancelButton: "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400",
        },
      }}
    />
  );
}

type AppProvidersProps = {
  children: React.ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
        <ThemedToaster />
      </AuthProvider>
    </NextThemesProvider>
  );
}
