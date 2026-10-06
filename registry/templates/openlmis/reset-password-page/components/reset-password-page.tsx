"use client"

import { useState } from "react"

import {
  type ResetLinkStatus,
  ResetPasswordForm,
} from "@/registry/templates/openlmis/reset-password-page/components/reset-password-form/reset-password-form"
import { AuthPage } from "@/registry/blocks/openlmis/auth-card/auth-card"

// oxlint-disable-next-line next/no-img-element -- items are framework-neutral
const logo = <img alt="OpenLMIS" src="/projects/openlmis.png" />

type ResetPasswordPageProps = {
  /** Whether the link still works; check the token from the URL before rendering. */
  status?: Exclude<ResetLinkStatus, "changed">
}

export function ResetPasswordPage({
  status = "ready",
}: ResetPasswordPageProps) {
  const [changed, setChanged] = useState(false)

  return (
    <AuthPage>
      <ResetPasswordForm
        logo={logo}
        onSubmit={() => setChanged(true)}
        status={changed ? "changed" : status}
      />
    </AuthPage>
  )
}
