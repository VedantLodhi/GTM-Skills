"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { FloatingWorkflowButton } from "@/components/layout/floating-workflow-button";

/**
 * Owns the one bit of state the sidebar and header both need — whether the
 * mobile sidebar drawer is open — so neither has to reach for a global
 * store just for this. Everything else (theme, session id) already lives
 * in localStorage and doesn't need to be lifted here.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-h-screen flex-col lg:pl-64">
        <Header onOpenMenu={() => setMobileNavOpen(true)} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
          GTM Skills — a standalone showcase project.
        </footer>
      </div>
      <FloatingWorkflowButton />
    </div>
  );
}
