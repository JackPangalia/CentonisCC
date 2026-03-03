/* This file defines the root HTML layout and app-wide metadata. */
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { AppProviders } from "@/app/providers";

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
};

export const metadata: Metadata = {
  title: "CentonisCC — Your business, not your to-do list",
  description:
    "The workspace for founders who want to move fast, stay focused, and actually hit their goals — without drowning in tools. Free forever.",
  applicationName: "CentonisCC",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CentonisCC",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
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
