import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default function SkillNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that skill"
        description="It may have been renamed or removed. Browse the library to find what you're looking for."
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
