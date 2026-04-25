/**
 * Sign-in page. Validates credentials against the persisted user store.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HanzoLogo, HanzoWordmark } from "@/components/HanzoLogo";
import { GoogleIcon } from "@/components/GoogleIcon";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — Hanzo Connect" }] }),
});

function LoginPage() {
  const isAuthed = useAppStore((s) => s.isAuthed);
  const loginWithEmail = useAppStore((s) => s.loginWithEmail);
  const loginWithGoogle = useAppStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const [email, setEmail] = useState("alex@hearth.app");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed) navigate({ to: "/" });
  }, [isAuthed, navigate]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = loginWithEmail(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Branded panel */}
      <div className="hidden bg-gradient-to-br from-primary via-primary-glow to-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <HanzoWordmark size="md" />
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Find your people.
            <br />
            Build something together.
          </h1>
          <p className="max-w-md text-primary-foreground/80">
            Hanzo Connect is a vibrant home for the communities you actually care about.
          </p>
        </div>
        <div className="text-sm text-primary-foreground/70">
          © {new Date().getFullYear()} Hanzo Connect · Crafted by Shahidul Islam
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 lg:hidden">
            <HanzoLogo className="h-9 w-9" />
            <span className="font-display text-lg font-bold">
              Hanzo <span className="text-gradient">Connect</span>
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to continue to your communities.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full gap-2.5"
            onClick={() => {
              const r = loginWithGoogle();
              if (r.ok) {
                toast.success("Signed in with Google");
                navigate({ to: "/" });
              }
            }}
          >
            <GoogleIcon /> Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full gradient-brand text-white shadow-glow hover:opacity-90">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            New here?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
