1. `npm install @supabase/ssr`
2. Below is the code

```js
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Problem, SubmissionHistory } from "@/types";

// ─── Environment ──────────────────────────────────────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProblemUpdate = Partial<Omit<Problem, "id" | "created_at">>;
type ProblemInsert = Omit<Problem, "id" | "created_at" | "updated_at">;

export type Database = {
  public: {
    Tables: {
      problems: {
        Row: Problem;
        Insert: ProblemInsert;
        Update: ProblemUpdate;
      };
      submission_history: {
        Row: SubmissionHistory;
        Insert: Omit<SubmissionHistory, "id" | "created_at">;
        Update: Partial<Omit<SubmissionHistory, "id" | "created_at">>;
      };
    };
  };
};

// ─── Client 1: Browser client ─────────────────────────────────────────────────
// Use in: client components ("use client"), browser-side code, extension
// Reads/writes cookies automatically in the browser

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// ─── Client 2: Server client ──────────────────────────────────────────────────
// Use in: server components, server actions, API route handlers
// Reads cookies from the incoming request to get the user session

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll called from a Server Component — safe to ignore
          // Middleware handles session refresh
        }
      },
    },
  });
}

// ─── Client 3: Middleware client ──────────────────────────────────────────────
// Use in: middleware.ts ONLY
// Reads + writes cookies on the request/response cycle

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  response: NextResponse,
) {
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
}

// ─── Legacy export (kept for backwards compat during migration) ───────────────
// TODO: Remove after all usages migrated to createSupabaseServerClient()
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);


```

## What Each Client Is For

| Client                             | Where Used                    | How It Gets the Session                        |
| ---------------------------------- | ----------------------------- | ---------------------------------------------- |
| `createSupabaseBrowserClient()`    | Client components, extensions | Browser cookies automatically                  |
| `createSupabaseServerClient()`     | Server components, API routes | Reads `next/headers` cookies                   |
| `createSupabaseMiddlewareClient()` | `middleware.ts` only          | Reads/writes on request/response cycle         |
| `supabase` (legacy)                | Existing `queries.ts`         | Anon key only, no user session (temporary use) |


---

3. Migration SQL

```js 
-- ================================================================
-- DSA TRACKER — AUTH MIGRATION
-- Run in Supabase SQL Editor
-- ================================================================


-- ── 1. Add user_id to problems ───────────────────────────────────
-- Nullable first — so existing 14 rows don't break
ALTER TABLE problems
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;


-- ── 2. Add user_id to submission_history ─────────────────────────
ALTER TABLE submission_history
  ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;


-- ── 3. Fix the unique constraint on problem_key ──────────────────
-- Currently problem_key is probably unique globally.
-- After auth, two different users CAN have the same problem_key
-- (both can solve "leetcode-two-sum"). So uniqueness must be
-- per-user, not global.
ALTER TABLE problems
  DROP CONSTRAINT IF EXISTS problems_problem_key_key;

ALTER TABLE problems
  ADD CONSTRAINT problems_user_problem_key_unique
  UNIQUE (user_id, problem_key);


-- ── 4. Add indexes for performance ───────────────────────────────
CREATE INDEX IF NOT EXISTS problems_user_id_idx
  ON problems(user_id);

CREATE INDEX IF NOT EXISTS submission_history_user_id_idx
  ON submission_history(user_id);


-- ── 5. Enable Row Level Security ─────────────────────────────────
ALTER TABLE problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE submission_history ENABLE ROW LEVEL SECURITY;


-- ── 6. RLS Policies — problems ───────────────────────────────────
CREATE POLICY "users_select_own_problems"
  ON problems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_problems"
  ON problems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_problems"
  ON problems FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_problems"
  ON problems FOR DELETE
  USING (auth.uid() = user_id);


-- ── 7. RLS Policies — submission_history ─────────────────────────
CREATE POLICY "users_select_own_submissions"
  ON submission_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_submissions"
  ON submission_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_submissions"
  ON submission_history FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_delete_own_submissions"
  ON submission_history FOR DELETE
  USING (auth.uid() = user_id);

```

4. 

