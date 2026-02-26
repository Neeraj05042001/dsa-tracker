import { createClient } from "@supabase/supabase-js";
import { Problem, SubmissionHistory } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error("Missing Supabase environment variables");
}

// Explicit types — avoids TS2345 'never' error on update calls
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

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
);