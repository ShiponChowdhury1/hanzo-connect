/**
 * CreateEventDialog — modal form for hosting a new community event.
 * Project created by Shahidul Islam.
 */
import { useRef, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { resizeImage } from "@/lib/imageResize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

const COVERS = [
  "linear-gradient(135deg, oklch(0.68 0.22 285), oklch(0.7 0.2 320))",
  "linear-gradient(135deg, oklch(0.72 0.18 220), oklch(0.66 0.22 280))",
  "linear-gradient(135deg, oklch(0.72 0.2 30), oklch(0.62 0.22 350))",
  "linear-gradient(135deg, oklch(0.68 0.18 160), oklch(0.62 0.2 200))",
];

export function CreateEventDialog({ communityId }: { communityId: string }) {
  const create = useAppStore((s) => s.createEvent);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cover, setCover] = useState(COVERS[0]);
  /** Optional uploaded cover image (data URL). Takes precedence over gradient. */
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleCoverFile = async (file?: File) => {
    if (!file) return;
    try {
      const resized = await resizeImage(file, { maxWidth: 1200, aspect: 16 / 9 });
      setCoverImage(resized);
    } catch {
      toast.error("Could not process image");
    }
  };

  const submit = () => {
    if (!title.trim() || !date || !time) {
      toast.error("Title, date and time are required");
      return;
    }
    const startsAt = new Date(`${date}T${time}`).getTime();
    if (Number.isNaN(startsAt)) {
      toast.error("Invalid date/time");
      return;
    }
    // If user uploaded a photo, use it as a CSS background-image so EventCard
    // (which renders `style={{ background: event.cover }}`) shows it correctly.
    const finalCover = coverImage
      ? `center / cover no-repeat url(${coverImage})`
      : cover;
    create({
      communityId,
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || "TBA",
      startsAt,
      cover: finalCover,
    });
    toast.success("Event created 🎉");
    setOpen(false);
    setTitle(""); setDescription(""); setLocation(""); setDate(""); setTime("");
    setCoverImage(undefined); setCover(COVERS[0]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-full gradient-brand text-white shadow-glow hover:opacity-90">
          <Plus className="h-4 w-4" /> New event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Host an event</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cover</Label>
            {coverImage ? (
              <div className="relative h-28 overflow-hidden rounded-xl border border-border">
                <img src={coverImage} alt="Cover preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverImage(undefined)}
                  className="absolute right-2 top-2 rounded-full bg-background/90 p-1.5 text-foreground shadow hover:bg-background"
                  aria-label="Remove cover image"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {COVERS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCover(c)}
                    className={`h-10 w-16 rounded-lg border-2 transition ${
                      cover === c ? "border-primary scale-105" : "border-transparent"
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <ImagePlus className="h-3.5 w-3.5" /> Upload photo
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCoverFile(e.target.files?.[0])}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input id="ev-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Live workshop, meetup..." />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-desc">Description</Label>
            <Textarea id="ev-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ev-date">Date</Label>
              <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ev-time">Time</Label>
              <Input id="ev-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ev-loc">Location</Label>
            <Input id="ev-loc" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Online · Zoom — or a city" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
