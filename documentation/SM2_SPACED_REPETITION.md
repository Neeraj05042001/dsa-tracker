# SM2 Spaced Repetition — DSA Tracker

## What Is It?

SM2 is a spaced repetition algorithm originally designed for flashcard learning.
In DSA Tracker, it answers one question automatically:

> **"When should I revisit this problem?"**

Instead of you manually deciding what to review, the algorithm schedules it
based on how confident you felt the last time you solved or reviewed it.

---

## The Core Idea

- If you found a problem **easy** → you don't need to see it for a long time
- If you **struggled** → you need to see it again soon

The harder a problem feels for you personally, the more frequently it surfaces
in your Revision queue. Problems you've mastered fade away on their own.

---

## How It Gets Triggered — Two Moments

### Moment 1: First Submission (via Chrome Extension)

When you hit **"Add to Tracker"** in the popup, your confidence chip
(`Low / Medium / High`) is sent to the API. SM2 runs immediately at insert time.

```
User selects "Low" confidence → API runs SM2 → next review = tomorrow
User selects "High" confidence → API runs SM2 → next review = tomorrow (first time always 1 day)
```

Even on first submission, all 4 SM2 columns get real values — not just defaults.

### Moment 2: Marking "I Revised It" (on the Revision Page)

This is where SM2 does its real work. Each time you mark a problem as revised
and re-rate your confidence, the algorithm recalculates the next review date.

---

## The 4 Database Columns

| Column | Type | Default | Purpose |
|---|---|---|---|
| `sm2_interval` | integer | 1 | Days until next review. Grows exponentially on success, resets to 1 on failure. |
| `sm2_ease_factor` | float | 2.5 | The growth multiplier. High = interval grows fast (easy for you). Low = grows slowly (hard for you). Min: 1.3 |
| `sm2_repetitions` | integer | 0 | Consecutive successful review streak. Resets to 0 on failure. |
| `sm2_next_review` | date | null | The actual date the problem appears in "Due Today" queue. Shown when `sm2_next_review <= today` |

---

## Confidence → SM2 Quality Score Mapping

Your three confidence chips map to SM2's 0–5 quality scale:

| Extension Chip | SM2 Quality | Treated As | Effect |
|---|---|---|---|
| **Low** | 2 | ❌ Failure | Interval resets to 1 day. Ease factor drops. |
| **Medium** | 3 | ✅ Minimum pass | Interval grows slowly. Ease factor barely changes. |
| **High** | 5 | ✅ Perfect recall | Interval multiplies aggressively. Ease factor rises. |

> Quality score **below 3 = failure = reset**. Quality **3 and above = success = schedule extends**.

---

## How The Interval Grows Over Time

Example: A problem you consistently rate **High** confidence.

```
Revision 1 → sm2_interval = 1  day  (first time is always 1)
Revision 2 → sm2_interval = 6  days (second success is always 6)
Revision 3 → sm2_interval = 16 days (6 × ease_factor 2.6 = 15.6 → 16)
Revision 4 → sm2_interval = 41 days (16 × 2.6 = 41.6)
Revision 5 → sm2_interval = 107 days
```

A problem you keep **struggling** with (Low confidence):

```
Revision 1 → interval resets to 1 day
Revision 2 → interval resets to 1 day (again)
Revision 3 → interval resets to 1 day (again)
... until you rate it Medium or High
```

---

## The Algorithm — Step by Step

```
Input:
  quality      = SM2 quality score (0–5, derived from confidence chip)
  repetitions  = current sm2_repetitions value
  ease_factor  = current sm2_ease_factor value
  interval     = current sm2_interval value

Logic:

  IF quality < 3 (Low confidence = failure):
    new_repetitions = 0
    new_interval    = 1
    new_ease_factor = max(1.3, ease_factor - 0.2)

  IF quality >= 3 (Medium or High = success):
    new_repetitions = repetitions + 1
    new_ease_factor = max(1.3, ease_factor + 0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02))

    IF repetitions == 0: new_interval = 1
    IF repetitions == 1: new_interval = 6
    ELSE:                new_interval = round(interval × new_ease_factor)

  next_review_date = today + new_interval days

Output:
  sm2_repetitions  ← new_repetitions
  sm2_ease_factor  ← new_ease_factor
  sm2_interval     ← new_interval
  sm2_next_review  ← next_review_date
```

---

## Where SM2 Lives In The Codebase

```
src/types/index.ts
  ├── calculateSM2(input: SM2Input): SM2Output       ← pure algorithm function
  ├── confidenceToSM2Quality(confidence): number     ← maps Low/Medium/High to 0–5
  └── SM2Input, SM2Output interfaces

src/app/api/problems/from-extension/route.ts
  └── Calls calculateSM2() on every insert/upsert    ← populates all 4 columns

src/app/(dashboard)/revision/page.tsx  (to be built)
  └── Calls calculateSM2() when user marks "I Revised It"
  └── Updates the 4 SM2 columns via Supabase PATCH
```

---

## What The User Sees

On the **Revision Page**, the "Due Today" section shows all problems where:
```sql
sm2_next_review <= CURRENT_DATE
```

Sorted by urgency — most overdue first.

Each card shows:
- Problem name + difficulty
- Days since last solved
- Confidence at last review
- **"I Revised It"** button → opens a confidence re-rating → runs SM2 → reschedules

---

## Why This Matters For Interview Prep

Most people either:
- Re-solve random problems with no structure, or
- Never revisit problems they once solved

SM2 solves both problems. It ensures:
1. You never forget what you've learned (overdue problems surface automatically)
2. You spend zero time on problems you already know cold
3. Your revision time is always spent where it matters most

The result: a smaller, smarter queue that actually reflects your weak spots —
not just a timestamp-sorted list of everything you've ever solved.

---

## Future Improvements (Not Yet Built)

- **Difficulty-weighted SM2** — Hard problems could start with a lower ease_factor
- **Pattern-level scheduling** — If you're weak on all Tree problems, surface them as a group
- **Streak bonuses** — Consecutive correct reviews boost ease_factor slightly faster
- **Manual override** — Let user say "I want to see this again in 3 days" regardless of SM2
