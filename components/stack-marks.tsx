import { BaseUi } from "@/components/ui/svgs/base-ui"
import { ReactLight } from "@/components/ui/svgs/react-light"
import { ShadcnUi } from "@/components/ui/svgs/shadcn-ui"
import { Tailwindcss } from "@/components/ui/svgs/tailwindcss"
import { Typescript } from "@/components/ui/svgs/typescript"
import { cn } from "@/lib/utils"

const STACK = [
  { name: "React", Mark: ReactLight },
  { name: "TypeScript", Mark: Typescript },
  { name: "Tailwind CSS", Mark: Tailwindcss },
  { name: "shadcn/ui", Mark: ShadcnUi },
  { name: "Base UI", Mark: BaseUi },
]

// One accessible name for the row: five separate images would be read as noise.
export function StackMarks({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Built with ${STACK.map((item) => item.name).join(", ")}`}
      className={cn("flex -space-x-2", className)}
    >
      {STACK.map(({ name, Mark }) => (
        <span
          key={name}
          title={name}
          className="flex size-7 items-center justify-center rounded-full border bg-card text-foreground ring-2 ring-background"
        >
          <Mark className="size-4" />
        </span>
      ))}
    </span>
  )
}
