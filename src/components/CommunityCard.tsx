/**
 * CommunityCard — list/grid card with smart Join/Pending/Joined states.
 * Project created by Shahidul Islam.
 */
import { Link } from "@tanstack/react-router";
import { Users, Check, Lock, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Community } from "@/lib/mockData";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { LeaveCommunityDialog } from "@/components/LeaveCommunityDialog";

export function CommunityCard({ community }: { community: Community }) {
  const currentUserId = useAppStore((s) => s.currentUserId);
  const requestJoin = useAppStore((s) => s.requestJoin);
  const leave = useAppStore((s) => s.leaveCommunity);
  const isMember = community.memberIds.includes(currentUserId);
  const isPending = community.pendingRequests.includes(currentUserId);
  const communityIcon = community.icon?.trim() || "✨";
  const communityName = community.name?.trim() || "Untitled community";
  const coverFit = community.coverFit ?? "cover";
  const coverPosition = community.coverPosition ?? "center";

  const handleJoin = () => {
    const result = requestJoin(community.id);
    if (result === "joined") toast.success(`Joined ${communityName}`);
    else if (result === "pending") toast.info("Request sent — awaiting approval");
  };

  // Fallback gradient when neither uploaded photo nor seeded gradient exist
  // (e.g. legacy community records). Keeps the cover area from rendering blank.
  const fallbackCover = "linear-gradient(135deg, oklch(0.72 0.18 280), oklch(0.66 0.22 320))";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition hover:-translate-y-0.5 hover:shadow-card">
      <div
        className="aspect-[16/9] w-full bg-cover bg-center"
        style={{ background: community.cover || fallbackCover }}
      >
        {community.coverImage && (
          <img
            src={community.coverImage}
            alt={`${communityName} cover`}
            className="h-full w-full"
            style={{
              objectFit: coverFit,
              objectPosition: coverPosition === "center" ? "center" : `${coverPosition} center`,
            }}
            loading="lazy"
            onError={(e) => {
              // Fall back to the gradient background if image decoding fails.
              e.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="-mt-10 mb-3 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-card text-2xl leading-none shadow-soft">
          {communityIcon}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <Link
            to="/communities/$slug"
            params={{ slug: community.slug }}
            className="block min-w-0 flex-1 break-words text-base font-semibold leading-tight hover:text-primary"
            title={communityName}
          >
            {communityName}
          </Link>
          {community.privacy === "private" && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <Lock className="h-2.5 w-2.5" /> Private
            </span>
          )}
        </div>
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-sm text-muted-foreground">
          {community.description}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {community.memberIds.length} members
          </span>
          {isMember ? (
            <LeaveCommunityDialog
              communityName={communityName}
              onConfirm={() => {
                leave(community.id);
                toast.success(`Left ${communityName}`);
              }}
            />
          ) : isPending ? (
            <Button size="sm" variant="outline" disabled className="rounded-full gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Pending
            </Button>
          ) : (
            <Button
              size="sm"
              className="rounded-full gradient-brand text-white shadow-glow hover:opacity-90"
              onClick={handleJoin}
            >
              {community.privacy === "private" ? "Request" : "Join"}
            </Button>
          )}
          {isMember && (
            <span className="hidden">
              <Check className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
