import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/search")({
  component: SearchPage,
  head: () => ({ meta: [{ title: "Search — Hanzo Connect" }] }),
});

function SearchPage() {
  const [q, setQ] = useState("");
  const users = useAppStore((s) => s.users);
  const communities = useAppStore((s) => s.communities);

  const term = q.trim().toLowerCase();
  const matchedUsers = term
    ? users.filter(
        (u) => u.name.toLowerCase().includes(term) || u.username.toLowerCase().includes(term)
      )
    : [];
  const matchedCommunities = term
    ? communities.filter(
        (c) => c.name.toLowerCase().includes(term) || c.description.toLowerCase().includes(term)
      )
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-8">
      <h1 className="font-display text-2xl font-bold tracking-tight">Search</h1>
      <p className="mt-1 text-sm text-muted-foreground">Find people and communities.</p>

      <div className="relative mt-5">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, username, or community..."
          className="h-12 rounded-xl pl-10 text-base"
        />
      </div>

      {term && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Communities
            </h2>
            {matchedCommunities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No communities found.</p>
            ) : (
              <div className="space-y-2">
                {matchedCommunities.map((c) => (
                  <Link
                    key={c.id}
                    to="/communities/$slug"
                    params={{ slug: c.slug }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft hover:border-primary/50"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-lg">
                      {c.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="truncate text-xs text-muted-foreground">{c.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              People
            </h2>
            {matchedUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users found.</p>
            ) : (
              <div className="space-y-2">
                {matchedUsers.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-soft"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{u.name}</div>
                      <div className="truncate text-xs text-muted-foreground">@{u.username}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
