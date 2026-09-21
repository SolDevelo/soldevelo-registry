import { cn } from "@/lib/utils"

// One shape for every section eyebrow: a mark, a muted lead-in, then the phrase
// that carries the meaning. Keeping it here stops the four sections drifting.
export function SectionEyebrow({
  mark,
  lead,
  emphasis,
  className,
}: {
  mark: React.ReactNode
  lead: string
  emphasis: string
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-xs sm:gap-2.5 sm:text-sm",
        className
      )}
    >
      {mark}
      <span>
        <span className="text-muted-foreground">{lead} </span>
        <span className="font-medium text-foreground">{emphasis}</span>
      </span>
    </span>
  )
}

export function LiveDot() {
  return (
    <span className="relative flex size-2" aria-hidden="true">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-success/20 motion-reduce:animate-none" />
      <span className="relative inline-flex size-2 rounded-full bg-success" />
    </span>
  )
}
