# DSA Tracker — Build Documentation

**Version**: 0.3.0 (Step 2 Complete)
**Last Updated**: February 2026
**Status**: Active Development

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Chrome Extension](#3-chrome-extension)
4. [Next.js Dashboard](#4-nextjs-dashboard)
5. [Database Schema](#5-database-schema)
6. [SM2 Spaced Repetition](#6-sm2-spaced-repetition)
7. [Design System](#7-design-system)
8. [API Reference](#8-api-reference)
9. [Data Flow](#9-data-flow)
10. [Build Progress](#10-build-progress)
11. [Roadmap](#11-roadmap)

---

## 1. Project Overview

### Problem Being Solved

DSA learners preparing for technical interviews manually track solved problems
in spreadsheets — logging problem names, difficulty, approach notes, and
revision status by hand. This wastes 5–10 minutes per problem and produces
data that's hard to analyze or act on.

### Solution

A two-part system:

**Part 1 — Chrome Extension**: Auto-detects accepted submissions on LeetCode
and Codeforces. Immediately surfaces a pre-filled form with all auto-captured
metadata. User spends 30 seconds confirming details and adding reflective notes
(approach, mistakes, confidence), then submits. Zero manual data entry.

**Part 2 — Web Dashboard**: Visualizes all tracked data. Shows real progress
metrics, surfaces a smart revision queue (SM2 spaced repetition), identifies
weak areas by tag and pattern, and provides an "Interview Readiness Score" — a
single number summarizing preparation quality.

### Target Users

DSA learners, CS students, and software engineers preparing for technical
interviews at any company. Particularly useful for anyone solving 3+ problems
per week.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                           │
│                                                             │
│  ┌─────────────────┐         ┌──────────────────────────┐  │
│  │ Chrome Extension│         │   Next.js Dashboard      │  │
│  │                 │         │   localhost:3000          │  │
│  │ • Detects AC    │  POST   │                          │  │
│  │   submissions   │────────▶│  /api/problems/          │  │
│  │ • Fills popup   │         │    from-extension        │  │
│  │ • User confirms │         │                          │  │
│  └─────────────────┘         │  Dashboard pages:        │  │
│                               │  /dashboard              │  │
│                               │  /dashboard/problems     │  │
│                               │  /dashboard/revision     │  │
│                               │  /dashboard/analytics    │  │
│                               └──────────┬───────────────┘  │
└──────────────────────────────────────────│──────────────────┘
                                           │ Supabase JS Client
                                           ▼
                              ┌────────────────────────┐
                              │      Supabase           │
                              │   (PostgreSQL)          │
                              │                         │
                              │  • problems table       │
                              │  • submission_history   │
                              └────────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Extension | Manifest V3, Vanilla JS | — |
| Frontend | Next.js App Router | 16.1.6 |
| UI Framework | React | 19.2.3 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | v4 |
| Database | Supabase (PostgreSQL) | ^2.97.0 |
| State Management | Zustand | ^5.0.11 |
| HTTP Client | Axios | ^1.13.5 |
| Utilities | clsx | ^2.1.1 |

### Key Design Decisions

**No auth (intentionally deferred)**: The app is single-user for now.
Auth will be added later via Supabase Auth + RLS policies + user_id columns.

**Server Components by default**: Overview page fetches data server-side via
React Server Components. No client-side loading states for initial page load.
`"use client"` only added where interactivity is required.

**CSS-only design tokens**: Tailwind v4 uses `@theme inline` in CSS — no
`tailwind.config.js` file. All color tokens are CSS custom properties
(`var(--accent)`, `var(--bg-surface)`, etc.) enabling instant dark/light
switching without JS re-renders.

**SM2 in the API layer**: Spaced repetition is calculated server-side on every
insert/update. The client never needs to know about SM2 internals — it just
reads `sm2_next_review` to show the revision queue.

---

## 3. Chrome Extension

### File Structure

```
extension/
├── manifest.json
├── background.js              ← Service worker
├── background/
│   ├── engine.js              ← TrackingEngine class
│   └── adapters/
│       ├── leetcode.js        ← LC adapter (GraphQL normalization)
│       └── codeforces.js      ← CF adapter (poll + DOM normalize)
├── contentScript.js           ← Injected on LC + CF pages
├── leetcodeHook_IMPROVED.js   ← Intercepts fetch on LC pages
├── popup.html
├── popup.js
└── popup.css
```

### Detection Flow

**LeetCode:**
1. `leetcodeHook_IMPROVED.js` intercepts the fetch to LC's GraphQL endpoint
2. Detects `submissionDetails` query with `statusDisplay: "Accepted"`
3. Captures: problem name, titleSlug, difficulty, tags, runtime, memory, language
4. Stores in `chrome.storage.local`
5. Popup reads from storage on `DOMContentLoaded` (race condition fixed)

**Codeforces:**
1. `contentScript.js` polls the submission table every 2 seconds
2. Detects "Accepted" verdict in the DOM
3. For standard contests: fetches difficulty + tags from CF API
4. For group contests: difficulty/tags unavailable (yellow warning shown)
5. Captures: problem name, URL, language, runtime, memory

### Popup UI

- **Aesthetic**: Obsidian dark (#0d0d0f) + Electric Cyan (#00d4aa)
- **Fonts**: DM Sans + DM Mono
- **Size**: 420px × 580px fixed
- **Acceptance banner**: problem name + platform badge + difficulty pill
- **Form sections**: Problem Info, How Did It Go (status/confidence/help/time),
  Problem Pattern chips, Notes (collapsed by default)
- **Submit bar**: runtime/memory/language meta + "Add to Tracker →" button

### Data Sent to API

```typescript
{
  problem_name, platform, problem_key, status,
  problem_url, difficulty, cf_rating, tags,
  language, runtime, memory, submission_id, submission_url, solved_at,
  user_difficulty, needs_revision, approach, mistakes,
  solve_help, time_taken, confidence, pattern, similar_problems
}
```

---

## 4. Next.js Dashboard

### Route Structure

```
src/app/
├── layout.tsx                    Root layout (ThemeProvider, fonts)
├── page.tsx                      Redirects to /dashboard
└── (dashboard)/
    └── dashboard/
        ├── layout.tsx            Shell: Sidebar + main content area
        ├── page.tsx              Overview page ✅
        ├── problems/
        │   ├── page.tsx          Problems list 🔨
        │   └── [key]/
        │       └── page.tsx      Problem detail ⏳
        ├── revision/
        │   └── page.tsx          Revision queue ⏳
        └── analytics/
            └── page.tsx          Charts & analytics ⏳
```

### Component Architecture

```
src/components/
├── layout/
│   ├── Sidebar.tsx         Collapsible nav, theme toggle, revision badge
│   └── Topbar.tsx          Sticky header, search trigger (⌘K)
├── providers/
│   └── ThemeProvider.tsx   Dark/light context, localStorage persistence
├── stats/
│   ├── StatCard.tsx        Animated count-up stat card
│   ├── ActivityHeatmap.tsx 52-week GitHub-style grid
│   ├── RecentlySolved.tsx  Last 5 problems panel
│   └── RevisionDue.tsx     SM2 due queue preview
├── problems/               (Step 3 — not yet built)
│   ├── FilterBar.tsx
│   ├── ProblemTable.tsx
│   ├── ProblemCard.tsx
│   └── ProblemDrawer.tsx
├── charts/                 (Step 5 — not yet built)
│   ├── DifficultyDonut.tsx
│   ├── SolvedOverTime.tsx
│   └── TagConfidenceBar.tsx
└── revision/               (Step 6 — not yet built)
    └── RevisionCard.tsx
```

### Data Layer

All Supabase queries are in `src/lib/queries.ts`:

| Function | Returns | Used On |
|---|---|---|
| `getDashboardStats()` | `ProblemStats` | Overview |
| `getProblems(filters, page, size)` | `{problems, total}` | Problems |
| `getProblemByKey(key)` | `Problem \| null` | Detail page |
| `getRevisionDue()` | `Problem[]` | Overview + Revision |
| `getRevisionList()` | `Problem[]` | Revision |
| `getRecentProblems(limit)` | `Problem[]` | Overview |
| `getSubmissionHistory(key)` | `SubmissionHistory[]` | Detail page |
| `updateSM2AfterRevision(...)` | `void` | Revision |
| `updateProblem(key, updates)` | `Problem` | Detail page |

---

## 5. Database Schema

### `problems` Table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, auto-generated |
| `problem_name` | text | e.g. "Two Sum" |
| `platform` | text | 'leetcode' \| 'codeforces' \| 'other' |
| `problem_key` | text | Unique: 'leetcode-two-sum', 'codeforces-1234-A' |
| `problem_url` | text? | Direct link to problem |
| `difficulty` | text? | Platform-reported: 'easy' \| 'medium' \| 'hard' |
| `cf_rating` | int? | Codeforces numeric rating (mapped to difficulty) |
| `tags` | text[] | Platform tags e.g. ['Array', 'Hash Map'] |
| `user_difficulty` | text? | User's own assessment |
| `status` | text | 'solved' \| 'attempted' |
| `needs_revision` | boolean | Flagged for review |
| `approach` | text? | User's solution notes |
| `mistakes` | text? | What went wrong |
| `solve_help` | text? | 'no_help' \| 'hints' \| 'saw_solution' |
| `time_taken` | text? | '<15' \| '15-30' \| '30-60' \| '>60' |
| `confidence` | text? | 'low' \| 'medium' \| 'high' |
| `pattern` | text? | e.g. 'Sliding Window', 'DP' |
| `similar_problems` | text? | Free text |
| `language` | text? | e.g. 'JavaScript', 'Python' |
| `runtime` | text? | e.g. '72ms' |
| `memory` | text? | e.g. '42.1MB' |
| `submission_url` | text? | Link to accepted submission |
| `solved_at` | timestamptz? | When problem was solved |
| `created_at` | timestamptz | Auto |
| `updated_at` | timestamptz | Auto-updated on change |
| `sm2_interval` | int | SM2: days until next review (default: 1) |
| `sm2_ease_factor` | float | SM2: growth multiplier (default: 2.5) |
| `sm2_repetitions` | int | SM2: successful review streak (default: 0) |
| `sm2_next_review` | date? | SM2: next due date for revision queue |

### `submission_history` Table

Every time a problem is submitted (even re-submissions), a row is added here.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `problem_key` | text | References problems.problem_key |
| `platform` | text | Platform of submission |
| `submission_id` | text? | Platform's submission ID |
| `status` | text? | 'solved' \| 'attempted' |
| `language` | text? | Submission language |
| `runtime` | text? | Runtime of this specific run |
| `memory` | text? | Memory of this specific run |
| `submitted_at` | timestamptz? | When submitted |
| `created_at` | timestamptz | Auto |

---

## 6. SM2 Spaced Repetition

Full details: `docs/SM2_SPACED_REPETITION.md`

### Summary

SM2 automatically schedules when each problem should be reviewed next, based
on the user's confidence rating. Problems that feel easy get pushed far into
the future. Problems that feel hard come back the next day.

### Confidence Mapping

| Chip | SM2 Quality | Effect |
|---|---|---|
| Low | 2 | Failure — reset interval to 1 day |
| Medium | 3 | Pass — slow growth |
| High | 5 | Perfect — fast growth |

### Interval Growth (High confidence example)

```
Review 1 → 1 day
Review 2 → 6 days
Review 3 → 16 days
Review 4 → 41 days
Review 5 → 107 days
```

### When SM2 Runs

1. **On first submit** (via extension) — calculates from defaults
2. **On re-submit** (same problem again) — continues from existing state
3. **On "I Revised It"** (on Revision page) — updates with new confidence

---

## 7. Design System

### Philosophy: "Obsidian Studio"

Matches the Chrome extension's visual language exactly. The same product,
scaled to a full dashboard. Dark by default, clean light mode available.
Feels like a premium developer tool — not a generic CRUD app.

### Color Tokens

All defined as CSS custom properties in `src/app/globals.css`.
Light mode overrides via `[data-theme="light"]` on `<html>`.

```
Dark Mode                      Light Mode
──────────────────────         ──────────────────────
bg-base:    #0d0d0f            #f4f4f6
bg-surface: #111113            #ffffff
accent:     #00d4aa            #009e82
text:       #f0f0f2            #0d0d0f
easy:       #4ade80            #16a34a
medium:     #facc15            #ca8a04
hard:       #f87171            #dc2626
```

### Typography

- **DM Sans** — all UI labels, buttons, body text
- **DM Mono** — runtime, memory, problem counts, dates, keys, streaks
- Loaded via Google Fonts (no next/font — loaded in `<head>`)

### Component Primitives (in globals.css)

```
.card              Surface card with border and hover
.badge             Inline pill (difficulty / platform)
.btn-primary       Cyan filled CTA button
.btn-ghost         Outlined secondary button
.chip              Filter pill with .chip-active selected state
.skeleton          Shimmer loading placeholder
.sidebar-nav-item  Nav link with cyan left-border active glow
.confidence-dots   3-dot confidence visualization
```

### Micro-interactions

| Trigger | Effect |
|---|---|
| Stat card mount | Count up from 0 to value (700ms, ease-out cubic) |
| Page load | Staggered fade-in on cards (60ms delay between) |
| Heatmap cell hover | Scale up 1.3× + tooltip |
| Sidebar active | Cyan left border + background glow |
| Filter change | Skeleton shimmer while new results load |
| Drawer open | Slide in from right (spring easing) |
| "I Revised It" | Card collapse animation |
| Theme toggle | 200ms crossfade (no flash) |

---

## 8. API Reference

### `POST /api/problems/from-extension`

Receives problem data from the Chrome extension. Upserts the problem and
logs a submission history entry. Calculates SM2 on every call.

**CORS**: Open (`*`) — no auth token required (auth deferred).

**Request body**: See `ExtensionPayload` type in `src/types/index.ts`

**Response**:
```json
{
  "success": true,
  "message": "Problem added" | "Problem updated",
  "problem": { ...full Problem object with SM2 fields... }
}
```

**SM2 behavior**:
- New problem: SM2 starts from defaults (repetitions=0, ease=2.5, interval=1)
- Existing problem: SM2 continues from current state (history preserved)

---

## 9. Data Flow

### Full End-to-End: Solving a Problem

```
1. User solves problem on LeetCode/Codeforces
2. Extension detects "Accepted" submission
3. Extension fetches problem metadata (GraphQL for LC, CF API for CF)
4. Extension stores data in chrome.storage.local
5. Extension popup opens, pre-filled with all captured data
6. User reviews, fills: confidence/pattern/notes/needs_revision
7. User clicks "Add to Tracker →"
8. Extension POSTs to localhost:3000/api/problems/from-extension
9. API validates + normalizes difficulty
10. API checks if problem already exists (by problem_key)
11. API runs calculateSM2() with confidence + existing SM2 state
12. API upserts problems table with SM2 values
13. API inserts row into submission_history
14. API returns success response
15. Extension popup shows success state
16. Dashboard Overview page reflects new data on next visit
```

### SM2 Revision Flow

```
1. User visits /dashboard/revision
2. Page queries: sm2_next_review <= today
3. Problems shown in "Due Today" section
4. User clicks problem → reviews it → rates new confidence
5. App calls calculateSM2() with new quality + current SM2 state
6. App calls updateSM2AfterRevision() → updates 4 SM2 columns
7. Card collapses with animation
8. Problem rescheduled — won't appear in queue until sm2_next_review
```

---

## 10. Build Progress

| Step | Description | Status |
|---|---|---|
| 0 | DB migration (SM2 columns) + Types + API SM2 integration | ✅ Complete |
| 1 | Foundation: layout shell, design system, Sidebar, Topbar | ✅ Complete |
| 2 | Overview page: StatCards, Heatmap, RecentlySolved, RevisionDue | ✅ Complete |
| 3 | Problems page: FilterBar, ProblemTable, ProblemDrawer | 🔨 Next |
| 4 | Problem detail page + submission history timeline | ⏳ Pending |
| 5 | Analytics page: charts (difficulty, timeline, tag confidence) | ⏳ Pending |
| 6 | Revision page: SM2 queue, "I Revised It" flow | ⏳ Pending |
| 7 | Manual problem entry form | ⏳ Pending |
| 8 | Interview Readiness Score full breakdown | ⏳ Pending |
| 9 | Auth (Supabase Auth + RLS + user_id) | ⏳ Deferred |

---

## 11. Roadmap

### Phase 2 (Post-Core)
- Manual problem entry from dashboard (not only via extension)
- Spaced repetition improvements (difficulty-weighted ease factors)
- Pattern-level weak area detection (surface all Backtracking problems if low)
- Company tag filtering (Google, Amazon, Meta)
- Export to CSV

### Phase 3 (Growth)
- Auth + multi-user support (Supabase Auth + RLS)
- Streak freeze / vacation mode
- Mobile responsive layout
- More platforms (HackerRank, AtCoder, InterviewBit)
- Browser extension for Firefox

### Never Building
- Leaderboards / social features (personal tool, not a competition)
- AI hints or problem recommendations (different product)
- Problem generation (scope creep)
