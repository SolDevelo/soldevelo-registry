import { NotFoundPage } from "./components/not-found-page"

// In Next.js, render NotFoundPage from app/not-found.tsx instead; this route shows it on its own.
export default function Page() {
  return <NotFoundPage path="/administration/users/unknown/roles" />
}
