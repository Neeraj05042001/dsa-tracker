// ==================== STORE CF SESSION ====================
// Receives JSESSIONID from extension, encrypts it, stores in DB.
// This is called once when user clicks "Sync Groups" in the popup.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encryptSession } from "@/lib/cf-encrypt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ── Auth ──────────────────────────────────────────────────────
    // Support both cookie-based auth (browser) and Bearer token (extension)
    let authedClient;
    const token = request.headers
      .get("Authorization")
      ?.replace("Bearer ", "")
      .trim();

    if (token) {
      // Extension sends Bearer token
      authedClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      );
    } else {
      // Browser sends cookies — use server client
      const { createSupabaseServerClient } =
        await import("@/lib/supabase-server");
      authedClient = await createSupabaseServerClient();
    }

    const {
      data: { user },
      error: authError,
    } = await authedClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401, headers: corsHeaders },
      );
    }

    // ── Validate body ─────────────────────────────────────────────
    const body = await request.json();
    const { cf_handle, jsessionid } = body;

    if (!cf_handle?.trim()) {
      return NextResponse.json(
        { success: false, message: "cf_handle is required" },
        { status: 400, headers: corsHeaders },
      );
    }
    if (!jsessionid?.trim()) {
      return NextResponse.json(
        { success: false, message: "jsessionid is required" },
        { status: 400, headers: corsHeaders },
      );
    }

    // ── Encrypt and upsert ────────────────────────────────────────
    const encryptedSession = encryptSession(jsessionid.trim());

    const { error: upsertError } = await (authedClient as any)
      .from("user_cf_auth")
      .upsert(
        {
          user_id: user.id,
          cf_handle: cf_handle.trim().toLowerCase(),
          encrypted_session: encryptedSession,
          session_updated_at: new Date().toISOString(),
          is_session_valid: true,
          consecutive_failures: 0,
        },
        { onConflict: "user_id" },
      );

    if (upsertError) {
      console.error("[CF Store Session] DB error:", upsertError);
      return NextResponse.json(
        { success: false, message: "Failed to store session" },
        { status: 500, headers: corsHeaders },
      );
    }

    console.log(
      `[CF Store Session] Stored for user ${user.email} in ${Date.now() - startTime}ms`,
    );

    return NextResponse.json(
      { success: true, message: "CF session stored" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    const err = error as Error;
    console.error("[CF Store Session] Unexpected error:", err.message);
    return NextResponse.json(
      { success: false, message: err.message || "Internal server error" },
      { status: 500, headers: corsHeaders },
    );
  }
}
