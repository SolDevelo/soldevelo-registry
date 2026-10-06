"use client"

import { useState } from "react"

import { CardContent, CardDescription } from "@/components/ui/card"
import {
  AuthButtonLink,
  AuthHeader,
  AuthPage,
  AuthTitle,
} from "@/registry/components/openlmis/auth-card/auth-card"
import {
  type SignInCredentials,
  SignInForm,
} from "@/registry/templates/openlmis/sign-in-page/components/sign-in-form/sign-in-form"

// Mock account; swap the check for your own sign-in call.
const MOCK_USER = { username: "administrator", password: "password1" }

// oxlint-disable-next-line next/no-img-element -- items are framework-neutral
const logo = <img alt="OpenLMIS" src="/projects/openlmis.png" />

export function SignInPage() {
  const [error, setError] = useState<string>()
  const [signedIn, setSignedIn] = useState<string>()

  const signIn = ({ username, password }: SignInCredentials) => {
    if (username === MOCK_USER.username && password === MOCK_USER.password) {
      setError(undefined)
      setSignedIn(username)
    } else {
      setError("Check your username and password, then try again.")
    }
  }

  return (
    <AuthPage>
      {signedIn ? (
        <>
          <AuthHeader logo={logo}>
            <AuthTitle focus>Signed In</AuthTitle>
            <CardDescription>Welcome back, {signedIn}.</CardDescription>
          </AuthHeader>
          <CardContent>
            <AuthButtonLink href="/">Continue</AuthButtonLink>
          </CardContent>
        </>
      ) : (
        <SignInForm error={error} logo={logo} onSubmit={signIn} />
      )}
    </AuthPage>
  )
}
