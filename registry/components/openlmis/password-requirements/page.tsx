"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { PasswordRequirements } from "./password-requirements"
import type { PasswordOwner } from "./password-rules"

const OWNER: PasswordOwner = {
  username: "divo1",
  firstName: "Grace",
  lastName: "Banda",
}

export default function Page() {
  // Part met, so both states of a rule show.
  const [password, setPassword] = useState("Stock2")

  return (
    <div className="flex w-full max-w-sm flex-col gap-3 p-8">
      <div className="flex flex-col gap-1">
        <Label htmlFor="password">New Password</Label>
        <Input
          aria-describedby="password-requirements"
          id="password"
          onChange={(event) => setPassword(event.target.value)}
          type="text"
          value={password}
        />
      </div>
      <PasswordRequirements
        id="password-requirements"
        owner={OWNER}
        password={password}
      />
    </div>
  )
}
