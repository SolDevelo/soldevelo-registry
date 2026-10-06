type NarrowableOption = { label: string; description?: string }

const searchText = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase()

// Hide oversized result sets until the query narrows them below the limit.
export function narrowOptions<T extends NarrowableOption>(
  options: readonly T[],
  {
    query,
    limit,
    searched = false,
    total,
  }: { query: string; limit: number; searched?: boolean; total?: number }
): { items: readonly T[]; hint: string | null } {
  const text = searchText(query.trim())
  const matches =
    searched || text === ""
      ? options
      : options.filter(
          (option) =>
            searchText(option.label).includes(text) ||
            (option.description &&
              searchText(option.description).includes(text))
        )
  const count = total ?? matches.length
  if (count <= limit) return { items: matches, hint: null }
  return {
    items: [],
    hint:
      text === ""
        ? "Type to narrow the list"
        : `${count} matches, keep typing to narrow the list`,
  }
}
