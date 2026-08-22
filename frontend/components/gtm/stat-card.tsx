import { Card, CardContent } from "@/components/ui/card";

/** Minimal, left-aligned stat block — number + label, no icon. Every
 * value passed in comes from a live API call (see app/page.tsx); this
 * component never carries its own numbers. */
export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="border-border/80">
      <CardContent className="py-5">
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card className="border-border/80">
      <CardContent className="space-y-2 py-5">
        <div className="h-8 w-14 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-24 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
