"use client"

import type { FormEvent, ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { FieldGroup } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

type AuthCardProps = {
  /** The footer credit; pass `null` to leave it out. */
  poweredBy?: { name: string; href: string } | null
  children: ReactNode
}

const OPENLMIS = { name: "OpenLMIS", href: "https://openlmis.org/" }

/** The signed-out card on its own, at the width `AuthPage` centres. */
export function AuthCard({ poweredBy = OPENLMIS, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <Card>
        {children}
        {poweredBy && (
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              Powered by{" "}
              <a
                className="underline underline-offset-4 hover:text-primary"
                href={poweredBy.href}
                rel="noopener noreferrer"
                target="_blank"
              >
                {poweredBy.name}
              </a>
              .
            </p>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

type AuthPageProps = AuthCardProps & {
  /** Top end of the page, e.g. language and theme switchers. */
  actions?: ReactNode
}

/** A signed-out page: one centred card on a muted background, filling its parent's height. */
export function AuthPage({ actions, poweredBy, children }: AuthPageProps) {
  return (
    <section className="relative flex min-h-full w-full flex-col items-center justify-center bg-muted px-6 py-12 text-foreground">
      {actions && (
        <div className="absolute end-4 top-4 flex items-center gap-1">
          {actions}
        </div>
      )}
      <AuthCard poweredBy={poweredBy}>{children}</AuthCard>
    </section>
  )
}

/** The app's logo above the title, e.g. `<img src="/logo.png" alt="OpenLMIS" />`. */
export function AuthHeader({
  logo,
  children,
}: {
  logo?: ReactNode
  children: ReactNode
}) {
  return (
    <CardHeader className="justify-items-center text-center">
      {logo && <div className="mx-auto flex h-12 *:h-full">{logo}</div>}
      {children}
    </CardHeader>
  )
}

const focusOnMount = (element: HTMLElement | null) => element?.focus()

type AuthTitleProps = {
  /** Takes focus as it appears; set it only when the card replaces a form the user was in, never on first render. */
  focus?: boolean
  children: ReactNode
}

export function AuthTitle({ focus = false, children }: AuthTitleProps) {
  return (
    <div
      className="outline-none"
      ref={focus ? focusOnMount : undefined}
      tabIndex={focus ? -1 : undefined}
    >
      {/* A plain heading, as stock CardTitle has no large size. */}
      <h1 className="font-heading text-xl leading-snug font-bold tracking-tight">
        {children}
      </h1>
    </div>
  )
}

export function AuthForm({
  onSubmit,
  children,
}: {
  onSubmit: () => void
  children: ReactNode
}) {
  const submit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return (
    <form noValidate onSubmit={submit}>
      <FieldGroup>{children}</FieldGroup>
    </form>
  )
}

export function AuthSubmit({
  pending,
  children,
}: {
  pending: boolean
  children: ReactNode
}) {
  return (
    // Focusable while pending, so pressing it does not drop keyboard focus.
    <Button
      className="w-full"
      disabled={pending}
      focusableWhenDisabled={pending}
      type="submit"
    >
      {pending && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  )
}

type AuthLinkProps = {
  href: string
  newTab?: boolean
  children: ReactNode
}

export function AuthLink({ href, newTab = false, children }: AuthLinkProps) {
  return (
    <a
      className="rounded-sm text-sm text-muted-foreground outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      href={href}
      rel={newTab ? "noopener noreferrer" : undefined}
      target={newTab ? "_blank" : undefined}
    >
      {children}
    </a>
  )
}

type AuthButtonLinkProps = {
  href: string
  variant?: "default" | "outline"
  describedBy?: string
  children: ReactNode
}

/** A full-width button that navigates, such as Back To Sign In. */
export function AuthButtonLink({
  href,
  variant = "default",
  describedBy,
  children,
}: AuthButtonLinkProps) {
  return (
    <Button
      aria-describedby={describedBy}
      className="w-full"
      nativeButton={false}
      // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Base UI renders the Button's text into the link
      render={<a href={href} />}
      variant={variant}
    >
      {children}
    </Button>
  )
}
