// import { createClient } from "@supabase/supabase-js";
// import { Problem, SubmissionHistory } from "@/types";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// if (!supabaseUrl || !supabasePublishableKey) {
//   throw new Error("Missing Supabase environment variables");
// }

// // Explicit types — avoids TS2345 'never' error on update calls
// type ProblemUpdate = Partial<Omit<Problem, "id" | "created_at">>;
// type ProblemInsert = Omit<Problem, "id" | "created_at" | "updated_at">;

// export type Database = {
//   public: {
//     Tables: {
//       problems: {
//         Row: Problem;
//         Insert: ProblemInsert;
//         Update: ProblemUpdate;
//       };
//       submission_history: {
//         Row: SubmissionHistory;
//         Insert: Omit<SubmissionHistory, "id" | "created_at">;
//         Update: Partial<Omit<SubmissionHistory, "id" | "created_at">>;
//       };
//     };
//   };
// };

// export const supabase = createClient<Database>(
//   supabaseUrl,
//   supabasePublishableKey,
// );

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


