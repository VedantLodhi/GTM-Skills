"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleBookmark } from "@/lib/api/skills";
import { ApiError } from "@/lib/api/base";

export function BookmarkButton({ slug }: { slug: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

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
