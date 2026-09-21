import type { PropsWithChildren } from "react"

// Full-height and scrollable: this renders inside the catalog's iframe, with no site chrome.
export default function PreviewLayout({ children }: PropsWithChildren) {
  return (
    <section className="h-svh overflow-auto">
      <div className="flex min-h-full items-center justify-center">
        {children}
      </div>
    </section>
  )
}
