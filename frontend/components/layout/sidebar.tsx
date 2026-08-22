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
      <Link href="/" className="flex items-center gap-2.5 px-5 py-6 font-semibold">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-sm">
          <Sparkles className="h-4 w-4" />
        </span>
        <span className="text-base tracking-tight">GTM Skills</span>
      </Link>

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg py-2 pl-3 pr-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-sidebar-foreground/70 hover:bg-secondary hover:text-sidebar-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary transition-opacity",
                        active ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                    <item.icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground"
                      )}
                    />
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
          className="group flex items-center gap-3 rounded-lg py-2 pl-3 pr-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-secondary hover:text-sidebar-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0 text-sidebar-foreground/50 transition-colors group-hover:text-sidebar-foreground" />
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
