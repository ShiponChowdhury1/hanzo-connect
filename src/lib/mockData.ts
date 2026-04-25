/**
 * Hanzo Connect — Mock Data
 * ----------------------------------------------------------------------------
 * Frontend-only seed data. All entities live in Zustand state (see
 * `src/store/useAppStore.ts`).
 *
 * Project created by Shahidul Islam.
 */

// ---------- Core entities ----------

export type User = {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  coverImage?: string;
  /** Email address (used as login). Optional for legacy seed users. */
  email?: string;
  /** Pseudo-hashed password. Optional for legacy seed users. */
  passwordHash?: string;
};

export type Role = "owner" | "admin" | "moderator" | "member";

export type Membership = {
  userId: string;
  role: Role;
  joinedAt: number;
};

export type CommunityCoverFit = "cover" | "contain";
export type CommunityCoverPosition = "top" | "center" | "bottom";

export type Community = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  cover: string;
  coverImage?: string;
  coverFit?: CommunityCoverFit;
  coverPosition?: CommunityCoverPosition;
  memberIds: string[];
  roles: Record<string, Role>;
  pendingRequests: string[];
  privacy: "public" | "private";
  createdAt: number;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: number;
};

export type Post = {
  id: string;
  authorId: string;
  communityId: string;
  content: string;
  image?: string;
  video?: string;
  likedBy: string[];
  shares: number;
  createdAt: number;
};

export type Notification = {
  id: string;
  type: "like" | "comment" | "invite" | "join_request" | "approved" | "event";
  actorId: string;
  postId?: string;
  communityId?: string;
  message: string;
  createdAt: number;
  read: boolean;
};

export type CommunityEvent = {
  id: string;
  communityId: string;
  title: string;
  description: string;
  startsAt: number;
  location: string;
  cover: string;
  hostId: string;
  attendeeIds: string[];
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  communityId: string;
  authorId: string;
  content: string;
  createdAt: number;
};

// ---------- Helpers ----------

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

/**
 * Default seed user id. Used only as a fallback before any account is created.
 * The active session id lives in `useAppStore.currentUserId`.
 */
export const CURRENT_USER_ID = "u1";

const now = Date.now();
const minutes = (n: number) => now - n * 60_000;
const days = (n: number) => now + n * 24 * 60 * 60_000;

// ---------- Seeded users ----------
// Demo accounts (no passwordHash) — login accepts any password for these,
// so reviewers can quickly sign in as e.g. alex@hearth.app.

export const initialUsers: User[] = [
  {
    id: "u1",
    name: "Alex Morgan",
    username: "alexm",
    email: "alex@hearth.app",
    avatar: avatar("alex"),
    bio: "Designer & community builder. Coffee enthusiast.",
  },
  {
    id: "u2",
    name: "Priya Patel",
    username: "priya",
    email: "priya@hearth.app",
    avatar: avatar("priya"),
    bio: "Frontend dev. Love clean UI.",
  },
  {
    id: "u3",
    name: "Marcus Lee",
    username: "marcus",
    email: "marcus@hearth.app",
    avatar: avatar("marcus"),
    bio: "Indie hacker shipping weekly.",
  },
  {
    id: "u4",
    name: "Sofia Reyes",
    username: "sofia",
    email: "sofia@hearth.app",
    avatar: avatar("sofia"),
    bio: "Writer. Curating thoughtful reads.",
  },
  {
    id: "u5",
    name: "Kenji Tanaka",
    username: "kenji",
    email: "kenji@hearth.app",
    avatar: avatar("kenji"),
    bio: "Photographer based in Tokyo.",
  },
  {
    id: "u6",
    name: "Nora Adebayo",
    username: "nora",
    email: "nora@hearth.app",
    avatar: avatar("nora"),
    bio: "Product manager & runner.",
  },
];

const mkRoles = (entries: Array<[string, Role]>): Record<string, Role> =>
  Object.fromEntries(entries);

