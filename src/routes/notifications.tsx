/**
 * Notifications — clickable list. Tapping a notification marks it read,
 * expands a quick-detail card, and routes to the related post or community.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Bell, Heart, MessageCircle, UserPlus, Calendar, Check, ArrowRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  component: NotificationsPage,
  head: () => ({ meta: [{ title: "Notifications — Hanzo Connect" }] }),
});

const iconFor = (type: string) => {
  if (type === "like") return Heart;
  if (type === "comment") return MessageCircle;
  if (type === "event") return Calendar;
  if (type === "approved") return Check;
  return UserPlus;
};

function NotificationsPage() {
  const rawNotifications = useAppStore((s) => s.notifications);
  const notifications = useMemo(
    () => [...rawNotifications].sort((a, b) => b.createdAt - a.createdAt),
    [rawNotifications]
  );
  const users = useAppStore((s) => s.users);
  const communities = useAppStore((s) => s.communities);
  const posts = useAppStore((s) => s.posts);
  const markAll = useAppStore((s) => s.markAllNotificationsRead);
  const markOne = useAppStore((s) => s.markNotificationRead);

  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClick = (id: string) => {
    markOne(id);
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const goToTarget = (n: (typeof notifications)[number]) => {
    if (n.communityId) {
      const c = communities.find((x) => x.id === n.communityId);
      if (c) {
        navigate({ to: "/communities/$slug", params: { slug: c.slug } });
        return;
      }
    }
    if (n.postId) {
      const p = posts.find((x) => x.id === n.postId);
      const c = p && communities.find((x) => x.id === p.communityId);
      if (c) {
        navigate({ to: "/communities/$slug", params: { slug: c.slug } });
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up."}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAll}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {notifications.map((n) => {
              const Icon = iconFor(n.type);
              const actor = users.find((u) => u.id === n.actorId);
              if (!actor) return null;
              const expanded = expandedId === n.id;
              const linkedPost = n.postId ? posts.find((p) => p.id === n.postId) : undefined;
              const linkedCommunity = n.communityId ? communities.find((c) => c.id === n.communityId) : undefined;
              return (
                <li
                  key={n.id}
                  className={cn(
                    "transition",
                    !n.read && "bg-primary/5",
                    expanded && "bg-muted/40"
                  )}
                >
                  <button
                    onClick={() => handleClick(n.id)}
                    className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/40"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={actor.avatar} />
                        <AvatarFallback>{actor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-white",
                          n.type === "like" && "bg-rose-500",
                          n.type === "comment" && "bg-blue-500",
                          n.type === "event" && "bg-amber-500",
                          n.type === "approved" && "bg-emerald-500",
                          (n.type === "invite" || n.type === "join_request") && "bg-primary"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-semibold">{actor.name}</span>{" "}
                        <span className="text-muted-foreground">{n.message}</span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    {!n.read && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </button>

                  {/* Expanded detail */}
                  {expanded && (
                    <div className="border-t border-border bg-background/50 px-4 py-3">
                      {linkedPost && (
                        <div className="mb-2 line-clamp-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                          "{linkedPost.content}"
                        </div>
                      )}
                      {linkedCommunity && !linkedPost && (
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs">
                          <span>{linkedCommunity.icon}</span> {linkedCommunity.name}
                        </div>
                      )}
                      <Button
                        size="sm"
                        onClick={() => goToTarget(n)}
                        className="gap-1.5 rounded-full gradient-brand text-white shadow-glow hover:opacity-90"
                      >
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
