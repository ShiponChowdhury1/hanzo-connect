/**
 * AvatarUploader — reusable upload / resize / remove control for square
 * profile/community avatars. Wraps `resizeImage` with a fixed 1:1 crop and
 * reasonable size cap so the resulting dataURL stays small enough for
 * localStorage persistence.
 *
 * Project created by Shahidul Islam.
 */
import { useRef } from "react";
import { Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { resizeImage } from "@/lib/imageResize";

type Props = {
  value: string;
  fallback: string;
  /** Called with the resized dataURL after a successful upload. */
  onChange: (next: string) => void;
  /** Optional: invoked when the user clicks Remove. */
  onRemove?: () => void;
  /** Output width/height in pixels (square). */
  size?: number;
  /** Visible avatar size class (Tailwind). */
  className?: string;
};

export function AvatarUploader({
  value,
  fallback,
  onChange,
  onRemove,
  size = 400,
  className = "h-20 w-20",
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFile = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large (max 10MB)");
      return;
    }
    try {
      const dataURL = await resizeImage(file, { maxWidth: size, aspect: 1, quality: 0.88 });
      onChange(dataURL);
      toast.success("Photo updated");
    } catch {
      toast.error("Could not process image");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className={`${className} ring-2 ring-primary/20`}>
          <AvatarImage src={value} alt="Avatar" />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-glow transition hover:opacity-90"
          aria-label="Change photo"
        >
          <Camera className="h-4 w-4" />
        </button>
      </div>
      <div className="flex flex-col gap-1.5">
        <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
          Upload new photo
        </Button>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onRemove();
              toast.success("Photo removed");
            }}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove
          </Button>
        )}
        <p className="text-xs text-muted-foreground">JPG/PNG · auto-resized</p>
      </div>
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
}
