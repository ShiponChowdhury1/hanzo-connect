/**
 * Hanzo Connect — Application Store (Zustand)
 * ----------------------------------------------------------------------------
 * Single source of truth for all client-side state. Persisted to localStorage
 * via `zustand/middleware`.
 *
 * Auth model: 100% frontend. Real-feeling accounts that persist across reloads
 * via the same `localStorage` bucket. Each registered user has their own
 * record in `users[]` (with a stored password). Login validates against it.
 *
 * Project created by Shahidul Islam.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  CURRENT_USER_ID,
  initialChatMessages,
  initialComments,
  initialCommunities,
  initialEvents,
  initialNotifications,
  initialPosts,
  initialUsers,
  type ChatMessage,
  type Comment,
  type Community,
  type CommunityCoverFit,
  type CommunityCoverPosition,
  type CommunityEvent,
  type Notification,
  type Post,
  type Role,
  type User,
} from "@/lib/mockData";

// ---------- Auth result ----------

export type AuthResult = { ok: true } | { ok: false; error: string };

// ---------- State / Actions ----------

type State = {
  /** Currently signed-in user id. Empty string when logged out. */
  currentUserId: string;
  isAuthed: boolean;
  theme: "light" | "dark";
  users: User[];
  communities: Community[];
  posts: Post[];
  comments: Comment[];
  notifications: Notification[];
  events: CommunityEvent[];
  chatMessages: ChatMessage[];
  /** Per-user saved post bookmarks. Keyed by userId → array of postIds. */
  savedPostsByUser: Record<string, string[]>;
};

type Actions = {
  // Auth
  signup: (data: { name: string; email: string; password: string }) => AuthResult;
  loginWithEmail: (email: string, password: string) => AuthResult;
  /** Sign in (or sign up) a demo Google user. Frontend-only convenience. */
  loginWithGoogle: () => AuthResult;
  logout: () => void;
  /** Reset password for a registered email. Returns ok if user exists. */
  resetPassword: (email: string, newPassword: string) => AuthResult;

  // Theme
  toggleTheme: () => void;

  // Profile
  updateProfile: (patch: Partial<Pick<User, "name" | "username" | "bio" | "avatar" | "coverImage">>) => void;

  // Saved posts
  toggleSavePost: (postId: string) => void;
  isPostSaved: (postId: string) => boolean;

  // Community membership
  requestJoin: (id: string) => "joined" | "pending" | "already_member";
  approveJoin: (communityId: string, userId: string) => void;
  rejectJoin: (communityId: string, userId: string) => void;
  leaveCommunity: (id: string) => void;
  setMemberRole: (communityId: string, userId: string, role: Role) => void;

  // Community lifecycle
  createCommunity: (data: {
    name: string;
    description: string;
    icon: string;
    privacy: "public" | "private";
    coverImage?: string;
  }) => string;
  updateCommunityCover: (id: string, coverImage: string | undefined) => void;
  updateCommunityIcon: (id: string, icon: string) => void;
  updateCommunityCoverLayout: (
    id: string,
    patch: Partial<Pick<Community, "coverFit" | "coverPosition">>,
  ) => void;

  // Posts
  createPost: (data: {
    communityId: string;
    content: string;
    image?: string;
    video?: string;
  }) => void;
  sharePost: (id: string) => void;
  editPost: (id: string, patch: { content: string; image?: string; video?: string }) => void;
  deletePost: (id: string) => void;
  toggleLike: (postId: string) => void;

  // Comments
  addComment: (postId: string, content: string) => void;
  editComment: (id: string, content: string) => void;
  deleteComment: (id: string) => void;

  // Notifications
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;

  // Events
  createEvent: (data: Omit<CommunityEvent, "id" | "attendeeIds" | "createdAt" | "hostId">) => void;
  toggleAttendEvent: (eventId: string) => void;
  deleteEvent: (id: string) => void;

  // Chat
  sendChatMessage: (communityId: string, content: string) => void;
  deleteChatMessage: (id: string) => void;
};

// ---------- Utilities ----------

