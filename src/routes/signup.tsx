/**
 * Sign-up page. Creates a real persisted account and signs the user in.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HanzoLogo } from "@/components/HanzoLogo";
import { GoogleIcon } from "@/components/GoogleIcon";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
  head: () => ({ meta: [{ title: "Create account — Hanzo Connect" }] }),
});

function SignupPage() {
  const signup = useAppStore((s) => s.signup);
  const loginWithGoogle = useAppStore((s) => s.loginWithGoogle);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = signup({ name, email, password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast.success(`Welcome to Hanzo Connect, ${name.split(" ")[0]}! 🎉`);
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex justify-center">
          <HanzoLogo className="h-14 w-14" />
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Join Hanzo Connect in seconds.</p>
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
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="text-xs text-muted-foreground">At least 6 characters.</p>
          </div>
          <Button type="submit" className="w-full gradient-brand text-white shadow-glow hover:opacity-90">
            Create account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
