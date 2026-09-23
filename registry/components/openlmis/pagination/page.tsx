"use client"

import { useState } from "react"

import { Pagination } from "./pagination"

export default function Page() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  return (
    <div className="w-full max-w-3xl p-8">
      <Pagination
        onPageChange={setPageIndex}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPageIndex(0)
        }}
        pageIndex={pageIndex}
        pageSize={pageSize}
        rowCount={1211}
      />
    </div>
  )
}
