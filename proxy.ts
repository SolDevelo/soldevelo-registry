import { createHash } from "node:crypto"
import { PostHog } from "posthog-node"
import type { NextRequest } from "next/server"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

// The shadcn CLI installs by fetching /r/{name}.json, so this is the only place an install is visible.
export async function proxy(request: NextRequest) {
  if (!token) return

  const name = request.nextUrl.pathname.match(/^\/r\/(.+)\.json$/)?.[1]
  const userAgent = request.headers.get("user-agent") ?? ""
  // Only the CLI (and its MCP server) sends this agent; crawlers and browsers reading the JSON are not installs.
  if (!name || name === "registry" || !userAgent.startsWith("shadcn")) return

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  const day = new Date().toISOString().slice(0, 10)
  // `shadcn add` fetches each item twice per run, so installs are counted as unique
  // installers per day. Only the network prefix is hashed, so the ID cannot be
  // brute-forced back to one machine, and it rotates daily.
  const installerId = createHash("sha256")
    .update(`${networkOf(ip)}|${userAgent}|${day}`)
    .digest("hex")

  const client = new PostHog(token, {
    host: "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  })

  client.capture({
    distinctId: installerId,
    event: "registry_item_installed",
    properties: {
      item: name,
      user_agent: userAgent,
      $process_person_profile: false,
      // The request comes from the host's server, so a GeoIP lookup would only locate the data centre.
      $geoip_disable: true,
    },
  })

  // Awaited rather than handed to waitUntil, which not every host (Amplify included) honours.
  // Capped so a slow PostHog can never stall an install.
  await client.shutdown(2000).catch(() => {})
}

// The /24 of an IPv4 address or the /48 of an IPv6 one.
function networkOf(ip: string | undefined): string {
  if (!ip) return "unknown"
  if (ip.includes(":")) return ip.split(":").slice(0, 3).join(":")
  return ip.split(".").slice(0, 3).join(".")
}

export const config = {
  matcher: "/r/:path*",
}
