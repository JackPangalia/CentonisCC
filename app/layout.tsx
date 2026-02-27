/* This file defines the root HTML layout and app-wide metadata. */
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const metadata: Metadata = {
  title: "Workspace MVP",
  description: "Personal and team goal workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          GeistSans.className,
          "min-h-screen antialiased selection:bg-blue-200 selection:text-blue-900 dark:selection:bg-blue-900/50 dark:selection:text-blue-100",
        ].join(" ")}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