export const initialCommunities: Community[] = [
  {
    id: "c1",
    name: "Design Systems",
    slug: "design-systems",
    description: "A space for designers and engineers building scalable design systems.",
    icon: "🎨",
    cover: "linear-gradient(135deg, oklch(0.7 0.22 285), oklch(0.65 0.22 320))",
    memberIds: ["u1", "u2", "u4"],
    roles: mkRoles([
      ["u1", "owner"],
      ["u2", "moderator"],
      ["u4", "member"],
    ]),
    pendingRequests: [],
    privacy: "public",
    createdAt: minutes(60 * 24 * 30),
  },
  {
    id: "c2",
    name: "Indie Hackers",
    slug: "indie-hackers",
    description: "Share your journey shipping side projects and SaaS.",
    icon: "🚀",
    cover: "linear-gradient(135deg, oklch(0.7 0.18 220), oklch(0.65 0.22 280))",
    memberIds: ["u1", "u3", "u6"],
    roles: mkRoles([
      ["u3", "owner"],
      ["u1", "admin"],
      ["u6", "member"],
    ]),
    pendingRequests: [],
    privacy: "public",
    createdAt: minutes(60 * 24 * 22),
  },
  {
    id: "c3",
    name: "Photography",
    slug: "photography",
    description: "Show your shots, get feedback, talk gear.",
    icon: "📸",
    cover: "linear-gradient(135deg, oklch(0.7 0.2 30), oklch(0.62 0.22 350))",
    memberIds: ["u5", "u4"],
    roles: mkRoles([
      ["u5", "owner"],
      ["u4", "member"],
    ]),
    pendingRequests: [],
    privacy: "private",
    createdAt: minutes(60 * 24 * 18),
  },
  {
    id: "c4",
    name: "Bookworms",
    slug: "bookworms",
    description: "Book recommendations, reviews, and reading challenges.",
    icon: "📚",
    cover: "linear-gradient(135deg, oklch(0.68 0.18 160), oklch(0.62 0.2 200))",
    memberIds: ["u4", "u2", "u1"],
    roles: mkRoles([
      ["u4", "owner"],
      ["u2", "moderator"],
      ["u1", "member"],
    ]),
    pendingRequests: ["u3"],
    privacy: "private",
    createdAt: minutes(60 * 24 * 10),
  },
];

export const initialPosts: Post[] = [
  {
    id: "p1",
    authorId: "u2",
    communityId: "c1",
    content:
      "Just shipped a token refactor in our design system — 40% fewer color variables and way more consistent. Anyone else doing semantic-only token migrations?",
    likedBy: ["u1", "u4"],
    shares: 3,
    createdAt: minutes(12),
  },
  {
    id: "p2",
    authorId: "u3",
    communityId: "c2",
    content:
      "Hit $1k MRR this month on my niche tool 🎉 Slow but real. Happy to share what worked.",
    likedBy: ["u1", "u6", "u2"],
    shares: 7,
    createdAt: minutes(48),
  },
  {
    id: "p3",
    authorId: "u5",
    communityId: "c3",
    content: "Foggy morning in Shinjuku. Shot on a 35mm prime, no edit.",
    image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&q=80",
    likedBy: ["u4", "u1"],
    shares: 2,
    createdAt: minutes(120),
  },
  {
    id: "p4",
    authorId: "u4",
    communityId: "c4",
    content:
      "Finished 'Project Hail Mary'. Surprisingly emotional for a hard sci-fi. What should I read next?",
    likedBy: ["u2"],
    shares: 0,
    createdAt: minutes(240),
  },
  {
    id: "p5",
    authorId: "u6",
    communityId: "c2",
    content:
      "PMs: how do you balance roadmap commitments with discovery work? Always feels like a tug of war.",
    likedBy: ["u3"],
    shares: 1,
    createdAt: minutes(360),
  },
  {
    id: "p6",
    authorId: "u5",
    communityId: "c3",
    content: "Caught this short clip walking home tonight 🌃",
    video: "https://cdn.pixabay.com/video/2020/05/25/40130-424830797_tiny.mp4",
    likedBy: ["u1", "u4"],
    shares: 4,
    createdAt: minutes(420),
  },
];

