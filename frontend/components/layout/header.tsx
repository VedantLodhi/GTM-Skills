"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/** Header-level quick search — submits into the full discovery experience
 * on /skills (same `q` param the filter bar there already uses), rather
 * than duplicating search logic. */
function HeaderSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/skills?q=${encodeURIComponent(q)}` : "/skills");
  };

  return (
    <form onSubmit={submit} className="relative hidden w-full max-w-md sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search skills…"
        className="h-9 border-transparent bg-secondary/60 pl-9 hover:border-border focus-visible:border-border focus-visible:bg-input"
      />
    </form>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <HeaderSearch />

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />
          <LinkButton href="/skills" size="sm" className="hidden sm:inline-flex">
            Browse Skills
          </LinkButton>
        </div>
      </div>
    </header>
  );
}
