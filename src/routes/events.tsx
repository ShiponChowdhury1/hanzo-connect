/**
 * Events index — browse all upcoming events across communities you've joined,
 * plus public ones to discover.
 * Project created by Shahidul Islam.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Calendar } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { EventCard } from "@/components/EventCard";

export const Route = createFileRoute("/events")({
  component: EventsPage,
  head: () => ({ meta: [{ title: "Events — Hanzo Connect" }] }),
});

function EventsPage() {
  const events = useAppStore((s) => s.events);
  const communities = useAppStore((s) => s.communities);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const sorted = useMemo(
    () => [...events].sort((a, b) => a.startsAt - b.startsAt),
    [events]
  );
  const myCommunityIds = useMemo(
    () => new Set(communities.filter((c) => c.memberIds.includes(currentUserId)).map((c) => c.id)),
    [communities, currentUserId]
  );
  const mine = sorted.filter((e) => myCommunityIds.has(e.communityId));
  const others = sorted.filter((e) => !myCommunityIds.has(e.communityId));

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 lg:px-8 lg:py-8">
      <header>
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 text-primary" />
          Upcoming events
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Events you don't want to miss
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          RSVP, host your own, and keep track of every gathering with a live countdown.
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          From your communities
        </h2>
        {mine.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No upcoming events from your communities yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      {others.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Discover
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        </section>
      )}
    </div>
  );
}
