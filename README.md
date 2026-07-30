# GradConnect Live

A full-stack, real-time graduation celebration platform for Joseph Mugambi's Master's in Data Science and Analytics graduation.

Guests can RSVP, chat in real time, post congratulatory messages, upload photos, and submit service requests — all without creating an account. The host gets a full admin dashboard to manage everything.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 3, custom graduation theme |
| Backend | Supabase — PostgreSQL, Auth, Realtime, Storage |
| Deployment | Netlify via `@netlify/plugin-nextjs` |

---

## Prerequisites

Before you can run this project, install the following on your machine:

### 1. Node.js (v18 or later)
Download and install from [nodejs.org](https://nodejs.org/en/download) — choose the **LTS** version.

Verify the install:
```bash
node --version   # should print v18.x.x or higher
npm --version    # should print 9.x.x or higher
```

### 2. Git
Download from [git-scm.com](https://git-scm.com/downloads) if not already installed.

Verify:
```bash
git --version
```

### 3. A Supabase account
Sign up for free at [supabase.com](https://supabase.com). No credit card required.

---

## Project Structure

```
gradconnect/
├── src/
│   ├── app/
│   │   ├── globals.css         # Tailwind directives + custom graduation styles
│   │   ├── layout.tsx          # Root layout — metadata, Toaster notifications
│   │   └── page.tsx            # Main page — AuthProvider + tab orchestrator
│   │
│   ├── components/
│   │   ├── features/
│   │   │   ├── Header.tsx      # Site header with event details
│   │   │   ├── NavBar.tsx      # Sticky tab navigation bar
│   │   │   ├── HomeTab.tsx     # Guest sign-in, live countdown, event programme
│   │   │   ├── RsvpTab.tsx     # RSVP form — attendance, attendee count, dietary
│   │   │   ├── FeedTab.tsx     # Real-time congratulatory message feed
│   │   │   ├── ChatTab.tsx     # Real-time guest chat with bubble UI
│   │   │   ├── RequestsTab.tsx # Guest service requests with live status
│   │   │   ├── GalleryTab.tsx  # Drag-and-drop photo upload + lightbox gallery
│   │   │   └── AdminTab.tsx    # Host dashboard — stats, RSVPs, requests,
│   │   │                       #   photos, feed moderation, announcements
│   │   └── ui/
│   │       ├── Spinner.tsx     # Loading spinner
│   │       ├── EmptyState.tsx  # Empty list placeholder
│   │       └── StatusBadge.tsx # Coloured status pill (Received / Completed etc.)
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx         # Auth context — anonymous sign-in, profile state
│   │   └── useCountdown.ts     # Live countdown timer to event date
│   │
│   ├── lib/
│   │   └── supabase/
│   │       ├── client.ts       # Browser-side Supabase client
│   │       └── server.ts       # Server-side Supabase client (Server Components)
│   │
│   └── types/
│       └── database.ts         # Full TypeScript types for all DB tables and views
│
├── public/                     # Static assets (favicon, images)
├── middleware.ts               # Supabase session refresh on every request
├── next.config.js              # Next.js config — Supabase image hostname
├── tailwind.config.js          # Tailwind config — navy/gold/cream theme + animations
├── postcss.config.js           # PostCSS config for Tailwind
├── tsconfig.json               # TypeScript config with @/* path alias
├── package.json                # Dependencies and npm scripts
├── netlify.toml                # Netlify build config + security headers
├── supabase-schema.sql         # Complete DB schema — run once in Supabase SQL Editor
├── .env.local.example          # Environment variable template
└── .gitignore
```

---

## First-Time Setup

### Step 1 — Clone the repository
```bash
git clone https://github.com/J-MUGAMBI/Graduation.git
cd Graduation
```

### Step 2 — Install dependencies
```bash
npm install
```
This installs everything listed in `package.json` — Next.js, Supabase, Tailwind, TypeScript, and all other packages.

### Step 3 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Choose a name, database password, and region (pick one close to Kenya, e.g. `eu-west-2`).
3. Wait ~2 minutes for the project to provision.

### Step 4 — Enable Anonymous Sign-Ins

In your Supabase project:
1. Go to **Authentication → Providers**.
2. Find **Anonymous** and toggle it **on**.
3. Click **Save**.

### Step 5 — Run the database schema

1. In Supabase, go to **SQL Editor → New query**.
2. Open `supabase-schema.sql` from this project.
3. Copy the entire contents and paste into the SQL Editor.
4. Click **Run** (or press `Ctrl+Enter`).

This creates all tables, views, Row Level Security policies, the storage bucket, and enables Realtime.

### Step 6 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

Find these values in Supabase under **Project Settings → API**:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Never commit `.env.local` to Git — it is already in `.gitignore`.

---

## Running the App

### Development (local)
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

The dev server supports hot reload — changes to any file are reflected instantly.

### Production build (local test)
```bash
npm run build
npm start
```

### Lint
```bash
npm run lint
```

---

## Making Yourself an Administrator

1. Open the app at `http://localhost:3000`.
2. Enter your name on the **Home** tab to create your profile.
3. In Supabase → **Table Editor → profiles**, find your row.
4. Set the `is_admin` column to `true` and save.
5. Refresh the browser — the **Host** tab will appear in the navigation.

---

## Deployment on Netlify

### Option A — Git (recommended)

1. Push this repository to GitHub or GitLab.
2. Log in to [netlify.com](https://netlify.com) → **Add new site → Import an existing project**.
3. Select your repository. Netlify auto-detects Next.js.
4. Under **Site settings → Environment variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy site**.

Every push to `main` will trigger an automatic redeploy.

### Option B — Manual deploy

```bash
npm run build
```
Then drag the `.next` folder into Netlify's manual deploy area at [app.netlify.com](https://app.netlify.com).

### Custom domain
After deployment, go to **Domain settings** in Netlify and follow the DNS instructions to point your domain to the site.

---

## Features at a Glance

| Tab | Who can use it | What it does |
|---|---|---|
| Home | Everyone | Enter name, view countdown, read programme |
| RSVP | Guests | Confirm attendance, dietary needs, attendee count |
| Live Feed | Guests + Host | Post congratulatory messages; host can publish announcements |
| Chat | Guests | Real-time group chat |
| Requests | Guests + Host | Submit service requests; host updates status live |
| Gallery | Guests + Host | Upload photos with captions; lightbox viewer |
| Host | Admins only | Full dashboard — stats, manage all data, moderate content |

---

## Production Checklist

Before sharing the link publicly:

- [ ] Add invitation-code validation so only invited guests can enter
- [ ] Add a formal privacy notice and consent banner
- [ ] Enable content moderation / reporting
- [ ] Set image retention and auto-deletion rules in Supabase Storage
- [ ] Add rate limiting to prevent spam
- [ ] Set up database backups and uptime monitoring

---

## Event Details

| | |
|---|---|
| Graduate | Joseph Mugambi |
| Degree | Master's in Data Science and Analytics |
| Date | Saturday, 15 August 2026 |
| Time | 2:00 PM EAT |
| Venue | Nairobi Club |
