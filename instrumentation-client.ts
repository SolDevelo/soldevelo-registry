import { posthog } from "posthog-js"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

// Previews run inside the catalog's iframes, one per card, so tracking them
// would multiply every pageview. They still report their errors.
const isFramed = window.self !== window.top

if (token) {
  posthog.init(token, {
    // Proxied through next.config.ts so ad blockers do not drop the events.
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-08-30",
    // Nothing is stored on the device, so no consent banner is needed; visitors
    // are counted by a daily-salted hash on PostHog's side instead.
    cookieless_mode: "always",
    disable_session_recording: true,
    capture_exceptions: true,
    ...(isFramed && {
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_heatmaps: false,
      capture_performance: false,
      capture_dead_clicks: false,
      disable_surveys: true,
      advanced_disable_flags: true,
      before_send: (event) => (event?.event === "$exception" ? event : null),
    }),
  })
} else if (process.env.NODE_ENV === "development") {
  console.error(
    "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
  )
}
