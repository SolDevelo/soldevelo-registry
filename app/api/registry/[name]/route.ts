import { NextResponse } from "next/server"

import { findEntryByName, getAllEntries } from "@/lib/registry-data"

export const dynamic = "force-static"

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({ name: entry.name }))
}

// The shipped source for one item, for tooling that wants it without parsing public/r.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const entry = findEntryByName(name)

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json({
    name: entry.name,
    kind: entry.kind,
    title: entry.title,
    description: entry.description,
    dependencies: entry.dependencies,
    registryDependencies: entry.registryDependencies,
    files: entry.files.filter((file) => file.target !== null),
  })
}
