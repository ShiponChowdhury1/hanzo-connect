<div align="center">

# 🌐 Hanzo Connect

**A modern, fully-interactive Community Engagement Platform — built frontend-first with persistent local accounts, rich media posts, group chat, events with live countdowns, and beautiful dark/light themes.**

_Project created by **Shahidul Islam**._

[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev/)
[![TanStack Start](https://img.shields.io/badge/TanStack_Start-v1-FF4154)](https://tanstack.com/start)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

---

## ✨ Features

| Area              | Highlights                                                                                  |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Auth**          | Real localStorage-backed sign up / sign in / sign out, forgot-password reset, Google demo  |
| **Profile**       | Upload + auto-resize avatar & cover photo, edit name/username/bio, live stats              |
| **Communities**   | Public & Private privacy, **Join requests + admin approval**, roles (Owner/Admin/Mod/Member)|
| **Posts**         | Photo + video upload, direct inline edit & delete, like, comment, share, **persistent save**|
| **Per-community** | Posts are scoped to their community — feeds never bleed across groups                       |
| **Events**        | Create events with **live d/h/m/s countdown**, RSVP, uniform card sizing                    |
| **Chat**          | Per-community group chat with auto-scroll & message deletion                                |
| **Notifications** | Smooth, **clickable** notifications that expand and route to the related post/community     |
| **Saved**         | Dedicated `/saved` page — bookmark posts, persists across reloads                           |
| **Theming**       | Polished light **and** dark themes via OKLCH design tokens                                  |
| **Branding**      | Custom **Hanzo Connect** SVG logo + official Google "G" on auth buttons                     |

> 💡 No backend, no database, no API calls. Every byte of state lives in the browser via `localStorage` + Zustand.

---

## 🚀 Tech stack

- **Framework**: TanStack Start v1 (React 19 + Vite 7)
- **Styling**: Tailwind CSS v4 with semantic OKLCH design tokens
- **State**: Zustand with `persist` middleware
- **UI**: shadcn/ui + Radix UI + lucide-react icons
- **Image handling**: in-browser canvas resize (`src/lib/imageResize.ts`)

---

## 🧭 Quick start

```bash
bun install
bun dev          # → http://localhost:8080
bun run build
```

### Demo accounts (any password works)

| Email                | Notes                      |
| -------------------- | -------------------------- |
| `alex@hearth.app`    | Designer · multi-community |
| `priya@hearth.app`   | Developer                  |
| `marcus@hearth.app`  | Indie hacker               |

Or just hit **Create account** — your real persisted profile is one click away.

---

## 🗂️ Project structure

```
src/
├── components/         # AppShell, PostCard, EventCard, ChatWindow,
│                       # AvatarUploader, HanzoLogo, GoogleIcon, …
├── lib/
│   ├── mockData.ts     # Seed data + entity types
│   └── imageResize.ts  # Canvas crop & resize for avatars/covers
├── routes/             # File-based routing (TanStack Router)
├── store/useAppStore.ts# Zustand store — single source of truth
└── styles.css          # Tailwind v4 + OKLCH design tokens
```

---

## 🔐 About "real accounts"

Hanzo Connect runs entirely in the browser, so accounts are persisted to your device's `localStorage`:

- Signup creates a real, stored user record (with a pseudo-hashed password).
- Login validates against that record.
- Forgot-password lets a known email set a new password directly.
- The Google button creates a one-click demo session — not real OAuth.

Clear your browser storage to start fresh.

---

## 🙌 Credits

Designed and built by **Shahidul Islam** with the Lovable platform.
# hanzo-connect
