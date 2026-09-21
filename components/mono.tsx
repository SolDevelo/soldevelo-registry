import { cn } from "@/lib/utils"

// Inline code. `text-inline-code` is relative, so the chip tracks whatever text it sits in.
export function Mono({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <code
      className={cn(
        "rounded-sm bg-muted px-1 py-px font-mono text-inline-code",
        className
      )}
    >
      {children}
    </code>
  )
}

// Renders `backticked` spans in a plain string as inline code. The strings stay
// plain text so the same source can feed both the page and its FAQ schema.
export function withInlineCode(text: string) {
  return text
    .split(/(`[^`]+`)/)
    .map((part, index) =>
      part.startsWith("`") && part.endsWith("`") && part.length > 2 ? (
        <Mono key={`${index.toString()}-code`}>{part.slice(1, -1)}</Mono>
      ) : (
        part
      )
    )
}

export function stripInlineCode(text: string): string {
  return text.replaceAll("`", "")
}
