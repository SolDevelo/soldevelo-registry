"use client"

import type { PaginationState } from "@tanstack/react-table"
import { KeyRoundIcon } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"

import type { ServiceAccount } from "./service-account"
import {
  AddServiceAccountDialog,
  DeleteServiceAccountDialog,
} from "./service-account-form-dialog/service-account-form-dialog"
import {
  ServiceAccountsTable,
  ServiceAccountsToolbar,
} from "./service-accounts-table/service-accounts-table"
import {
  Workspace,
  WorkspaceContent,
  WorkspaceDescription,
  WorkspaceHeader,
  WorkspaceHeading,
  WorkspaceIcon,
  WorkspaceTitle,
} from "@/registry/blocks/openlmis/workspace/workspace"
import { Callout } from "@/registry/components/openlmis/callout/callout"

import { MOCK_NEW_TOKENS, MOCK_SERVICE_ACCOUNTS } from "./mock-service-accounts"

type Notice = {
  tone: "success" | "warning"
  title: string
  description: string
}

/** The service accounts screen; mount it from any route, e.g. the `page.tsx` this template ships. */
export function ServiceAccountsPage() {
  const [accounts, setAccounts] = useState(MOCK_SERVICE_ACCOUNTS)
  const [newestFirst, setNewestFirst] = useState(true)
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [adding, setAdding] = useState(false)
  const [created, setCreated] = useState<ServiceAccount>()
  const [deleting, setDeleting] = useState<string>()
  const [notice, setNotice] = useState<Notice>()
  // Mocked copy: a real app writes to the clipboard in onCopy, then sets this.
  const [copiedToken, setCopiedToken] = useState<string>()
  // Counts every add, so a new key never repeats one already listed or deleted.
  const added = useRef(0)

  // Every account is in memory, so sorting and paging happen here.
  const sorted = useMemo(
    () =>
      // oxlint-disable-next-line unicorn/no-array-sort -- sorts a copy
      [...accounts].sort((a, b) =>
        newestFirst
          ? b.createdDate.localeCompare(a.createdDate)
          : a.createdDate.localeCompare(b.createdDate)
      ),
    [accounts, newestFirst]
  )
  const lastPage = Math.max(
    0,
    Math.ceil(sorted.length / pagination.pageSize) - 1
  )
  // Deleting the last key on a page holds the table to the last page that exists.
  const page = useMemo(
    () => ({
      ...pagination,
      pageIndex: Math.min(pagination.pageIndex, lastPage),
    }),
    [pagination, lastPage]
  )
  const rows = useMemo(
    () =>
      sorted.slice(
        page.pageIndex * page.pageSize,
        (page.pageIndex + 1) * page.pageSize
      ),
    [sorted, page]
  )

  const openAdd = useCallback(() => {
    setNotice(undefined)
    setAdding(true)
  }, [])
  const openDelete = useCallback((token: string) => {
    setNotice(undefined)
    setDeleting(token)
  }, [])
  const onCopiedChange = useCallback((copied: boolean) => {
    if (!copied) setCopiedToken(undefined)
  }, [])
  const changeSort = useCallback((next: boolean) => {
    setNewestFirst(next)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }, [])

  const add = () => {
    const count = added.current++
    const base = MOCK_NEW_TOKENS[count % MOCK_NEW_TOKENS.length]
    const round = Math.floor(count / MOCK_NEW_TOKENS.length)
    const account = {
      // Past the fixtures, the round number replaces the key's tail so it stays unique.
      token:
        round === 0 || !base
          ? (base ?? `key-${count + 1}`)
          : `${base.slice(0, -4)}${round.toString(16).padStart(4, "0")}`,
      createdDate: new Date().toISOString(),
    }
    setAccounts((current) => [...current, account])
    setCreated(account)
  }
  const remove = (token: string) => {
    setAccounts((current) =>
      current.filter((account) => account.token !== token)
    )
    setNotice({
      tone: "success",
      title: "Service Account Deleted",
      description: `The key ${token} no longer works.`,
    })
    setDeleting(undefined)
  }

  return (
    <Workspace>
      <WorkspaceHeader>
        <WorkspaceHeading>
          <WorkspaceIcon>
            <KeyRoundIcon />
          </WorkspaceIcon>
          <WorkspaceTitle>Service Accounts</WorkspaceTitle>
          <WorkspaceDescription>
            API keys that let other systems use the OpenLMIS API.
          </WorkspaceDescription>
        </WorkspaceHeading>
      </WorkspaceHeader>
      <WorkspaceContent>
        <div className="flex flex-col gap-4 @4xl/main:gap-6">
          {notice && (
            <Callout title={notice.title} tone={notice.tone}>
              {notice.description}
            </Callout>
          )}
          <ServiceAccountsToolbar onAdd={openAdd} />
          <ServiceAccountsTable
            accounts={rows}
            newestFirst={newestFirst}
            onAdd={openAdd}
            copiedToken={copiedToken}
            onCopy={setCopiedToken}
            onCopiedChange={onCopiedChange}
            onDelete={openDelete}
            onNewestFirstChange={changeSort}
            onPaginationChange={setPagination}
            pagination={page}
            rowCount={sorted.length}
          />
        </div>
      </WorkspaceContent>
      <AddServiceAccountDialog
        created={created}
        onAdd={add}
        onClose={() => {
          setAdding(false)
          setCreated(undefined)
        }}
        copied={created !== undefined && copiedToken === created.token}
        onCopy={setCopiedToken}
        onCopiedChange={onCopiedChange}
        open={adding}
      />
      <DeleteServiceAccountDialog
        onClose={() => setDeleting(undefined)}
        copied={deleting !== undefined && copiedToken === deleting}
        onCopy={setCopiedToken}
        onCopiedChange={onCopiedChange}
        onDelete={remove}
        token={deleting}
      />
    </Workspace>
  )
}