const uid = () => Math.random().toString(36).slice(2, 10);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Pseudo-hash for stored passwords. Frontend-only — NOT real security. */
const hashPw = (pw: string) => {
  let h = 5381;
  for (let i = 0; i < pw.length; i++) h = ((h << 5) + h) ^ pw.charCodeAt(i);
  return `h${(h >>> 0).toString(36)}`;
};

const usernameFromEmail = (email: string) =>
  email
    .split("@")[0]
    ?.replace(/[^a-z0-9]/gi, "")
    .toLowerCase() || `user${uid()}`;

const avatarSeed = (seed: string) =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

// ---------- Store ----------

export const useAppStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      // Initial state — seed with mock data so the app feels alive on first load.
      currentUserId: "",
      isAuthed: false,
      theme: "light",
      users: initialUsers,
      communities: initialCommunities,
      posts: initialPosts,
      comments: initialComments,
      notifications: initialNotifications,
      events: initialEvents,
      chatMessages: initialChatMessages,
      savedPostsByUser: {},

      // ---------- Auth ----------
      signup: ({ name, email, password }) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!name.trim()) return { ok: false, error: "Please enter your name." };
        if (!trimmedEmail.includes("@")) return { ok: false, error: "Enter a valid email." };
        if (password.length < 6)
          return { ok: false, error: "Password must be at least 6 characters." };
        const exists = get().users.some((u) => u.email?.toLowerCase() === trimmedEmail);
        if (exists) return { ok: false, error: "An account with this email already exists." };

        const id = `u_${uid()}`;
        const newUser: User = {
          id,
          name: name.trim(),
          username: usernameFromEmail(trimmedEmail),
          email: trimmedEmail,
          passwordHash: hashPw(password),
          avatar: avatarSeed(trimmedEmail),
          bio: "Hello! I just joined Hanzo Connect ✨",
        };
        set((s) => ({
          users: [...s.users, newUser],
          currentUserId: id,
          isAuthed: true,
        }));
        return { ok: true };
      },

      loginWithEmail: (email, password) => {
        const trimmedEmail = email.trim().toLowerCase();
        const user = get().users.find((u) => u.email?.toLowerCase() === trimmedEmail);
        if (!user) return { ok: false, error: "No account found for that email." };
        // Demo seed users have no passwordHash — accept any password to keep things smooth.
        if (user.passwordHash && user.passwordHash !== hashPw(password)) {
          return { ok: false, error: "Wrong password. Try again." };
        }
        set({ currentUserId: user.id, isAuthed: true });
        return { ok: true };
      },

      loginWithGoogle: () => {
        // Frontend-only demo: create or reuse a Google demo account.
        const email = "demo.google@hanzo.app";
        const existing = get().users.find((u) => u.email === email);
        if (existing) {
          set({ currentUserId: existing.id, isAuthed: true });
          return { ok: true };
        }
        const id = `u_${uid()}`;
        const newUser: User = {
          id,
          name: "Google Demo User",
          username: "googledemo",
          email,
          avatar: avatarSeed("google-demo"),
          bio: "Signed in with Google (demo).",
        };
        set((s) => ({
          users: [...s.users, newUser],
          currentUserId: id,
          isAuthed: true,
        }));
        return { ok: true };
      },

      logout: () => set({ isAuthed: false, currentUserId: "" }),

      resetPassword: (email, newPassword) => {
        const trimmedEmail = email.trim().toLowerCase();
        if (newPassword.length < 6)
          return { ok: false, error: "Password must be at least 6 characters." };
        const idx = get().users.findIndex((u) => u.email?.toLowerCase() === trimmedEmail);
        if (idx === -1) return { ok: false, error: "No account found for that email." };
        set((s) => ({
          users: s.users.map((u, i) =>
            i === idx ? { ...u, passwordHash: hashPw(newPassword) } : u,
          ),
        }));
        return { ok: true };
      },

      // ---------- Theme ----------
      toggleTheme: () => {
        const next = get().theme === "light" ? "dark" : "light";
        set({ theme: next });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", next === "dark");
        }
      },

      // ---------- Profile ----------
      updateProfile: (patch) =>
        set((s) => ({
          users: s.users.map((u) => (u.id === s.currentUserId ? { ...u, ...patch } : u)),
        })),

      // ---------- Saved posts ----------
      toggleSavePost: (postId) =>
        set((s) => {
          const me = s.currentUserId;
          const existing = s.savedPostsByUser[me] ?? [];
          const next = existing.includes(postId)
            ? existing.filter((id) => id !== postId)
            : [postId, ...existing];
          return { savedPostsByUser: { ...s.savedPostsByUser, [me]: next } };
        }),
      isPostSaved: (postId) => {
        const s = get();
        return (s.savedPostsByUser[s.currentUserId] ?? []).includes(postId);
      },

      // ---------- Community membership ----------
      requestJoin: (id) => {
        const state = get();
        const community = state.communities.find((c) => c.id === id);
        if (!community) return "already_member";
        const me = state.currentUserId;
        if (community.memberIds.includes(me)) return "already_member";

        if (community.privacy === "public") {
          set((s) => ({
            communities: s.communities.map((c) =>
              c.id === id
                ? {
                    ...c,
                    memberIds: [...c.memberIds, me],
                    roles: { ...c.roles, [me]: "member" },
                    pendingRequests: c.pendingRequests.filter((u) => u !== me),
                  }
                : c,
            ),
          }));
          return "joined";
        }

        if (community.pendingRequests.includes(me)) return "pending";
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === id ? { ...c, pendingRequests: [...c.pendingRequests, me] } : c,
          ),
        }));
        return "pending";
      },

      approveJoin: (communityId, userId) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === communityId
              ? {
                  ...c,
                  memberIds: c.memberIds.includes(userId) ? c.memberIds : [...c.memberIds, userId],
                  roles: { ...c.roles, [userId]: c.roles[userId] ?? "member" },
                  pendingRequests: c.pendingRequests.filter((u) => u !== userId),
                }
              : c,
          ),
        })),

      rejectJoin: (communityId, userId) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === communityId
              ? { ...c, pendingRequests: c.pendingRequests.filter((u) => u !== userId) }
              : c,
          ),
        })),

      leaveCommunity: (id) =>
        set((s) => ({
          communities: s.communities.map((c) => {
            if (c.id !== id) return c;
            const { [s.currentUserId]: _removed, ...rolesRest } = c.roles;
            return {
              ...c,
              memberIds: c.memberIds.filter((m) => m !== s.currentUserId),
              roles: rolesRest,
            };
          }),
        })),

      setMemberRole: (communityId, userId, role) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === communityId ? { ...c, roles: { ...c.roles, [userId]: role } } : c,
          ),
        })),

      // ---------- Community lifecycle ----------
      createCommunity: ({ name, description, icon, privacy, coverImage }) => {
        const id = uid();
        set((s) => ({
          communities: [
            {
              id,
              name,
              slug: slugify(name) || id,
              description,
              icon: icon || "✨",
              cover: "linear-gradient(135deg, oklch(0.7 0.2 285), oklch(0.65 0.22 320))",
              coverImage,
              coverFit: "cover",
              coverPosition: "center",
              memberIds: [s.currentUserId],
              roles: { [s.currentUserId]: "owner" },
              pendingRequests: [],
              privacy,
              createdAt: Date.now(),
            },
            ...s.communities,
          ],
        }));
        return id;
      },

      updateCommunityCover: (id, coverImage) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === id
              ? {
                  ...c,
                  coverImage,
                  ...(coverImage
                    ? {}
                    : {
                        coverFit: "cover" as CommunityCoverFit,
                        coverPosition: "center" as CommunityCoverPosition,
                      }),
                }
              : c,
          ),
        })),

      updateCommunityIcon: (id, icon) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === id ? { ...c, icon: icon.trim() || "✨" } : c,
          ),
        })),

      updateCommunityCoverLayout: (id, patch) =>
        set((s) => ({
          communities: s.communities.map((c) =>
            c.id === id
              ? {
                  ...c,
                  ...patch,
                }
              : c,
          ),
        })),

      // ---------- Posts ----------
      createPost: ({ communityId, content, image, video }) =>
        set((s) => ({
          posts: [
            {
              id: uid(),
              authorId: s.currentUserId,
              communityId,
              content,
              image,
              video,
              likedBy: [],
              shares: 0,
              createdAt: Date.now(),
            },
            ...s.posts,
          ],
        })),
      sharePost: (id) =>
        set((s) => ({
          posts: s.posts.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)),
        })),
      editPost: (id, patch) =>
        set((s) => ({
          posts: s.posts.map((p) =>
            p.id === id
              ? {
                  ...p,
                  content: patch.content,
                  image: patch.image,
                  video: patch.video,
                }
              : p,
          ),
        })),
      deletePost: (id) =>
        set((s) => ({
          posts: s.posts.filter((p) => p.id !== id),
          comments: s.comments.filter((c) => c.postId !== id),
        })),
      toggleLike: (postId) =>
        set((s) => ({
          posts: s.posts.map((p) => {
            if (p.id !== postId) return p;
            const liked = p.likedBy.includes(s.currentUserId);
            return {
              ...p,
              likedBy: liked
                ? p.likedBy.filter((u) => u !== s.currentUserId)
                : [...p.likedBy, s.currentUserId],
            };
          }),
        })),

      // ---------- Comments ----------
      addComment: (postId, content) =>
        set((s) => ({
          comments: [
            ...s.comments,
            { id: uid(), postId, authorId: s.currentUserId, content, createdAt: Date.now() },
          ],
        })),
      editComment: (id, content) =>
        set((s) => ({ comments: s.comments.map((c) => (c.id === id ? { ...c, content } : c)) })),
      deleteComment: (id) => set((s) => ({ comments: s.comments.filter((c) => c.id !== id) })),

      // ---------- Notifications ----------
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      // ---------- Events ----------
      createEvent: (data) =>
        set((s) => ({
          events: [
            {
              ...data,
              id: uid(),
              hostId: s.currentUserId,
              attendeeIds: [s.currentUserId],
              createdAt: Date.now(),
            },
            ...s.events,
          ],
        })),
      toggleAttendEvent: (eventId) =>
        set((s) => ({
          events: s.events.map((e) => {
            if (e.id !== eventId) return e;
            const going = e.attendeeIds.includes(s.currentUserId);
            return {
              ...e,
              attendeeIds: going
                ? e.attendeeIds.filter((u) => u !== s.currentUserId)
                : [...e.attendeeIds, s.currentUserId],
            };
          }),
        })),
      deleteEvent: (id) => set((s) => ({ events: s.events.filter((e) => e.id !== id) })),

      // ---------- Chat ----------
      sendChatMessage: (communityId, content) =>
        set((s) => ({
          chatMessages: [
            ...s.chatMessages,
            {
              id: uid(),
              communityId,
              authorId: s.currentUserId,
              content,
              createdAt: Date.now(),
            },
          ],
        })),
      deleteChatMessage: (id) =>
        set((s) => ({ chatMessages: s.chatMessages.filter((m) => m.id !== id) })),
    }),
    {
      name: "hanzo-connect",
      version: 3,
      partialize: (s) => ({
        currentUserId: s.currentUserId,
        isAuthed: s.isAuthed,
        theme: s.theme,
        users: s.users,
        communities: s.communities,
        posts: s.posts,
        comments: s.comments,
        notifications: s.notifications,
        events: s.events,
        chatMessages: s.chatMessages,
        savedPostsByUser: s.savedPostsByUser,
      }),
    },
  ),
);

/**
 * Convenience hook to access the currently signed-in user.
 * Returns `undefined` when no one is signed in (e.g. on auth pages).
 */
export const useCurrentUser = () => {
  const userId = useAppStore((s) => s.currentUserId);
  return useAppStore((s) => s.users.find((u) => u.id === userId));
};
