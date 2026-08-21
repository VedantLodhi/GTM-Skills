import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";

export default function CollectionNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24">
      <EmptyState
        icon={SearchX}
        title="We couldn't find that collection"
        description="It may have been renamed or removed. Browse all collections to find what you're looking for."
        action={
          <LinkButton href="/collections" variant="default">
            Browse collections
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
