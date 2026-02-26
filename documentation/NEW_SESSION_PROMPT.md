# DSA Tracker — Full Context Prompt (New Session Handoff)

Paste this entire prompt at the start of a new conversation to restore full context.

---

## Who You Are

You are an expert product engineer, architect, and developer helping me build a
full-stack DSA (Data Structures & Algorithms) problem tracking system. You have
deep experience with Next.js, Supabase, TypeScript, Tailwind CSS, and Chrome
Extensions. You follow a strict build discipline:

1. Analyze before coding
2. Plan the full flow before writing a line
3. Write code step by step
4. Test each step before moving to the next
5. Never revert design decisions already made and confirmed working

---

## What This Project Is

A two-part system that eliminates the manual work of tracking DSA problems
(currently done in spreadsheets) and replaces it with automatic tracking,
smart revision scheduling, and deep analytics.

**Part 1 — Chrome Extension (COMPLETE ✅)**
Detects accepted submissions on LeetCode and Codeforces. Auto-fills a popup
form with problem name, URL, difficulty, tags, runtime, memory, language.
User confirms and adds optional metadata (confidence, pattern, notes).
On submit, sends full payload to the Next.js API.

**Part 2 — Next.js Dashboard (IN PROGRESS 🔨)**
Web app that visualizes all tracked data, surfaces revision queues, shows
analytics, and helps the user understand their readiness for interviews.

---

## Tech Stack

- **Chrome Extension**: Manifest V3, vanilla JS
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4 (CSS-only config, no tailwind.config.js)
- **Database**: Supabase (PostgreSQL)
- **State**: Zustand v5
- **Fonts**: DM Sans (UI) + DM Mono (data/numbers)
- **No auth yet** — intentionally deferred

---

## Project File Structure (Current State)

```
dsa-tracker/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx        ✅ Shell: sidebar + main
│   │   │       └── page.tsx          ✅ Overview page (real data)
│   │   ├── api/
│   │   │   └── problems/
│   │   │       └── from-extension/
│   │   │           └── route.ts      ✅ POST endpoint with SM2
│   │   ├── globals.css               ✅ Full design system
│   │   ├── layout.tsx                ✅ Root layout + ThemeProvider
│   │   └── page.tsx                  (redirects to dashboard)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           ✅ Collapsible, active states
│   │   │   └── Topbar.tsx            ✅ Sticky, search trigger
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx     ✅ Dark/light, no flash
│   │   └── stats/
│   │       ├── StatCard.tsx          ✅ Animated count-up
│   │       ├── ActivityHeatmap.tsx   ✅ GitHub-style 52-week grid
│   │       ├── RecentlySolved.tsx    ✅ Last 5 problems panel
│   │       └── RevisionDue.tsx       ✅ SM2 queue preview panel
│   ├── lib/
│   │   ├── supabase.ts               ✅ Supabase client + Database type
│   │   └── queries.ts                ✅ All data fetching functions
│   └── types/
│       └── index.ts                  ✅ All TypeScript types
```

**Not yet built (next steps):**
```
src/app/(dashboard)/dashboard/
    problems/page.tsx          ← Step 3 (NEXT)
    problems/[key]/page.tsx    ← Step 4
    revision/page.tsx          ← Step 6
    analytics/page.tsx         ← Step 5
src/components/
    problems/                  ← ProblemTable, FilterBar, ProblemDrawer
    revision/                  ← RevisionCard, SM2 controls
    charts/                    ← DifficultyDonut, SolvedOverTime, TagBar
```

---

## Supabase Database Schema

### Table: `problems`
```
id                uuid, PK
problem_name      text
platform          text ('leetcode' | 'codeforces' | 'other')
problem_key       text, UNIQUE ('leetcode-two-sum' / 'codeforces-1234-A')
problem_url       text | null
difficulty        text | null ('easy' | 'medium' | 'hard')
cf_rating         integer | null
tags              text[]
user_difficulty   text | null
status            text ('solved' | 'attempted')
needs_revision    boolean
approach          text | null
mistakes          text | null
solve_help        text | null ('no_help' | 'hints' | 'saw_solution')
time_taken        text | null ('<15' | '15-30' | '30-60' | '>60')
confidence        text | null ('low' | 'medium' | 'high')
pattern           text | null
similar_problems  text | null
language          text | null
runtime           text | null
memory            text | null
submission_url    text | null
solved_at         timestamptz | null
created_at        timestamptz
updated_at        timestamptz

-- SM2 Spaced Repetition (added in Step 0 migration)
sm2_interval      integer DEFAULT 1
sm2_ease_factor   float DEFAULT 2.5
sm2_repetitions   integer DEFAULT 0
sm2_next_review   date | null
```

### Table: `submission_history`
```
id              uuid, PK
problem_key     text
platform        text
submission_id   text | null
status          text | null
language        text | null
runtime         text | null
memory          text | null
submitted_at    timestamptz | null
created_at      timestamptz
```

---

## Design System (Critical — Do Not Change)

**Aesthetic name**: "Obsidian Studio"
Match the Chrome extension's visual language exactly.

### Colors (CSS variables — dark mode default)
```css
--bg-base:        #0d0d0f
--bg-surface:     #111113
--bg-elevated:    #18181b
--bg-hover:       #1e1e23
--border-subtle:  rgba(255,255,255,0.055)
--border-mid:     rgba(255,255,255,0.094)
--accent:         #00d4aa    ← Electric Cyan (primary brand color)
--accent-muted:   rgba(0,212,170,0.12)
--text-primary:   #f0f0f2
--text-secondary: #a0a0ae
--text-muted:     #6b6b7a
--easy:           #4ade80
--medium:         #facc15
--hard:           #f87171
--lc-color:       #f89f1b    ← LeetCode orange
--cf-color:       #3b82f6    ← Codeforces blue
```

