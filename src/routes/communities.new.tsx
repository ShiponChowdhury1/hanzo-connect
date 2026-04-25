/**
 * Create Community — form including privacy selection and resized cover upload.
 * Project created by Shahidul Islam.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Globe, Lock, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { resizeImage } from "@/lib/imageResize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/communities/new")({
  component: NewCommunityPage,
  head: () => ({ meta: [{ title: "New community — Hanzo Connect" }] }),
});

const ICONS = ["✨", "🎨", "🚀", "📸", "📚", "🎮", "🍳", "🎵", "💡", "🌱", "⚽", "🧠"];

function NewCommunityPage() {
  const create = useAppStore((s) => s.createCommunity);
  const communities = useAppStore((s) => s.communities);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("✨");
  const [privacy, setPrivacy] = useState<"public" | "private">("public");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleCover = async (file?: File) => {
    if (!file) return;
    try {
      const resized = await resizeImage(file, { maxWidth: 1200, aspect: 16 / 9 });
      setCoverImage(resized);
      toast.success("Cover photo ready");
    } catch {
      toast.error("Could not process image");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const id = create({
      name: name.trim(),
      description: description.trim(),
      icon,
      privacy,
      coverImage,
    });
    const c = communities.find((x) => x.id === id);
    toast.success("Community created 🎉");
    if (c) navigate({ to: "/communities/$slug", params: { slug: c.slug } });
    else navigate({ to: "/communities" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-8">
      <h1 className="font-display text-3xl font-bold tracking-tight">Create a community</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Set up a new space, choose privacy, and invite people to join.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft"
      >
        {/* Cover */}
        <div className="space-y-1.5">
          <Label>Cover photo (16:9 — auto-resized)</Label>
          <div
            className="relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40"
            style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {!coverImage && (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ImagePlus className="h-7 w-7" />
                <span className="text-sm font-medium">Upload cover photo</span>
                <span className="text-xs">Recommended 1200×675</span>
              </button>
            )}
            {coverImage && (
              <button
                type="button"
                onClick={() => setCoverImage(undefined)}
                className="absolute right-3 top-3 rounded-full bg-background/80 p-1.5 backdrop-blur hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCover(e.target.files?.[0])}
            />
          </div>
          {coverImage && (
            <Button type="button" variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
              Change cover
            </Button>
          )}
        </div>

        {/* Icon */}
        <div className="space-y-1.5">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-2">
            {ICONS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIcon(i)}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-lg transition",
                  icon === i ? "bg-primary text-primary-foreground shadow-glow" : "bg-muted hover:bg-accent"
                )}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Indie Game Devs" required />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="desc">Description</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What is this community about?"
          />
        </div>

        {/* Privacy */}
        <div className="space-y-1.5">
          <Label>Privacy</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPrivacy("public")}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                privacy === "public" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
              )}
            >
              <Globe className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Public</div>
                <div className="text-xs text-muted-foreground">Anyone can join instantly.</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setPrivacy("private")}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-3 text-left transition",
                privacy === "private" ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
              )}
            >
              <Lock className="mt-0.5 h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Private</div>
                <div className="text-xs text-muted-foreground">Admins approve each request.</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => navigate({ to: "/communities" })}>
            Cancel
          </Button>
          <Button type="submit" className="gradient-brand text-white shadow-glow hover:opacity-90">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
}
