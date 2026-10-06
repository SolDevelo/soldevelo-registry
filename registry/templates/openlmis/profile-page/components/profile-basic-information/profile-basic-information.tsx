"use client"

import { revalidateLogic, useStore } from "@tanstack/react-form"
import { MailIcon } from "lucide-react"
import { type ReactNode, useEffect, useId, useRef } from "react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { FormDialogError } from "@/registry/components/openlmis/form-dialog/form-dialog"
import { useAppForm } from "@/registry/components/openlmis/form-fields/form"
import { FieldLabelText } from "@/registry/components/openlmis/form-fields/form-fields"
import {
  SettingsItem,
  SettingsList,
  SettingsRowFrame,
} from "@/registry/blocks/openlmis/settings-list/settings-list"
import { StatusBadge } from "@/registry/components/openlmis/status-badge/status-badge"

import {
  type Profile,
  type ProfileFormValues,
  countProfileChanges,
  profileFormSchema,
  toProfileFormValues,
} from "./profile"
import {
  type FormActionState as ProfileFormActions,
  FormActions as ProfileFormButtons,
} from "@/registry/components/openlmis/form-actions/form-actions"

type ProfileBasicInformationProps = {
  /** A skeleton of every row shows until it is set. */
  profile: Profile | undefined
  /** Called with the values when something changed; save them, then pass the saved profile back. */
  onSubmit: (values: ProfileFormValues, profile: Profile) => void
  /** Disables the buttons and shows a spinner while the profile is saved. */
  pending?: boolean
  /** Shown above the rows, e.g. why the save failed. */
  error?: ReactNode
  /** A new address waiting for its verification link to be opened. */
  pendingEmail?: string | null
  /** Sends the verification link again; Resend Link is hidden without it. */
  onResendEmail?: () => void
  resendPending?: boolean
  /** Tells the page how many fields have unsaved changes, e.g. to ask before leaving. */
  onChangesChange?: (changes: number) => void
  onCancel?: () => void
  /** Places Cancel and Save; by default they sit in a row under the form. */
  renderActions?: (actions: ProfileFormActions) => ReactNode
}

/** The user's own details as rows of settings: what an administrator set, then what they can edit. */
export function ProfileBasicInformation({
  profile,
  ...props
}: ProfileBasicInformationProps) {
  if (!profile) return <ProfileBasicInformationSkeleton />
  return <ProfileForm profile={profile} {...props} />
}