export const initialComments: Comment[] = [
  {
    id: "cm1",
    postId: "p1",
    authorId: "u1",
    content: "Love this. We did the same and onboarding new devs got way easier.",
    createdAt: minutes(8),
  },
  {
    id: "cm2",
    postId: "p2",
    authorId: "u1",
    content: "Congrats! Would love a write-up.",
    createdAt: minutes(40),
  },
  { id: "cm3", postId: "p3", authorId: "u4", content: "Beautiful tones.", createdAt: minutes(100) },
];

export const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    actorId: "u2",
    postId: "p1",
    message: "liked your post",
    createdAt: minutes(5),
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    actorId: "u4",
    postId: "p3",
    message: "commented on a post you follow",
    createdAt: minutes(60),
    read: false,
  },
  {
    id: "n3",
    type: "invite",
    actorId: "u5",
    communityId: "c3",
    message: "invited you to join Photography",
    createdAt: minutes(180),
    read: true,
  },
  {
    id: "n4",
    type: "join_request",
    actorId: "u3",
    communityId: "c4",
    message: "requested to join Bookworms",
    createdAt: minutes(220),
    read: false,
  },
];

export const initialEvents: CommunityEvent[] = [
  {
    id: "e1",
    communityId: "c1",
    title: "Design Tokens Live Workshop",
    description:
      "A 90-minute live walkthrough on migrating to semantic tokens. Bring your existing palette.",
    startsAt: days(2),
    location: "Online · Zoom",
    cover: "linear-gradient(135deg, oklch(0.68 0.22 285), oklch(0.7 0.2 320))",
    hostId: "u1",
    attendeeIds: ["u1", "u2"],
    createdAt: minutes(60 * 24),
  },
  {
    id: "e2",
    communityId: "c2",
    title: "Indie Founders Coffee",
    description: "Casual virtual meetup. Share what you shipped this week.",
    startsAt: days(5),
    location: "Online · Google Meet",
    cover: "linear-gradient(135deg, oklch(0.72 0.18 220), oklch(0.66 0.22 280))",
    hostId: "u3",
    attendeeIds: ["u3", "u1", "u6"],
    createdAt: minutes(60 * 12),
  },
  {
    id: "e3",
    communityId: "c3",
    title: "Golden Hour Photo Walk",
    description: "Meet at Yoyogi Park for a 2-hour walk. All cameras welcome — phones too.",
    startsAt: days(10),
    location: "Yoyogi Park, Tokyo",
    cover: "linear-gradient(135deg, oklch(0.72 0.2 30), oklch(0.62 0.22 350))",
    hostId: "u5",
    attendeeIds: ["u5", "u4"],
    createdAt: minutes(60 * 6),
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: "m1",
    communityId: "c1",
    authorId: "u2",
    content: "Hey team — pushed the new color tokens to the staging branch.",
    createdAt: minutes(45),
  },
  {
    id: "m2",
    communityId: "c1",
    authorId: "u1",
    content: "Nice! Reviewing now 🙌",
    createdAt: minutes(40),
  },
  {
    id: "m3",
    communityId: "c1",
    authorId: "u4",
    content: "The contrast looks much better in dark mode 👀",
    createdAt: minutes(30),
  },
  {
    id: "m4",
    communityId: "c2",
    authorId: "u3",
    content: "Anyone going to the indie founders coffee next week?",
    createdAt: minutes(25),
  },
  {
    id: "m5",
    communityId: "c2",
    authorId: "u6",
    content: "I'll be there!",
    createdAt: minutes(20),
  },
];
