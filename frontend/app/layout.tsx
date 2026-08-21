import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GTM Skills — A Go-to-Market Skills Library",
  description:
    "Browse, run, and compose GTM skills — structured playbooks for prospecting, outreach, qualification, and closing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          GTM Skills — a standalone showcase project.
        </footer>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