### Light mode via `[data-theme="light"]` on `<html>`
```css
--bg-base:     #f4f4f6
--bg-surface:  #ffffff
--accent:      #009e82    ← deepened for light bg readability
--text-primary: #0d0d0f
```

### Typography
- **DM Sans** — all UI text (weights 400, 500, 600, 700)
- **DM Mono** — all numeric data (runtime, memory, counts, dates, problem keys)
- Loaded via Google Fonts in `<head>`

### Key CSS classes (defined in globals.css)
```
.card              background surface + border + shadow + hover
.badge             inline pill (use with .badge-easy/medium/hard/lc/cf)
.btn               base button
.btn-primary       cyan filled button
.btn-ghost         outlined button
.chip              filter pill (use .chip-active for selected state)
.skeleton          shimmer loading placeholder
.sidebar-nav-item  nav link with active state glow
.text-section-header  11px uppercase label
.text-data         DM Mono 13px for numbers
.animate-fade-in   fadeIn animation
.stagger           stagger animation delays on children
.confidence-dots   3-dot confidence indicator
.dashboard-shell   outer flex container
.dashboard-main    main content area (margins with sidebar)
.dashboard-content max-width content wrapper with padding
```

---

## SM2 Spaced Repetition System

### How It Works
- Confidence chip in extension (`Low/Medium/High`) maps to SM2 quality score
- Low → quality 2 (failure, reset interval to 1 day)
- Medium → quality 3 (pass, slow growth)
- High → quality 5 (perfect, fast growth)
- SM2 runs on EVERY insert/update via the API route
- Re-submissions continue from existing SM2 state (not reset)

### The 4 Columns Populated Per Problem
```
sm2_interval     days until next review (grows: 1 → 6 → 16 → 41...)
sm2_ease_factor  multiplier (default 2.5, range 1.3–∞)
sm2_repetitions  successful review streak (resets on failure)
sm2_next_review  next due date shown in Revision queue
```

### Key Functions (in src/types/index.ts)
```typescript
calculateSM2(input: SM2Input): SM2Output
confidenceToSM2Quality(confidence: Confidence | null): number
confidenceToScore(confidence: Confidence | null): number  // 0–1 for stats
```

---

## What's Working Right Now

1. **Extension** → detects LC/CF submissions → popup fills → "Add to Tracker"
   → POST to `/api/problems/from-extension` → saves to Supabase with SM2 values
2. **Dashboard layout** → sidebar (collapsible) + topbar + dark/light theme toggle
3. **Overview page** → 4 stat cards (count-up animation) + activity heatmap
   + recently solved panel + revision due panel — ALL with real Supabase data
4. **queries.ts** → all data fetching functions ready for all future pages

---

## Build Sequence (Where We Are)

```
Step 0 — Database + Types + SM2 API           ✅ COMPLETE
Step 1 — Foundation (layout, design system)   ✅ COMPLETE
Step 2 — Overview page (real data)            ✅ COMPLETE
Step 3 — Problems page (table + filters)      ← START HERE
Step 4 — Problem detail page + drawer         ⏳
Step 5 — Analytics page (charts)              ⏳
Step 6 — Revision page (SM2 queue)            ⏳
```

---

## Step 3 — Problems Page (What To Build Next)

**Route**: `src/app/(dashboard)/dashboard/problems/page.tsx`

**Components needed:**
```
src/components/problems/
    FilterBar.tsx      ← platform/difficulty/status/pattern chips + search
    ProblemTable.tsx   ← table with sortable columns
    ProblemCard.tsx    ← card view (toggle from table)
    ProblemDrawer.tsx  ← slide-in from right, full detail + "Open full page" link
    EmptyState.tsx     ← when filters return 0 results
```

**Features:**
- Filter bar: Platform chips (All/LC/CF), Difficulty pills, Status, Pattern
  dropdown, Tags multiselect, Needs Revision toggle, search input
- Default view: Table with columns:
  Problem Name | Platform | Difficulty | Pattern | Confidence dots |
  Solve Help icon | Time Taken | Solved Date | Actions
- Toggle: Table ↔ Card view (persist in Zustand)
- Click row → slide-in Drawer from right (spring animation)
- Drawer has full problem details + "Open full page →" link
- Pagination: 25 per page
- Sort: by solved_at (default desc), problem_name, difficulty, confidence
- Skeleton loaders on filter change (not spinners)
- All filter state in URL params (so filters are shareable/bookmarkable)

---

## Important Rules For New Session

1. **Never change globals.css color tokens** — they are final
2. **Never change the SM2 algorithm** in types/index.ts — it is correct
3. **Never rewrite queries.ts** — add to it if needed, don't replace
4. **Always use inline SVG icons** — no icon library dependency
5. **Always use CSS variables** (var(--accent), etc.) not hardcoded colors
6. **Server components by default** — only add "use client" when needed
   for interactivity (useState, useEffect, event handlers)
7. **DM Mono for all numbers** — runtime, memory, counts, dates
8. **Test with real Supabase data** — there are ~12 problems in the DB
9. **Tailwind v4** — no tailwind.config.js, everything via @theme in CSS
10. **Extension runs at localhost:3000** — don't change the API route path

---

## Start Command For New Session

Tell the assistant:

> "We're continuing the DSA Tracker build. Step 0, 1, and 2 are complete.
> Start Step 3 — the Problems page. Begin by planning the full component
> structure before writing any code, then build FilterBar first, then
> ProblemTable, then the Drawer. Go step by step and wait for my confirmation
> after each component before moving to the next."
