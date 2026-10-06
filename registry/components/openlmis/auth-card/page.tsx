import { CardContent, CardDescription } from "@/components/ui/card"

import {
  AuthButtonLink,
  AuthCard,
  AuthHeader,
  AuthLink,
  AuthTitle,
} from "./auth-card"

// oxlint-disable-next-line next/no-img-element -- items are framework-neutral
const logo = <img alt="OpenLMIS" src="/projects/openlmis.png" />

export default function Page() {
  return (
    <div className="grid w-full items-start justify-items-center gap-6 bg-muted p-8 md:grid-cols-2">
      <AuthCard>
        <AuthHeader logo={logo}>
          <AuthTitle>Signed Out</AuthTitle>
          <CardDescription>
            You signed out of OpenLMIS. Sign in again to carry on.
          </CardDescription>
        </AuthHeader>
        <CardContent>
          <div className="grid gap-2">
            <AuthButtonLink href="#">Sign In</AuthButtonLink>
            <p className="text-center">
              <AuthLink href="#">Forgot Password?</AuthLink>
            </p>
          </div>
        </CardContent>
      </AuthCard>
      <AuthCard poweredBy={null}>
        <AuthHeader>
          <AuthTitle>Without A Logo Or Credit</AuthTitle>
          <CardDescription>
            Leave out the logo and pass a null credit for a plain card.
          </CardDescription>
        </AuthHeader>
        <CardContent>
          <AuthButtonLink href="#" variant="outline">
            Back
          </AuthButtonLink>
        </CardContent>
      </AuthCard>
    </div>
  )
}