function ProfileForm({
  profile,
  onSubmit,
  pending = false,
  error,
  pendingEmail,
  onResendEmail,
  resendPending = false,
  onChangesChange,
  onCancel,
  renderActions,
}: ProfileBasicInformationProps & { profile: Profile }) {
  const formId = useId()
  const { user, contact } = profile
  const emailVerified = contact?.emailVerified ?? false
  const savedEmail = contact?.email ?? ""

  const form = useAppForm({
    defaultValues: toProfileFormValues(profile),
    // Quiet until the first submit, then each field re-checks as it is corrected.
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "change",
    }),
    validators: { onDynamic: profileFormSchema },
    onSubmit: ({ value }) => onSubmit(value, profile),
  })
  // Only whether anything changed, so typing re-renders this page, not every part of it.
  const changes = useStore(form.store, (state) =>
    countProfileChanges(profile, state.values)
  )
  const changed = changes > 0

  const savedSignature = JSON.stringify([user.id, toProfileFormValues(profile)])
  const lastSaved = useRef(savedSignature)

  // Equivalent props must not replace a draft when a parent renders again.
  useEffect(() => {
    if (lastSaved.current === savedSignature) return
    lastSaved.current = savedSignature
    form.reset(toProfileFormValues(profile))
  }, [form, profile, savedSignature])
  useEffect(() => {
    onChangesChange?.(changes)
  }, [changes, onChangesChange])

  const actions: ProfileFormActions = {
    formId,
    changed,
    pending,
    cancel: () => {
      form.reset(toProfileFormValues(profile))
      onCancel?.()
    },
  }

  return (
    <>
      <form
        className="flex flex-col gap-4"
        id={formId}
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          if (changed) void form.handleSubmit()
        }}
      >
        {error && (
          <FormDialogError description={error} title="Could Not Save Profile" />
        )}
        {pendingEmail && (
          <Alert>
            <MailIcon />
            <AlertTitle>Email Change Pending</AlertTitle>
            <AlertDescription>
              {pendingEmail} is waiting to be verified. Open the link sent to it
              to start using it.
            </AlertDescription>
            {onResendEmail && (
              <AlertAction>
                <Button
                  disabled={resendPending}
                  onClick={onResendEmail}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {resendPending && <Spinner data-icon="inline-start" />}
                  Resend Link
                </Button>
              </AlertAction>
            )}
          </Alert>
        )}
        <SettingsList>
          <SettingsItem label="Username">{user.username}</SettingsItem>
          <SettingsItem label="Job Title">
            {user.jobTitle || <None />}
          </SettingsItem>
          <SettingsItem label="Home Facility">
            {user.homeFacility || <None />}
          </SettingsItem>
          <form.AppField name="firstName">
            {(field) => (
              <field.TextField
                autoComplete="given-name"
                label="First Name"
                layout="row"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="lastName">
            {(field) => (
              <field.TextField
                autoComplete="family-name"
                label="Last Name"
                layout="row"
                required
              />
            )}
          </form.AppField>
          <form.AppField name="email">
            {(field) => {
              const typed = field.state.value.trim()
              // The saved address shows whether it is verified; a new one, that it waits for its link.
              const isSaved = typed !== "" && typed === savedEmail
              return (
                <field.TextField
                  autoComplete="email"
                  badge={isSaved && <EmailStatus verified={emailVerified} />}
                  description={
                    typed &&
                    !isSaved &&
                    "A link to confirm this address will be sent to it. Your current address stays in use until then."
                  }
                  dir="ltr"
                  label="Email"
                  layout="row"
                  type="email"
                />
              )
            }}
          </form.AppField>
          <form.AppField name="phoneNumber">
            {(field) => (
              <field.TextField
                autoComplete="tel"
                dir="ltr"
                label="Phone Number"
                layout="row"
                type="tel"
              />
            )}
          </form.AppField>
          <form.Subscribe
            selector={(state) => state.values.email.trim() !== ""}
          >
            {(hasEmail) => (
              <form.AppField name="allowNotify">
                {(field) => (
                  <field.SwitchField
                    description={
                      emailVerified && hasEmail
                        ? "Get every notification your roles allow. Turn off to get none."
                        : "Verify your email address to turn this on."
                    }
                    disabled={!emailVerified || !hasEmail}
                    label="Allow Notifications"
                    layout="row"
                  />
                )}
              </form.AppField>
            )}
          </form.Subscribe>
        </SettingsList>
      </form>
      {renderActions ? (
        renderActions(actions)
      ) : (
        <div className="flex justify-end gap-2">
          <ProfileFormButtons actions={actions} saveLabel="Save Profile" />
        </div>
      )}
    </>
  )
}

function EmailStatus({ verified }: { verified: boolean }) {
  return verified ? (
    <StatusBadge tone="success">Verified</StatusBadge>
  ) : (
    <Badge variant="secondary">Not Verified</Badge>
  )
}

function None() {
  return <span className="text-muted-foreground">None</span>
}

const SKELETON_INPUTS = [
  { label: "First Name", required: true },
  { label: "Last Name", required: true },
  { label: "Email" },
  { label: "Phone Number" },
]

/** The rows while the profile loads: every row under its real label, with placeholders for the values. */
export function ProfileBasicInformationSkeleton() {
  return (
    <div aria-busy>
      <SettingsList>
        <SettingsItem label="Username">
          <SkeletonText className="w-24" />
        </SettingsItem>
        <SettingsItem label="Job Title">
          <SkeletonText className="w-32" />
        </SettingsItem>
        <SettingsItem label="Home Facility">
          <SkeletonText className="w-48" />
        </SettingsItem>
        {SKELETON_INPUTS.map(({ label, required }) => (
          <SettingsRowFrame
            key={label}
            label={
              <span className="text-sm">
                <FieldLabelText label={label} required={required} />
              </span>
            }
            value="control"
          >
            <Skeleton className="h-8 w-full" />
          </SettingsRowFrame>
        ))}
        <SettingsRowFrame
          description={
            <span className="flex h-5 items-center">
              <Skeleton className="h-3.5 w-64 max-w-full" />
            </span>
          }
          label={<span className="text-sm">Allow Notifications</span>}
        >
          {/* A plain element, since Skeleton owns its corner radius and a switch is round. */}
          <span className="h-4.5 w-8 animate-pulse rounded-full bg-muted" />
        </SettingsRowFrame>
      </SettingsList>
    </div>
  )
}

/** A bar inside one line of small text, so it takes the room the text will. */
function SkeletonText({ className }: { className: string }) {
  return (
    <span className="flex h-5 items-center justify-end">
      <Skeleton className={cn("h-3.5", className)} />
    </span>
  )
}
