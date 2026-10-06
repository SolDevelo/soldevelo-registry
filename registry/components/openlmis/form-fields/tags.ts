export type TagRefusal = "too-short" | "too-long" | "duplicate"

type TagLimits = { min?: number | undefined; max?: number | undefined }

const sameTag = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0

/** The tags with `text` added, the reason it can't be, or null when there is nothing to add. */
export function addTag(
  tags: readonly string[],
  text: string,
  { min = 1, max = Number.POSITIVE_INFINITY }: TagLimits = {}
): { tags: string[] } | { refused: TagRefusal } | null {
  const tag = text.trim()
  if (!tag) return null
  if (tag.length < min) return { refused: "too-short" }
  if (tag.length > max) return { refused: "too-long" }
  if (tags.some((existing) => sameTag(existing, tag)))
    return { refused: "duplicate" }
  return { tags: [...tags, tag] }
}

/** The suggestions containing `text` that aren't added yet, both ignoring case; none until something is typed. */
export function tagSuggestions(
  suggestions: readonly string[],
  tags: readonly string[],
  text: string
) {
  const term = text.trim().toLocaleLowerCase()
  if (!term) return []
  return suggestions.filter(
    (suggestion) =>
      suggestion.toLocaleLowerCase().includes(term) &&
      !tags.some((tag) => sameTag(tag, suggestion))
  )
}