```js
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  // Creates a middleware-specific supabase client that can
  // read + refresh the session cookie on every request
  const supabase = createSupabaseMiddlewareClient(request, response);

  // Refresh session — MUST be called before any redirect logic.
  // This silently refreshes the access token if it has expired,
  // keeping the user logged in without them noticing.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Rule 1: Protect /dashboard and all routes under it ──────────
  // If not logged in → redirect to /login
  if (pathname.startsWith("/dashboard") && !user) {
    const loginUrl = new URL("/login", request.url);
    // Remember where they were trying to go
    // so we can redirect them back after login
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Rule 2: Redirect logged-in users away from /login ───────────
  // If already logged in and they visit /login → send to dashboard
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── All other routes: pass through normally ──────────────────────
  return response;
}

// ── Route matcher ────────────────────────────────────────────────
// Tells Next.js which routes this middleware runs on.
// Excludes static files, images, and Next.js internals for performance.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

---

## What each part does

| Part | Why |
|---|---|
| `createSupabaseMiddlewareClient` | The middleware-specific client we built in Step 1 |
| `supabase.auth.getUser()` | Validates + silently refreshes the session token on every request |
| Rule 1 | Any `/dashboard/*` visit without a session → `/login` |
| `redirectTo` param | After login we send them back to where they were going |
| Rule 2 | Logged-in user visiting `/login` → straight to `/dashboard` |
| `matcher` | Runs on all routes except static assets — keeps it fast |

---

## How the `redirectTo` will work

When we build the login page (Step 4), it will read this param:
```
User tries to visit /dashboard/analytics
       ↓
Middleware redirects to /login?redirectTo=/dashboard/analytics
       ↓
User logs in
       ↓
Auth callback reads redirectTo → sends them to /dashboard/analytics
```

## Login page

```js
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}
```

## login/page.tsx

```js
"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

// ─── Icons ────────────────────────────────────────────────────────────────────

function IcoGithub() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IcoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ─── OAuth button ─────────────────────────────────────────────────────────────

function OAuthButton({
  onClick,
  loading,
  icon,
  label,
  sublabel,
}: {
  onClick: () => void;
  loading: boolean;
  icon: React.ReactNode;
  label: string;
  sublabel: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        background: hovered ? "var(--bg-hover)" : "var(--bg-elevated)",
        border: `1px solid ${hovered ? "var(--border-strong)" : "var(--border-mid)"}`,
        borderRadius: "var(--radius-md)",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.15s ease",
        transform: hovered && !loading ? "translateY(-1px)" : "translateY(0)",
        boxShadow: hovered && !loading ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
        textAlign: "left",
      }}
    >
      {/* Icon box */}
      <div style={{
        width: 36, height: 36,
        borderRadius: "var(--radius-sm)",
        background: "var(--bg-base)",
        border: "1px solid var(--border-subtle)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: "var(--text-primary)",
          lineHeight: 1.3,
        }}>
          {loading ? "Redirecting…" : label}
        </div>
        <div style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 2,
        }}>
          {sublabel}
        </div>
      </div>

      {/* Arrow */}
      {!loading && (
        <svg
          width="14" height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          style={{ flexShrink: 0 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState
    "github" | "google" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";

  async function handleOAuth(provider: "github" | "google") {
    setLoadingProvider(provider);
    setError(null);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        // After OAuth completes, Supabase redirects here.
        // We pass redirectTo so the callback can send them
        // to the right page after login.
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
      },
    });

    if (error) {
      setError("Something went wrong. Please try again.");
      setLoadingProvider(null);
    }
    // If no error, the browser is now redirecting to Google/GitHub.
    // We keep loading state — page will navigate away.
  }

  return (
    <div style={{
      width: "100%",
      maxWidth: 420,
      padding: "0 16px",
    }}>
      {/* Card */}
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-mid)",
        borderRadius: "var(--radius-xl)",
        padding: "40px 36px",
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Accent glow top */}
        <div style={{
          position: "absolute",
          top: -60, left: "50%",
          transform: "translateX(-50%)",
          width: 240, height: 120,
          background: "radial-gradient(ellipse, rgba(0,212,170,0.12) 0%, transparent 70%)",
          filter: "blur(20px)",
          pointerEvents: "none",
        }} />

        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          marginBottom: 32,
        }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(0,212,170,0.35)",
          }}>
            <svg
              width="18" height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0d0d0f"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </div>
          <span style={{
            fontSize: 17,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}>
            DSA Tracker
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}>
            Welcome back
          </h1>
          <p style={{
            fontSize: 13,
            color: "var(--text-muted)",
            lineHeight: 1.6,
          }}>
            Sign in to access your problems,<br />
            revision queue, and analytics.
          </p>
        </div>

        {/* OAuth buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <OAuthButton
            onClick={() => handleOAuth("github")}
            loading={loadingProvider === "github"}
            icon={<IcoGithub />}
            label="Continue with GitHub"
            sublabel="Recommended for developers"
          />
          <OAuthButton
            onClick={() => handleOAuth("google")}
            loading={loadingProvider === "google"}
            icon={<IcoGoogle />}
            label="Continue with Google"
            sublabel="Sign in with your Google account"
          />
        </div>

        {/* Error state */}
        {error && (
          <div style={{
            marginTop: 16,
            padding: "10px 14px",
            background: "color-mix(in srgb, var(--hard) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
            borderRadius: "var(--radius-md)",
            fontSize: 12,
            color: "var(--hard)",
            textAlign: "center",
          }}>
            {error}
          </div>
        )}

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            secure OAuth — no password needed
          </span>
          <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
        </div>

        {/* Footer note */}
        <p style={{
          fontSize: 11,
          color: "var(--text-muted)",
          textAlign: "center",
          lineHeight: 1.6,
          margin: 0,
        }}>
          By signing in, your DSA problems are saved<br />
          privately to your account.
        </p>
      </div>

      {/* Back to home */}
      <div style={{
        textAlign: "center",
        marginTop: 20,
      }}>
        <Link
          href="/"
          style={{
            fontSize: 12,
            color: "var(--text-muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            transition: "color 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
          onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}
```

---

## Folder structure created so far
```
app/
├── (auth)/
│   ├── layout.tsx        ← Step 4a (new)
│   └── login/
│       └── page.tsx      ← Step 4b (new)
├── (dashboard)/
│   └── dashboard/...     ← existing
├── page.tsx              ← homepage
└── layout.tsx            ← root layout
```

---

## What happens when a button is clicked
```
User clicks "Continue with GitHub"
       ↓
loadingProvider = "github" → button shows "Redirecting…"
       ↓
supabase.auth.signInWithOAuth() called
       ↓
Browser redirects to GitHub OAuth page
       ↓
User approves → GitHub redirects to:
/auth/callback?code=xxx&redirectTo=/dashboard
       ↓
We handle that in Step 5

```