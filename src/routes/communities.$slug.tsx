/**
 * Community Detail — Feed + Events + Chat tabs, Join/Leave/Pending flows,
 * member list with role badges, admin tools (approve/reject + cover photo
 * upload), and an invite link.
 *
 * Project created by Shahidul Islam.
 */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  Users,
  Copy,
  Check,
  Crown,
  Shield,
  ShieldCheck,
  Lock,
  Globe,
  Clock,
  ImagePlus,
  Trash2,
  MessageSquare,
  Calendar,
  Newspaper,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { resizeImage } from "@/lib/imageResize";
import { Button } from "@/components/ui/button";
import { ComposePost } from "@/components/ComposePost";
import { PostCard } from "@/components/PostCard";
import { EventCard } from "@/components/EventCard";
import { ChatWindow } from "@/components/ChatWindow";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import { JoinRequestManager } from "@/components/JoinRequestManager";
import { LeaveCommunityDialog } from "@/components/LeaveCommunityDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { CommunityCoverFit, CommunityCoverPosition, Role } from "@/lib/mockData";

export const Route = createFileRoute("/communities/$slug")({
  component: CommunityPage,
  notFoundComponent: () => (
    <div className="p-12 text-center">
      <p>Community not found.</p>
      <Link to="/communities" className="text-primary hover:underline">
        Back
      </Link>
    </div>
  ),
});

const roleMeta: Record<Role, { label: string; icon: typeof Crown; className: string }> = {
  owner: { label: "Owner", icon: Crown, className: "text-amber-600 bg-amber-500/10" },
  admin: { label: "Admin", icon: ShieldCheck, className: "text-primary bg-primary/10" },
  moderator: { label: "Mod", icon: Shield, className: "text-blue-600 bg-blue-500/10" },
  member: { label: "Member", icon: Users, className: "text-muted-foreground bg-muted" },
};

const ICON_OPTIONS = ["✨", "🎨", "🚀", "📸", "📚", "🎮", "🍳", "🎵", "💡", "🌱", "⚽", "🧠"];

const coverPositionMap: Record<CommunityCoverPosition, string> = {
  top: "top center",
  center: "center",
  bottom: "bottom center",
};

