import { NoAccess } from "./no-access"

export default function Page() {
  return (
    <div className="flex w-full flex-col gap-6 p-8">
      <NoAccess />
      <div className="rounded-xl border">
        <NoAccess homeHref={null} />
      </div>
    </div>
  )
}
