import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
  Bookmark,
  ImagePlus,
  Video,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { resizeImage } from "@/lib/imageResize";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Post } from "@/lib/mockData";

export function PostCard({ post, showCommunity = true }: { post: Post; showCommunity?: boolean }) {
  const users = useAppStore((s) => s.users);
  const communities = useAppStore((s) => s.communities);
  const allComments = useAppStore((s) => s.comments);
  const comments = useMemo(
    () => allComments.filter((c) => c.postId === post.id),
    [allComments, post.id],
  );
  const currentUserId = useAppStore((s) => s.currentUserId);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const sharePost = useAppStore((s) => s.sharePost);
  const addComment = useAppStore((s) => s.addComment);
  const editComment = useAppStore((s) => s.editComment);
  const deleteComment = useAppStore((s) => s.deleteComment);
  const editPost = useAppStore((s) => s.editPost);
  const deletePost = useAppStore((s) => s.deletePost);

  const author = users.find((u) => u.id === post.authorId);
  const community = communities.find((c) => c.id === post.communityId);
  const liked = post.likedBy.includes(currentUserId);
  const isMine = post.authorId === currentUserId;

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [editImage, setEditImage] = useState<string | undefined>(post.image);
  const [editVideo, setEditVideo] = useState<string | undefined>(post.video);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const editImageInput = useRef<HTMLInputElement>(null);
  const editVideoInput = useRef<HTMLInputElement>(null);

  // Persistent saved state — backed by `savedPostsByUser` in the store.
  const savedMap = useAppStore((s) => s.savedPostsByUser);
  const toggleSavePost = useAppStore((s) => s.toggleSavePost);
  const saved = (savedMap[currentUserId] ?? []).includes(post.id);

  if (!author) return null;

  const handleShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/communities/${community?.slug ?? ""}#post-${post.id}`;
    sharePost(post.id);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `Post by ${author.name}`, text: post.content, url });
      } else {
        await navigator.clipboard?.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      /* user cancelled */
    }
  };

  const handleEditImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large (max 4MB)");
      return;
    }
    try {
      const resized = await resizeImage(file, { maxWidth: 1200, aspect: 16 / 9 });
      setEditImage(resized);
      setEditVideo(undefined);
      toast.success("Image ready");
    } catch {
      toast.error("Could not process image");
    }
  };

  const handleEditVideo = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Video too large (max 4MB)");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read video");
    reader.onload = () => {
      setEditVideo(reader.result as string);
      setEditImage(undefined);
      toast.success("Video ready");
    };
    reader.readAsDataURL(file);
  };

  return (
    <article
      id={`post-${post.id}`}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:shadow-card"
    >
      <header className="flex items-start gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-primary/15">
          <AvatarImage src={author.avatar} />
          <AvatarFallback>{author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">
            <span className="font-semibold text-foreground">{author.name}</span>
            <span className="text-muted-foreground">@{author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
          {showCommunity && community && (
            <Link
              to="/communities/$slug"
              params={{ slug: community.slug }}
              className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <span>{community.icon}</span> {community.name}
            </Link>
          )}
        </div>
        {isMine && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditText(post.content);
                  setEditImage(post.image);
                  setEditVideo(post.video);
                  setEditing(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  deletePost(post.id);
                  toast.success("Post deleted");
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      <div className="mt-3">
        {editing ? (
          <div className="space-y-2">
            <Textarea value={editText} onChange={(e) => setEditText(e.target.value)} rows={3} />
            {editImage && (
              <div className="relative overflow-hidden rounded-xl border border-border bg-muted">
                <div className="aspect-[16/9] w-full">
                  <img src={editImage} alt="Edited post" className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setEditImage(undefined)}
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
                  aria-label="Remove image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {editVideo && (
              <div className="relative overflow-hidden rounded-xl border border-border bg-black">
                <div className="aspect-[16/9] w-full">
                  <video src={editVideo} controls className="h-full w-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => setEditVideo(undefined)}
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
                  aria-label="Remove video"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <input
              ref={editImageInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleEditImage(e.target.files?.[0]);
                if (e.target) e.target.value = "";
              }}
            />
            <input
              ref={editVideoInput}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                handleEditVideo(e.target.files?.[0]);
                if (e.target) e.target.value = "";
              }}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => editImageInput.current?.click()}
                className="gap-1.5"
              >
                <ImagePlus className="h-3.5 w-3.5" />
                {editImage ? "Change image" : "Add image"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={() => editVideoInput.current?.click()}
                className="gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                {editVideo ? "Change video" : "Add video"}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  editPost(post.id, { content: editText, image: editImage, video: editVideo });
                  setEditing(false);
                  toast.success("Post updated");
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditText(post.content);
                  setEditImage(post.image);
                  setEditVideo(post.video);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {post.content}
          </p>
        )}
      </div>

      {/* Uniform 16:9 media frame so all post cards look consistent */}
      {post.image && !editing && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted">
          <div className="aspect-[16/9] w-full">
            <img src={post.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      )}

      {post.video && !editing && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-black">
          <div className="aspect-[16/9] w-full">
            <video src={post.video} controls className="h-full w-full object-cover" />
          </div>
        </div>
      )}

      <footer className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleLike(post.id)}
            className={cn(
              "gap-2 rounded-full",
              liked && "bg-rose-500/10 text-rose-500 hover:bg-rose-500/15 hover:text-rose-500",
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} />
            <span>{post.likedBy.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments((v) => !v)}
            className="gap-2 rounded-full"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{comments.length}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare} className="gap-2 rounded-full">
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            toggleSavePost(post.id);
            toast.success(saved ? "Removed from saved" : "Saved");
          }}
          className={cn("h-9 w-9 rounded-full", saved && "text-primary")}
          aria-label="Save post"
          title={saved ? "Remove from saved" : "Save for later"}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
        </Button>
      </footer>

      {showComments && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {comments.map((c) => {
            const u = users.find((x) => x.id === c.authorId);
            if (!u) return null;
            const mine = c.authorId === currentUserId;
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={u.avatar} />
                  <AvatarFallback>{u.name[0]}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-2xl bg-muted px-3 py-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold">{u.name}</span>
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(c.createdAt, { addSuffix: true })}
                    </span>
                    {mine && (
                      <div className="ml-auto flex gap-1">
                        <button
                          onClick={() => {
                            setEditingCommentId(c.id);
                            setEditingCommentText(c.content);
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                  {editingCommentId === c.id ? (
                    <div className="mt-1 space-y-1.5">
                      <Textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          onClick={() => {
                            editComment(c.id, editingCommentText);
                            setEditingCommentId(null);
                          }}
                        >
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-0.5 text-sm">{c.content}</p>
                  )}
                </div>
              </div>
            );
          })}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!commentText.trim()) return;
              addComment(post.id, commentText.trim());
              setCommentText("");
            }}
            className="flex items-start gap-2.5"
          >
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={1}
              placeholder="Write a comment..."
              className="min-h-10 resize-none rounded-xl"
            />
            <Button type="submit" size="sm" disabled={!commentText.trim()} className="rounded-full">
              Post
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
