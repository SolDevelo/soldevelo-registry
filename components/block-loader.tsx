import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function BlockLoader({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex min-h-full items-center justify-center", className)}
    >
      <Spinner />
    </div>
  )
}
