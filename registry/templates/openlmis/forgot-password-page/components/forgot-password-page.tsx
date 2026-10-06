"use client"

import { useState } from "react"

import { AuthPage } from "@/registry/blocks/openlmis/auth-card/auth-card"
import { ForgotPasswordForm } from "@/registry/templates/openlmis/forgot-password-page/components/forgot-password-form/forgot-password-form"

// oxlint-disable-next-line next/no-img-element -- items are framework-neutral
const logo = <img alt="OpenLMIS" src="/projects/openlmis.png" />

export function ForgotPasswordPage() {
  // Request the reset link here; the confirmation is the same for any address.
  const [sentTo, setSentTo] = useState<string>()

  return (
    <AuthPage>
      <ForgotPasswordForm logo={logo} onSubmit={setSentTo} sentTo={sentTo} />
    </AuthPage>
  )
}
