/**
 * Settings — profile editing (avatar upload/remove/resize, name, username, bio)
 * with a real Save action, plus theme toggle and a sign-out shortcut.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAppStore, useCurrentUser } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AvatarUploader } from "@/components/AvatarUploader";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — Hanzo Connect" }] }),
});

function SettingsPage() {
  const user = useCurrentUser();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const logout = useAppStore((s) => s.logout);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const fallbackAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name can't be empty");
      return;
    }
    setSaving(true);
    updateProfile({
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "") || user.username,
      bio: bio.trim(),
      avatar,
    });
    setTimeout(() => {
      setSaving(false);
      toast.success("Profile saved ✨");
    }, 250);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences.</p>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-bold">Profile</h2>
        <form onSubmit={handleSave} className="space-y-5">
          <AvatarUploader
            value={avatar}
            fallback={(name[0] ?? "U").toUpperCase()}
            onChange={setAvatar}
            onRemove={() => setAvatar(fallbackAvatar)}
            className="h-24 w-24"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Display name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={bio}
              maxLength={160}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a bit about yourself…"
            />
            <p className="text-right text-xs text-muted-foreground">{bio.length}/160</p>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gradient-brand text-white shadow-glow hover:opacity-90">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-4 font-display text-lg font-bold">Appearance</h2>
        <div className="flex items-center justify-between rounded-xl bg-muted p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            <div>
              <div className="text-sm font-semibold">Dark mode</div>
              <div className="text-xs text-muted-foreground">
                Easier on the eyes in low light.
              </div>
            </div>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-soft">
        <h2 className="mb-3 font-display text-lg font-bold">Account</h2>
        <Button
          variant="outline"
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            logout();
            toast.success("Signed out");
            navigate({ to: "/login" });
          }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </section>
    </div>
  );
}
