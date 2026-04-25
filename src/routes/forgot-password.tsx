/**
 * Forgot password — frontend-only flow. Lets a user with a known email set
 * a brand-new password directly (no email round-trip since there's no backend).
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HanzoLogo } from "@/components/HanzoLogo";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPage,
  head: () => ({ meta: [{ title: "Reset password — Hanzo Connect" }] }),
});

function ForgotPage() {
  const resetPassword = useAppStore((s) => s.resetPassword);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const r = resetPassword(email, password);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setDone(true);
    toast.success("Password reset successfully");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8 shadow-card">
        <div className="flex justify-center">
          <HanzoLogo className="h-12 w-12" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Reset your password</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email and choose a new password.
          </p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-xl bg-success/10 p-4 text-sm text-success">
              <CheckCircle2 className="h-5 w-5" />
              Password updated. You can now sign in.
            </div>
            <Button onClick={() => navigate({ to: "/login" })} className="w-full">
              Go to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newpw">New password</Label>
              <Input id="newpw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">Confirm new password</Label>
              <Input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={6} required />
            </div>
            <Button type="submit" className="w-full gradient-brand text-white shadow-glow hover:opacity-90">
              Reset password
            </Button>
          </form>
        )}

        <p className="text-center text-sm">
          <Link to="/login" className="text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
