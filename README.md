# Frameloop — Mini Content Approval Engine

A production-ready video approval platform for content agencies. Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Features

- **Auth** — email/password sign up & sign in via Supabase Auth, protected routes via middleware
- **Agency Dashboard** — create, edit, delete content pieces; filter by status; copy shareable client links
- **Client View** — public page (no login needed) for clients to watch the video and approve or reject with feedback
- **Realtime** — dashboard updates instantly when a client approves/rejects via Supabase Realtime
- **Design** — dark, minimal UI with Syne + DM Sans typography, glass effects, and smooth animations

---

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. In **Project Settings → API**, copy your **Project URL** and **anon/public key**

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
```
Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login        # Sign-in page
│   ├── (auth)/signup       # Sign-up page
│   ├── dashboard/          # Agency dashboard (protected)
│   └── client/[id]/        # Public client review page
├── components/
│   ├── Dashboard/          # DashboardClient, ContentCard, Modals, Filters
│   └── Client/             # ClientView, VideoPlayer
├── hooks/
│   ├── useAuth.ts          # Auth state
│   └── useContent.ts       # Content CRUD + Realtime
├── lib/
│   ├── supabase/           # Browser + server clients
│   ├── api/content.ts      # All DB operations
│   └── utils.ts            # Helpers
└── types/index.ts          # Shared TypeScript types
supabase/
└── schema.sql              # Full DB schema + RLS + Realtime
```

---

## How the shareable link works

Each content piece has a `client_token` (UUID) stored in the database. The shareable link is:

```
https://your-domain.com/client/<client_token>
```

The client visits this URL — no login required. They watch the video, then click **Approve** or **Request changes** (with feedback). The status updates in Supabase and the agency dashboard reflects the change in real-time.

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + CSS variables |
| Database | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Video | react-player (YouTube, Vimeo, MP4) |
| Toasts | react-hot-toast |
| Icons | lucide-react |
| Fonts | Syne (display) + DM Sans (body) |
