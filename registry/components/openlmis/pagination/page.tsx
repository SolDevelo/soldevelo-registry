"use client"

import { useState } from "react"

import { Pagination } from "./pagination"

export default function Page() {
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [rtlPageIndex, setRtlPageIndex] = useState(0)

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6 p-8 pb-44">
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
      {/* The range follows the surrounding text direction. */}
      <div dir="rtl">
        <Pagination
          onPageChange={setRtlPageIndex}
          onPageSizeChange={() => setRtlPageIndex(0)}
          pageIndex={rtlPageIndex}
          pageSize={10}
          rowCount={522}
        />
      </div>
    </div>
  )
}
