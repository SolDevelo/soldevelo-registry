import { Badge } from "@/components/ui/badge"

import { SettingsItem, SettingsList, SettingsRowFrame } from "./settings-list"

export default function Page() {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-3 p-8">
      <SettingsList>
        <SettingsItem label="Username">administrator</SettingsItem>
        <SettingsItem label="Home Facility">
          HC01 - Comfort Health Clinic
        </SettingsItem>
        <SettingsRowFrame
          badge={<Badge variant="secondary">Verified</Badge>}
          description={
            <p className="text-sm text-muted-foreground">
              Notifications are sent here.
            </p>
          }
          label={<span className="text-sm">Email</span>}
        >
          <span className="min-w-0 truncate text-sm font-medium">
            administrator@openlmis.org
          </span>
        </SettingsRowFrame>
        <SettingsItem label="Time Zone">
          Africa/Blantyre (UTC+02:00)
        </SettingsItem>
      </SettingsList>
    </div>
  )
}
