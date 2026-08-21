"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getBookmarks, toggleBookmark } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";

export function BookmarkButton({ slug }: { slug: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate the real bookmark state from the server on mount — the button
  // previously always started at `false`, so a bookmarked skill would show
  // "Bookmark" again after a reload even though the server-side bookmark
  // still existed. `ready` stays false until this resolves, so the button
  // renders as a disabled placeholder (same pattern as before) instead of
  // flashing "Bookmark" and then flipping to "Bookmarked".
  useEffect(() => {
    let cancelled = false;
    getBookmarks()
      .then((bookmarks) => {
        if (!cancelled) setBookmarked(bookmarks.some((b) => b.slug === slug));
      })
      .catch(() => {
        // Non-fatal — worst case the button starts as "Bookmark" until the
        // next toggle; don't block the page on this.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleClick = async () => {
    setLoading(true);
    const previous = bookmarked;
    setBookmarked(!previous); // optimistic
    try {
      const res = await toggleBookmark(slug);
      setBookmarked(res.bookmarked);
      toast.success(res.bookmarked ? "Saved to bookmarks" : "Removed from bookmarks");
    } catch (err) {
      setBookmarked(previous); // rollback
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!ready) return <Button variant="outline" size="md" disabled className="w-full" />;

  return (
    <Button variant="outline" size="md" loading={loading} onClick={handleClick} className="w-full">
      {bookmarked ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