function CommunityPage() {
  const { slug } = Route.useParams();
  const communities = useAppStore((s) => s.communities);
  const community = useMemo(() => communities.find((c) => c.slug === slug), [communities, slug]);

  const users = useAppStore((s) => s.users);
  const allPosts = useAppStore((s) => s.posts);
  const allEvents = useAppStore((s) => s.events);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const requestJoin = useAppStore((s) => s.requestJoin);
  const leave = useAppStore((s) => s.leaveCommunity);
  const updateCover = useAppStore((s) => s.updateCommunityCover);
  const updateCoverLayout = useAppStore((s) => s.updateCommunityCoverLayout);
  const updateCommunityIcon = useAppStore((s) => s.updateCommunityIcon);

  const posts = useMemo(
    () =>
      [...allPosts]
        .filter((p) => p.communityId === community?.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    [allPosts, community?.id],
  );
  const events = useMemo(
    () =>
      [...allEvents]
        .filter((e) => e.communityId === community?.id)
        .sort((a, b) => a.startsAt - b.startsAt),
    [allEvents, community?.id],
  );

  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState("feed");
  const coverInput = useRef<HTMLInputElement>(null);

  if (!community) throw notFound();
  const isMember = community.memberIds.includes(currentUserId);
  const isPending = community.pendingRequests.includes(currentUserId);
  const myRole: Role | undefined = community.roles[currentUserId];
  const canManage = myRole === "owner" || myRole === "admin";
  const communityIcon = community.icon?.trim() || "✨";
  const communityName = community.name?.trim() || "Untitled community";
  const coverFit: CommunityCoverFit = community.coverFit ?? "cover";
  const coverPosition: CommunityCoverPosition = community.coverPosition ?? "center";

  const inviteLink = `https://hanzo.connect/invite/${community.slug}`;

  const handleJoin = () => {
    const result = requestJoin(community.id);
    if (result === "joined") toast.success(`Joined ${communityName}`);
    else if (result === "pending") toast.info("Request sent — admins will review it");
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file || !canManage) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    try {
      const resized = await resizeImage(file, { maxWidth: 1600, aspect: 16 / 9 });
      try {
        updateCover(community.id, resized);
        toast.success("Cover updated");
      } catch {
        // Persist write failed (likely localStorage quota). Roll back.
        updateCover(community.id, community.coverImage);
        toast.error("Storage full — try a smaller image");
      }
    } catch {
      toast.error("Could not process image");
    }
  };

  const handleCoverRemove = () => {
    if (!canManage || !community.coverImage) return;
    try {
      updateCover(community.id, undefined);
      toast.success("Cover removed");
    } catch {
      toast.error("Could not remove cover");
    }
  };

  // Layer a fallback gradient behind any uploaded image so a broken/missing
  // data URL still renders a pleasant color instead of a blank cover.
  const fallbackGradient =
    community.cover || "linear-gradient(135deg, oklch(0.72 0.18 280), oklch(0.66 0.22 320))";
  const coverStyle = { background: fallbackGradient };

  return (
    <div>
      {/* Cover */}
      <div className="relative h-44 overflow-hidden sm:h-56 md:h-64" style={coverStyle}>
        {community.coverImage && (
          <img
            src={community.coverImage}
            alt={`${communityName} cover`}
            className="absolute inset-0 h-full w-full"
            style={{ objectFit: coverFit, objectPosition: coverPositionMap[coverPosition] }}
            loading="lazy"
            onError={(e) => {
              // If the uploaded image is invalid/corrupt, keep the gradient fallback visible.
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
        {/* Soft bottom-only fade so the upload button stays crisp at the top */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/50 to-transparent" />

        {canManage && (
          <>
            {/* Always-visible upload button. z-20 keeps it above the fade and
                above the negative-margin header below the cover. */}
            <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-card ring-1 ring-border backdrop-blur transition hover:bg-background hover:scale-[1.03]"
              >
                <ImagePlus className="h-4 w-4" />
                {community.coverImage ? "Change cover" : "Upload cover photo"}
              </button>
              {community.coverImage && (
                <button
                  type="button"
                  onClick={handleCoverRemove}
                  className="inline-flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-card ring-1 ring-border backdrop-blur transition hover:bg-background hover:scale-[1.03]"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>

            {/* Big centered call-to-action when there is no uploaded photo yet,
                so the action is impossible to miss. */}
            {!community.coverImage && (
              <button
                type="button"
                onClick={() => coverInput.current?.click()}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 text-white/90 transition hover:bg-black/10"
                aria-label="Upload cover photo"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90 text-foreground shadow-card">
                  <ImagePlus className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-background/80 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
                  Click anywhere to upload a cover photo
                </span>
              </button>
            )}

            <input
              ref={coverInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleCoverUpload(e.target.files?.[0]);
                // Reset so picking the same file again still triggers onChange
                if (e.target) e.target.value = "";
              }}
            />
          </>
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        {/* Header */}
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4 pb-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-end gap-4 sm:gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-border bg-card text-3xl leading-none shadow-card sm:h-24 sm:w-24 sm:text-4xl">
              {communityIcon}
            </div>
            <div className="min-w-0 max-w-full pb-1 sm:pt-1">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <h1 className="min-w-0 break-words font-display text-2xl font-bold leading-tight tracking-tight md:text-3xl">
                  {communityName}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                    community.privacy === "private"
                      ? "bg-muted text-muted-foreground"
                      : "bg-success/15 text-success",
                  )}
                >
                  {community.privacy === "private" ? (
                    <>
                      <Lock className="h-3 w-3" /> Private
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3" /> Public
                    </>
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {community.memberIds.length} members
                {myRole && (
                  <>
                    {" "}
                    · You are{" "}
                    <span className="font-semibold text-foreground">{roleMeta[myRole].label}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="ml-auto">
            {isMember ? (
              <LeaveCommunityDialog
                communityName={communityName}
                onConfirm={() => {
                  leave(community.id);
                  toast.success(`Left ${communityName}`);
                }}
              />
            ) : isPending ? (
              <Button variant="outline" disabled className="rounded-full gap-2">
                <Clock className="h-4 w-4" /> Request pending
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                className="rounded-full gradient-brand text-white shadow-glow hover:opacity-90"
              >
                {community.privacy === "private" ? "Request to join" : "Join"}
              </Button>
            )}
          </div>
        </div>

        {canManage && (
          <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 text-sm font-semibold">Group appearance</div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Cover fit</p>
                <Select
                  value={coverFit}
                  onValueChange={(value) => {
                    updateCoverLayout(community.id, { coverFit: value as CommunityCoverFit });
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cover">Fill (crop)</SelectItem>
                    <SelectItem value="contain">Fit (no crop)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Cover position</p>
                <Select
                  value={coverPosition}
                  onValueChange={(value) => {
                    updateCoverLayout(community.id, {
                      coverPosition: value as CommunityCoverPosition,
                    });
                  }}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="bottom">Bottom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Group icon</p>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateCommunityIcon(community.id, icon)}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-base transition",
                      communityIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:bg-muted",
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tabs + sidebar */}
        <div className="grid gap-6 pb-10 lg:grid-cols-[1fr_320px]">
          <div>
            <Tabs value={tab} onValueChange={setTab} className="space-y-5">
              <TabsList className="rounded-full bg-muted p-1">
                <TabsTrigger value="feed" className="rounded-full gap-2">
                  <Newspaper className="h-3.5 w-3.5" /> Feed
                </TabsTrigger>
                <TabsTrigger value="events" className="rounded-full gap-2">
                  <Calendar className="h-3.5 w-3.5" /> Events
                  {events.length > 0 && (
                    <span className="rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
                      {events.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="chat" className="rounded-full gap-2">
                  <MessageSquare className="h-3.5 w-3.5" /> Chat
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-5">
                <p className="rounded-2xl border border-border bg-card p-5 text-sm shadow-soft">
                  {community.description}
                </p>
                {isMember && <ComposePost defaultCommunityId={community.id} />}
                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No posts yet. Be the first to share something.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((p) => (
                      <PostCard key={p.id} post={p} showCommunity={false} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="events" className="space-y-5">
                {isMember && (
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft">
                    <div>
                      <h3 className="font-semibold">Events</h3>
                      <p className="text-xs text-muted-foreground">
                        Plan a meetup, workshop or live session.
                      </p>
                    </div>
                    <CreateEventDialog communityId={community.id} />
                  </div>
                )}
                {events.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    No events scheduled yet.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {events.map((e) => (
                      <EventCard key={e.id} event={e} showCommunity={false} />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="chat">
                <ChatWindow communityId={community.id} canChat={isMember} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
            {canManage && community.pendingRequests.length > 0 && (
              <JoinRequestManager communityId={community.id} />
            )}

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" /> Members
              </div>
              <div className="space-y-3">
                {community.memberIds.map((id) => {
                  const u = users.find((x) => x.id === id);
                  if (!u) return null;
                  const role = community.roles[id] ?? "member";
                  const meta = roleMeta[role];
                  const Icon = meta.icon;
                  return (
                    <div key={id} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback>{u.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{u.name}</div>
                        <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                      </div>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          meta.className,
                        )}
                      >
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="mb-2 text-sm font-semibold">Invite people</div>
              <p className="mb-3 text-xs text-muted-foreground">
                Share this link with anyone you'd like to invite.
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs">
                <span className="flex-1 truncate">{inviteLink}</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(inviteLink);
                    setCopied(true);
                    toast.success("Invite link copied");
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="text-primary"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
