import { Outlet, createRootRoute, HeadContent, Scripts, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";
import { AppShell } from "@/components/AppShell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Hanzo Connect — Where communities thrive" },
      {
        name: "description",
        content: "Join vibrant communities, share posts, photos and videos with people who share your passions.",
      },
      { property: "og:title", content: "Hanzo Connect — Where communities thrive" },
      {
        property: "og:description",
        content: "Join vibrant communities, share posts, photos and videos with people who share your passions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "Hanzo Connect — Where communities thrive" },
      { name: "description", content: "Community Showcase is a frontend-only platform for simulating community engagement features." },
      { property: "og:description", content: "Community Showcase is a frontend-only platform for simulating community engagement features." },
      { name: "twitter:description", content: "Community Showcase is a frontend-only platform for simulating community engagement features." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b46e5855-996b-4f9a-870c-cc415c4dc424/id-preview-46c6a624--a58174d3-9e08-4c24-88f1-d86aa6ace9e4.lovable.app-1776565848760.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b46e5855-996b-4f9a-870c-cc415c4dc424/id-preview-46c6a624--a58174d3-9e08-4c24-88f1-d86aa6ace9e4.lovable.app-1776565848760.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <AppShell />
      <Toaster />
    </>
  );
}
