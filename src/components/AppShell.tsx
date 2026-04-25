/**
 * AppShell — sidebar navigation, mobile top bar, theme toggle, logout.
 * Also enforces the auth guard: unauthenticated users only see auth routes.
 */
import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home,
  Compass,
  Users,
  Bell,
  Search,
  Settings as SettingsIcon,
  User as UserIcon,
  Plus,
  Moon,
  Sun,
  LogOut,
  Menu,
  X,
  Calendar,
  Bookmark,
} from "lucide-react";
import { useAppStore, useCurrentUser } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HanzoLogo } from "@/components/HanzoLogo";

const nav = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/search", label: "Search", icon: Search },
  { to: "/profile", label: "Profile", icon: UserIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
] as const;

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAuthed = useAppStore((s) => s.isAuthed);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const logout = useAppStore((s) => s.logout);
  const user = useCurrentUser();
  const unread = useAppStore((s) => s.notifications.filter((n) => !n.read).length);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Auth guard: redirect protected routes to /login when signed out.
  useEffect(() => {
    const publicRoutes = ["/login", "/signup", "/forgot-password"];
    const isPublic = publicRoutes.some((p) => location.pathname.startsWith(p));
    if (!isAuthed && !isPublic) {
      navigate({ to: "/login" });
    }
  }, [isAuthed, location.pathname, navigate]);

  if (!isAuthed || !user) {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile top bar */}
      <header className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl md:hidden">
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <HanzoLogo className="h-7 w-7" />
          <span className="font-display text-base font-bold">
            Hanzo <span className="text-gradient">Connect</span>
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link to="/" className="flex h-16 items-center gap-2.5 px-6">
          <HanzoLogo className="h-10 w-10" />
          <div className="font-display text-xl font-bold tracking-tight">
            Hanzo <span className="text-gradient">Connect</span>
          </div>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pt-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-[18px] w-[18px]" />
                <span>{item.label}</span>
                {item.label === "Notifications" && unread > 0 && (
                  <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Button
            onClick={() => navigate({ to: "/communities/new" })}
            className="mb-3 w-full gap-2 rounded-xl gradient-brand text-white shadow-glow hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create community
          </Button>
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-3">
              <Avatar className="h-9 w-9 ring-2 ring-primary/30">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">@{user.username}</div>
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-sidebar-accent"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="flex-1 pt-14 md:pt-0">
        <Outlet />
      </main>
    </div>
  );
}
