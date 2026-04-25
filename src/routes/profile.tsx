/**
 * Profile — the signed-in user's own activity: communities they belong to and
 * the posts they've authored. Fully dynamic from store state.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef } from "react";
import { Bookmark, MessageCircle, Heart, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useCurrentUser } from "@/store/useAppStore";
import { resizeImage } from "@/lib/imageResize";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/PostCard";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Profile — Hanzo Connect" }] }),
});

function ProfilePage() {
  const user = useCurrentUser();
  const communities = useAppStore((s) => s.communities);
  const posts = useAppStore((s) => s.posts);
  const comments = useAppStore((s) => s.comments);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const updateProfile = useAppStore((s) => s.updateProfile);

  const coverInput = useRef<HTMLInputElement>(null);

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
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
        updateProfile({ coverImage: resized });
        toast.success("Cover updated");
      } catch {
        updateProfile({ coverImage: user?.coverImage });
        toast.error("Storage full — try a smaller image");
      }
    } catch {
      toast.error("Could not process image");
    }
  };

  const handleCoverRemove = () => {
    if (!user?.coverImage) return;
    try {
      updateProfile({ coverImage: undefined });
      toast.success("Cover removed");
    } catch {
      toast.error("Could not remove cover");
    }
  };

  const myCommunities = useMemo(
    () => communities.filter((c) => c.memberIds.includes(currentUserId)),
    [communities, currentUserId]
  );
  const myPosts = useMemo(
    () =>
      [...posts]
        .filter((p) => p.authorId === currentUserId)
        .sort((a, b) => b.createdAt - a.createdAt),
    [posts, currentUserId]
  );
  const stats = useMemo(() => {
    const likesReceived = posts
      .filter((p) => p.authorId === currentUserId)
      .reduce((sum, p) => sum + p.likedBy.length, 0);
    const commentsMade = comments.filter((c) => c.authorId === currentUserId).length;
    return { likesReceived, commentsMade };
  }, [posts, comments, currentUserId]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {/* Header banner */}
        <div className="relative h-32 sm:h-48 overflow-hidden bg-muted">
          {user.coverImage ? (
            <img
              src={user.coverImage}
              alt={`${user.name} cover`}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 h-full w-full gradient-brand" />
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/50 to-transparent" />
          
          <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              className="inline-flex items-center gap-2 rounded-full bg-background/95 px-3.5 py-2 text-xs font-semibold text-foreground shadow-card ring-1 ring-border backdrop-blur transition hover:bg-background hover:scale-[1.03]"
            >
              <ImagePlus className="h-4 w-4" />
              {user.coverImage ? "Change cover" : "Upload cover photo"}
            </button>
            {user.coverImage && (
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
          <input
            ref={coverInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              handleCoverUpload(e.target.files?.[0]);
              if (e.target) e.target.value = "";
            }}
          />
        </div>
        <div className="p-6 pt-0">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="-mt-12 flex items-end gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-card">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="pb-1">
                <h1 className="font-display text-2xl font-bold">{user.name}</h1>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/settings">Edit profile</Link>
            </Button>
          </div>

          {user.bio && <p className="mt-4 text-sm">{user.bio}</p>}

          {/* Stats */}
          <div className="mt-5 grid grid-cols-4 gap-2 rounded-xl border border-border bg-muted/30 p-3 text-center">
            <Stat label="Posts" value={myPosts.length} />
            <Stat label="Communities" value={myCommunities.length} icon={<MessageCircle className="h-3.5 w-3.5" />} />
            <Stat label="Likes" value={stats.likesReceived} icon={<Heart className="h-3.5 w-3.5" />} />
            <Stat label="Comments" value={stats.commentsMade} icon={<Bookmark className="h-3.5 w-3.5" />} />
          </div>

          <div className="mt-6 border-t border-border pt-4">
            <h3 className="mb-2 text-sm font-semibold">Communities</h3>
            {myCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not a member of any community yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {myCommunities.map((c) => (
                  <Link
                    key={c.id}
                    to="/communities/$slug"
                    params={{ slug: c.slug }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm text-accent-foreground hover:bg-primary/15"
                  >
                    <span>{c.icon}</span> {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 font-display text-lg font-bold">Your posts</h2>
        {myPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            You haven't posted anything yet.
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="font-display text-xl font-bold tabular-nums">{value}</div>
      <div className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon} {label}
      </div>
    </div>
  );
}
