import Link from "next/link";
import { CompassIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={CompassIcon}
        title="We couldn't find that page"
        description="It may have moved, or the link might be off. Head back to the skill library to keep browsing."
        action={
          <LinkButton href="/skills" variant="default">
            Browse the library
          </LinkButton>
        }
      />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground underline underline-offset-4">
          Or go home
        </Link>
      </p>
    </div>
  );
}
