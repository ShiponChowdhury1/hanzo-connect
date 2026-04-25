/**
 * EventCard — displays a community event with a live countdown.
 * Cards are uniformly sized (fixed cover height + flex column body) so they
 * line up cleanly in any grid.
 *
 * Project created by Shahidul Islam.
 */
import { useEffect, useState } from "react";
import { Calendar, MapPin, Users as UsersIcon, Trash2, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { toast } from "sonner";
import type { CommunityEvent } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Returns a human-readable d/h/m/s breakdown until `target`. */
function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / (24 * 60 * 60_000));
  const hours = Math.floor((diff / (60 * 60_000)) % 24);
  const mins = Math.floor((diff / 60_000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  return { diff, days, hours, mins, secs };
}

export function EventCard({ event, showCommunity = true }: { event: CommunityEvent; showCommunity?: boolean }) {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const communities = useAppStore((s) => s.communities);
  const users = useAppStore((s) => s.users);
  const toggleAttend = useAppStore((s) => s.toggleAttendEvent);
  const deleteEvent = useAppStore((s) => s.deleteEvent);

  const community = communities.find((c) => c.id === event.communityId);
  const host = users.find((u) => u.id === event.hostId);
  const going = event.attendeeIds.includes(currentUserId);
  const isHost = event.hostId === currentUserId;
  const { diff, days, hours, mins, secs } = useCountdown(event.startsAt);
  const isLive = diff === 0;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      {/* Cover — fixed height for consistent card sizing */}
      <div
        className="relative flex h-32 shrink-0 items-end p-4"
        style={{ background: event.cover }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <span
          className={cn(
            "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur",
            isLive
              ? "bg-red-500/90 text-white animate-pulse"
              : "bg-background/80 text-foreground"
          )}
        >
          {isLive ? "● Live" : "Upcoming"}
        </span>
        <h3 className="relative line-clamp-2 font-display text-lg font-bold leading-tight text-white drop-shadow">
          {event.title}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {showCommunity && community && (
          <Link
            to="/communities/$slug"
            params={{ slug: community.slug }}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <span>{community.icon}</span> {community.name}
          </Link>
        )}

        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {event.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{format(event.startsAt, "MMM d, h:mm a")}</span>
          </div>
          <div className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-muted/40 p-2.5">
          {[
            { v: days, l: "Days" },
            { v: hours, l: "Hours" },
            { v: mins, l: "Min" },
            { v: secs, l: "Sec" },
          ].map((u) => (
            <div key={u.l} className="text-center">
              <div className="font-display text-lg font-bold tabular-nums text-foreground">
                {String(u.v).padStart(2, "0")}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {u.l}
              </div>
            </div>
          ))}
        </div>

        {/* Footer pinned to the bottom for uniform alignment */}
        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <UsersIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">
              {event.attendeeIds.length} going
              {host && ` · by ${host.name.split(" ")[0]}`}
            </span>
          </span>
          <div className="flex shrink-0 items-center gap-1">
            {isHost && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  deleteEvent(event.id);
                  toast.success("Event deleted");
                }}
                aria-label="Delete event"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              size="sm"
              variant={going ? "outline" : "default"}
              className={cn(
                "rounded-full",
                !going && "gradient-brand text-white shadow-glow hover:opacity-90"
              )}
              onClick={() => {
                toggleAttend(event.id);
                toast.success(going ? "RSVP removed" : "You're going! 🎉");
              }}
            >
              {going ? (<><Check className="mr-1 h-3.5 w-3.5" /> Going</>) : "RSVP"}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
