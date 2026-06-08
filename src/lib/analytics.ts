import posthog from "posthog-js";

type EventProperties = Record<string, string | number | boolean | null | undefined>;

export const ANALYTICS_EVENTS = {
  CHROME_STORE_CTA_CLICKED: "chrome_store_cta_clicked",
  LOGIN_INITIATED: "login_initiated",
  DASHBOARD_OPENED: "dashboard_opened",
  PROBLEMS_OPENED: "problems_opened",
  REVISION_QUEUE_OPENED: "revision_queue_opened",
  ANALYTICS_OPENED: "analytics_opened",
} as const;

export function trackEvent(
  eventName: string,
  properties: EventProperties = {}
) {
  if (typeof window === "undefined") return;

  posthog.capture(eventName, {
    app: "memoize",
    environment: process.env.NODE_ENV,
    ...properties,
  });
}