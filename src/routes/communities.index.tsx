import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Plus } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { CommunityCard } from "@/components/CommunityCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/communities/")({
  component: CommunitiesPage,
  head: () => ({ meta: [{ title: "Communities — Hanzo Connect" }] }),
});

function CommunitiesPage() {
  const communities = useAppStore((s) => s.communities);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const mine = useMemo(
    () => communities.filter((c) => c.memberIds.includes(currentUserId)),
    [communities, currentUserId]
  );
  const others = useMemo(
    () => communities.filter((c) => !c.memberIds.includes(currentUserId)),
    [communities, currentUserId]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Communities</h1>
          <p className="text-sm text-muted-foreground">Manage what you've joined and find new spaces.</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/communities/new">
            <Plus className="h-4 w-4" /> Create community
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Joined
        </h2>
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            You haven't joined any communities yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((c) => (
              <CommunityCard key={c.id} community={c} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Discover
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
