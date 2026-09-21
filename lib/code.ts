import fs from "node:fs/promises"
import path from "node:path"

// Returns a marker instead of throwing so the UI degrades; `assertRegistryInvariants` rejects it at build time.
export async function loadCode(filePath: string): Promise<string> {
  try {
    return (
      await fs.readFile(path.join(process.cwd(), filePath), "utf8")
    ).trim()
  } catch {
    return "// Code Not Found"
  }
}
