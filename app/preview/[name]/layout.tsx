import type { PropsWithChildren } from "react"

// Full-height and scrollable: this renders inside the catalog's iframe, with no site chrome.
// The catalog sizes the frame to [data-preview-content], so that wrapper must not stretch.
export default function PreviewLayout({ children }: PropsWithChildren) {
  return (
    <section className="h-svh overflow-auto">
      <div className="flex min-h-full items-center justify-center">
        <div data-preview-content className="flex w-full justify-center">
          {children}
        </div>
      </div>
    </section>
  )
}
