"use client"

import { useState } from "react"

import { CopyButton, CopyableValue } from "./copyable-value"

const apiKey = "8f3c2a1e-6b7d-4e9f-a0c5-2d1b3e4f5a6c"
const orderCode = "ORD-2024-000183"

export default function Page() {
  const [copied, setCopied] = useState<string>()
  const onCopiedChange = (next: boolean) => !next && setCopied(undefined)

  return (
    <div className="flex w-full max-w-md flex-col gap-4 p-8">
      <CopyableValue
        copied={copied === apiKey}
        copiedLabel="Key Copied"
        copyLabel="Copy Key"
        onCopiedChange={onCopiedChange}
        onCopy={setCopied}
        value={apiKey}
      />
      <div className="flex items-center gap-1">
        <span className="font-mono text-sm">{orderCode}</span>
        <CopyButton
          copied={copied === orderCode}
          copiedLabel="Code Copied"
          copyLabel="Copy Code"
          onCopiedChange={onCopiedChange}
          onCopy={setCopied}
          value={orderCode}
        />
      </div>
    </div>
  )
}
