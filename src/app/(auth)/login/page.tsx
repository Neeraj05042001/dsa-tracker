"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
// import { createSupabaseBrowserClient } from "@/lib/supabase";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
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
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
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
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-sm)",
          background: "var(--bg-base)",
          border: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "var(--text-primary)",
            lineHeight: 1.3,
          }}
        >
          {loading ? "Redirecting…" : label}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          {sublabel}
        </div>
      </div>

      {/* Arrow */}
      {!loading && (
        <svg
          width="14"
          height="14"
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

function LoginPageInner() {
  const [loadingProvider, setLoadingProvider] = useState<
    "github" | "google" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/dashboard";
  const authFailed = searchParams.get("error") === "auth_failed";

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
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        padding: "0 16px",
      }}
    >
      {/* Card */}
      <div
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border-mid)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 36px",
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent glow top */}
        <div
          style={{
            position: "absolute",
            top: -60,
            left: "50%",
            transform: "translateX(-50%)",
            width: 240,
            height: 120,
            background:
              "radial-gradient(ellipse, rgba(0,212,170,0.12) 0%, transparent 70%)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(0,212,170,0.35)",
            }}
          >
            <svg
              width="18"
              height="18"
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
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Memoize
          </span>
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 8,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Sign in to access your problems,
            <br />
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
        {/* Warning for ISP */}

        {/* Network warning */}
        <div style={{
          marginTop: 14,
          padding: "10px 14px",
          background: "color-mix(in srgb, var(--accent) 8%, transparent)",
          border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          borderRadius: "var(--radius-md)",
          fontSize: 11,
          color: "var(--text-muted)",
          lineHeight: 1.6,
          textAlign: "center",
        }}>
          ⚠️ If login gets stuck or times out,<br />
          switch to <strong style={{ color: "var(--text-secondary)" }}>mobile data</strong> or a different network and try again.
        </div>

        {/* Error state */}
        {(error || authFailed) && (
          <div
            style={{
              marginTop: 16,
              padding: "10px 14px",
              background: "color-mix(in srgb, var(--hard) 10%, transparent)",
              border:
                "1px solid color-mix(in srgb, var(--hard) 25%, transparent)",
              borderRadius: "var(--radius-md)",
              fontSize: 12,
              color: "var(--hard)",
              textAlign: "center",
            }}
          >
            {error ?? "Authentication failed. Please try again."}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            margin: "24px 0",
          }}
        >
          <div
            style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            secure OAuth — no password needed
          </span>
          <div
            style={{ flex: 1, height: 1, background: "var(--border-subtle)" }}
          />
        </div>

        {/* Footer note */}
        <p
          style={{
            fontSize: 11,
            color: "var(--text-muted)",
            textAlign: "center",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          By signing in, your DSA problems are saved
          <br />
          privately to your account.
        </p>
      </div>

      {/* Back to home */}
      <div
        style={{
          textAlign: "center",
          marginTop: 20,
        }}
      >
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
          onMouseEnter={(e) =>
            (e.currentTarget.style.color = "var(--text-primary)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.color = "var(--text-muted)")
          }
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ background: "var(--bg-base)", minHeight: "100vh" }} />}>
      <LoginPageInner />
    </Suspense>
  );
}