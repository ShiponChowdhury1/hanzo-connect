/**
 * Saved — bookmarks of posts the current user has saved.
 * Backed by `savedPostsByUser` in the store, persisted across reloads.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Bookmark } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/saved")({
  component: SavedPage,
  head: () => ({ meta: [{ title: "Saved — Hanzo Connect" }] }),
});

function SavedPage() {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const allPosts = useAppStore((s) => s.posts);
  const savedMap = useAppStore((s) => s.savedPostsByUser);

  const savedPosts = useMemo(() => {
    const ids = savedMap[currentUserId] ?? [];
    const order = new Map(ids.map((id, i) => [id, i]));
    return allPosts
      .filter((p) => order.has(p.id))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  }, [allPosts, savedMap, currentUserId]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-8">
      <header className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Bookmark className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Saved posts</h1>
          <p className="text-sm text-muted-foreground">Your private bookmark collection.</p>
        </div>
      </header>

      {savedPosts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-soft">
          <Bookmark className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            You haven't saved any posts yet. Tap the bookmark icon on a post to save it for later.
          </p>
          <Link
            to="/"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Browse your feed →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
