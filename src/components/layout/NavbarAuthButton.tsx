import { createSupabaseServerClient } from "@/lib/supabase";


import Link from "next/link";

export async function NavbarAuthButton() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Logged in ──────────────────────────────────────────────
  if (user) {
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
    const initial = name.charAt(0).toUpperCase();

    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Avatar + name → links to dashboard */}
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px 5px 6px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-mid)",
            borderRadius: "var(--radius-pill)",
            textDecoration: "none",
            transition: "border-color 0.15s, background 0.15s",
          }}
        >
          {/* Avatar */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              width={24}
              height={24}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                border: "1.5px solid var(--border-mid)",
              }}
            />
          ) : (
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "var(--accent-muted)",
                border: "1.5px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </span>
        </Link>

        {/* Sign out */}
        <form action="/auth/signout" method="POST">
          <button
            type="submit"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px 8px",
              borderRadius: "var(--radius-md)",
              transition: "color 0.15s",
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    );
  }

  // ── Logged out ─────────────────────────────────────────────
  return (
    <Link
      href="/dashboard"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 16px",
        background: "var(--accent)",
        color: "#0d0d0f",
        borderRadius: "var(--radius-md)",
        fontSize: 13,
        fontWeight: 600,
        textDecoration: "none",
        transition: "background 0.15s, box-shadow 0.15s, transform 0.15s",
        boxShadow: "0 0 0 0 rgba(0,212,170,0)",
      }}
    >
      Open Dashboard
    </Link>
  );
}