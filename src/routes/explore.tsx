import { createFileRoute } from "@tanstack/react-router";
import { useAppStore } from "@/store/useAppStore";
import { CommunityCard } from "@/components/CommunityCard";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
  head: () => ({ meta: [{ title: "Explore — Hanzo Connect" }] }),
});

function ExplorePage() {
  const communities = useAppStore((s) => s.communities);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Explore communities</h1>
        <p className="text-sm text-muted-foreground">
          Discover spaces built around what you care about.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {communities.map((c) => (
          <CommunityCard key={c.id} community={c} />
        ))}
      </div>
    </div>
  );
}
