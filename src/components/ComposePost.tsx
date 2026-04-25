import { useMemo, useRef, useState } from "react";
import { Image as ImageIcon, Video, Send, X, Smile } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useCurrentUser } from "@/store/useAppStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMOJIS = ["😀", "🔥", "🎉", "❤️", "👏", "🚀", "✨", "💡", "😎", "🙌"];

export function ComposePost({ defaultCommunityId }: { defaultCommunityId?: string }) {
  const user = useCurrentUser();
  const allCommunities = useAppStore((s) => s.communities);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const communities = useMemo(
    () => allCommunities.filter((c) => c.memberIds.includes(currentUserId)),
    [allCommunities, currentUserId]
  );
  const createPost = useAppStore((s) => s.createPost);

  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState(defaultCommunityId || communities[0]?.id || "");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const imageInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined, kind: "image" | "video") => {
    if (!file) return;
    const expectedPrefix = kind === "image" ? "image/" : "video/";
    if (!file.type.startsWith(expectedPrefix)) {
      toast.error(`Please choose a ${kind} file`);
      return;
    }
    // Attachments persist as data URLs in localStorage (~5MB budget).
    // Cap at 4MB so persistence doesn't silently break on the next reload.
    if (file.size > 4 * 1024 * 1024) {
      toast.error(`${kind === "image" ? "Image" : "Video"} too large (max 4MB)`);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("Could not read file");
    reader.onload = () => {
      const url = reader.result as string;
      if (kind === "image") {
        setImage(url);
        setVideo("");
      } else {
        setVideo(url);
        setImage("");
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (!content.trim() || !communityId) return;
    createPost({
      communityId,
      content: content.trim(),
      image: image || undefined,
      video: video || undefined,
    });
    setContent("");
    setImage("");
    setVideo("");
    setShowEmoji(false);
    toast.success("Post shared");
  };

  if (!user) return null;

  if (communities.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground shadow-soft">
        Join a community to start posting.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-primary/20">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${user.name.split(" ")[0]}?`}
            rows={3}
            className="resize-none border-0 bg-transparent px-0 text-[15px] focus-visible:ring-0"
          />

          {image && (
            <div className="relative overflow-hidden rounded-xl border border-border">
              <img src={image} alt="" className="max-h-80 w-full object-cover" />
              <button
                onClick={() => setImage("")}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur hover:bg-background"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {video && (
            <div className="relative overflow-hidden rounded-xl border border-border bg-black">
              <video src={video} controls className="max-h-80 w-full" />
              <button
                onClick={() => setVideo("")}
                className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 backdrop-blur hover:bg-background"
                aria-label="Remove video"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {showEmoji && (
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-muted/50 p-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setContent((c) => c + e)}
                  className="rounded-lg px-2 py-1 text-lg hover:bg-accent"
                >
                  {e}
                </button>
              ))}
            </div>
          )}

          <input
            ref={imageInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0], "image")}
          />
          <input
            ref={videoInput}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0], "video")}
          />

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
            <div className="flex flex-wrap items-center gap-1">
              {!defaultCommunityId && (
                <Select value={communityId} onValueChange={setCommunityId}>
                  <SelectTrigger className="h-9 w-auto gap-2 rounded-lg border-primary/20 bg-primary/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => imageInput.current?.click()}
                className="gap-2 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400"
              >
                <ImageIcon className="h-4 w-4" /> Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => videoInput.current?.click()}
                className="gap-2 text-rose-600 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400"
              >
                <Video className="h-4 w-4" /> Video
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowEmoji((v) => !v)}
                className="gap-2 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400"
              >
                <Smile className="h-4 w-4" /> Emoji
              </Button>
            </div>
            <Button onClick={submit} disabled={!content.trim()} className="gap-2 rounded-full px-5">
              <Send className="h-4 w-4" /> Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
