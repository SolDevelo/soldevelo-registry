type NarrowableOption = { label: string; description?: string }

const searchText = (text: string) =>
  text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase()

// List the first `limit` matches, with a hint to search when more match than that.
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
  const items = matches.slice(0, limit)
  const count = total ?? matches.length
  return {
    items,
    // An empty list shows the empty message alone.
    hint:
      count > limit && items.length > 0
        ? `More than ${limit} entries. Search to narrow the list.`
        : null,
  }
}
