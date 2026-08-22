"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Layers, ListTodo, Sparkles, Star, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { name: string; href: string; icon: typeof Compass; exact?: boolean };
type NavSection = { label: string; items: NavItem[] };

// Every href below routes into a real, working page/filter — nothing here
// is decorative. "Featured" reuses the backend's real `featured` filter
// param rather than a fabricated "Trending"/"Most Used" concept the API
// doesn't support.
const SECTIONS: NavSection[] = [
  {
    label: "Discover",
    items: [
      { name: "Home", href: "/", icon: Sparkles, exact: true },
      { name: "Browse Skills", href: "/skills", icon: Compass },
      { name: "Featured", href: "/skills?featured=true", icon: Star },
      { name: "Collections", href: "/collections", icon: Layers },
    ],
  },
  {
    label: "Build",
    items: [{ name: "My Workflow", href: "/workflow", icon: ListTodo }],
  },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === "/";
  return pathname.startsWith(item.href.split("?")[0]);
}

function SidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <Link href="/" className="flex items-center gap-2 px-5 py-5 font-semibold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-base">GTM Skills</span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/15 text-primary"
                        : "text-sidebar-foreground/75 hover:bg-secondary hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-3">
        <a
          href="https://github.com/VedantLodhi/GTM-Skills"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-sidebar-foreground/75 hover:bg-secondary hover:text-sidebar-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          View on GitHub
        </a>
      </div>
    </div>
  );
}

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Desktop — fixed, always visible */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile — slide-in drawer + backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 border-r border-sidebar-border bg-sidebar transition-transform lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary"
        >
          <X className="h-4 w-4" />
        </button>
        <SidebarContent />
      </aside>
    </>
  );
}
