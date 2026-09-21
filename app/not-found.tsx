import Link from "next/link"

import { SiteHeader } from "@/components/site-header"
import { getSearchIndex } from "@/lib/registry-data"
import { Button } from "@/components/ui/button"
import { notFoundMetadata } from "@/lib/metadata"

export const metadata = notFoundMetadata

export default function NotFound() {
  return (
    <>
      <SiteHeader entries={getSearchIndex()} />
      <main className="mx-auto flex w-full max-w-5xl flex-col items-start gap-4 px-4 pt-24 pb-24">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has moved.
        </p>
        <Button size="lg" nativeButton={false} render={<Link href="/blocks" />}>
          Browse The Registry
        </Button>
      </main>
    </>
  )
}
