import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { TrendingUp, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { ComposePost } from "@/components/ComposePost";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({ meta: [{ title: "Home — Hanzo Connect" }] }),
});

function HomePage() {
  const isAuthed = useAppStore((s) => s.isAuthed);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthed) navigate({ to: "/login" });
  }, [isAuthed, navigate]);

  // AppShell renders the guard — but we still bail out early to avoid
  // rendering the feed for an unknown user.
  const currentUserId = useAppStore((s) => s.currentUserId);
  const communities = useAppStore((s) => s.communities);
  const allPosts = useAppStore((s) => s.posts);
  const users = useAppStore((s) => s.users);

  const myCommunityIds = useMemo(
    () =>
      communities
        .filter((c) => c.memberIds.includes(currentUserId))
        .map((c) => c.id),
    [communities, currentUserId]
  );
  const posts = useMemo(
    () =>
      [...allPosts]
        .filter((p) => myCommunityIds.includes(p.communityId))
        .sort((a, b) => b.createdAt - a.createdAt),
    [allPosts, myCommunityIds]
  );
  const trending = useMemo(
    () =>
      [...communities]
        .sort((a, b) => b.memberIds.length - a.memberIds.length)
        .slice(0, 4),
    [communities]
  );
  const suggestedUsers = useMemo(
    () => users.filter((u) => u.id !== currentUserId).slice(0, 3),
    [users, currentUserId]
  );

  if (!isAuthed) return null;

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_320px] lg:px-8 lg:py-8">
      <div className="space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Your feed</h1>
          <p className="text-sm text-muted-foreground">Latest from your communities.</p>
        </div>
        <ComposePost />
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-soft">
            <p className="text-muted-foreground">
              Your feed is quiet. Join more communities to see posts.
            </p>
            <Link
              to="/explore"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Explore communities →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Trending communities
          </div>
          <div className="space-y-3">
            {trending.map((c) => (
              <Link
                key={c.id}
                to="/communities/$slug"
                params={{ slug: c.slug }}
                className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-muted"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">
                  {c.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.memberIds.length} members</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4 text-primary" /> People to follow
          </div>
          <div className="space-y-3">
            {suggestedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <img src={u.avatar} alt="" className="h-9 w-9 rounded-full bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{u.name}</div>
                  <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
