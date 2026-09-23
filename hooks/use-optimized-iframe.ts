"use client"

import { type RefObject, useCallback, useEffect, useRef, useState } from "react"

type UseOptimizedIframeProps = {
  previewUrl: string
  containerRef: RefObject<HTMLElement | null>
  // Skip the intersection gate. Use for previews visible on first paint.
  eager?: boolean
  preloadMargin?: string
}

// Start loading before the card scrolls into view, so it is usually ready on arrival.
const PRELOAD_MARGIN = "600px 0px"

export function useOptimizedIframe({
  previewUrl,
  containerRef,
  eager = false,
  preloadMargin = PRELOAD_MARGIN,
}: UseOptimizedIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isRefreshingRef = useRef(false)
  const [shouldLoadIframe, setShouldLoadIframe] = useState(eager)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [loaded, setLoaded] = useState(false)
  // The rendered content's height, so the frame fits it at any width. Null until measured.
  const [contentHeight, setContentHeight] = useState<number | null>(null)

  // An eager frame is server-rendered, so its document can fire `load` before
  // React attaches onLoad. Reading readyState at commit catches up on that.
  const setIframeNode = useCallback((node: HTMLIFrameElement | null) => {
    iframeRef.current = node
    if (!node) return
    try {
      if (
        node.contentDocument?.readyState === "complete" &&
        node.contentWindow?.location.href !== "about:blank"
      ) {
        setLoaded(true)
      }
    } catch {
      // Cross-origin access throws; previews are same-origin, so fall back to onLoad.
    }
  }, [])

  const onIframeLoad = useCallback(() => setLoaded(true), [])

  // Re-attached on every load, since a refresh replaces the document being observed.
  useEffect(() => {
    if (!loaded) return

    const frameWindow = iframeRef.current?.contentWindow as
      | (Window & typeof globalThis)
      | null
      | undefined
    const content = iframeRef.current?.contentDocument?.querySelector(
      "[data-preview-content]"
    )
    if (!frameWindow || !content) return

    // The frame's own ResizeObserver, so it keeps firing for its document's layout.
    const observer = new frameWindow.ResizeObserver(() => {
      setContentHeight(Math.ceil(content.getBoundingClientRect().height))
    })
    observer.observe(content)

    return () => observer.disconnect()
  }, [loaded])

  useEffect(() => {
    if (eager) return

    const target = containerRef.current
    if (!target) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoadIframe(true)
          observer.disconnect()
        }
      },
      { threshold: 0, rootMargin: preloadMargin }
    )

    observer.observe(target)

    return () => observer.disconnect()
  }, [containerRef, eager, preloadMargin])

  const onRefreshIframe = useCallback(() => {
    if (!iframeRef.current || isRefreshingRef.current) return

    // Built before any state changes, so a bad URL cannot strand the button in "refreshing".
    const url = new URL(previewUrl, window.location.origin)
    url.searchParams.set("_refresh", Date.now().toString())

    isRefreshingRef.current = true
    setIsRefreshing(true)
    setLoaded(false)
    iframeRef.current.src = url.toString()

    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    refreshTimerRef.current = setTimeout(() => {
      refreshTimerRef.current = null
      isRefreshingRef.current = false
      setIsRefreshing(false)
    }, 300)
  }, [previewUrl])

  useEffect(
    () => () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    },
    []
  )

  return {
    setIframeNode,
    shouldLoadIframe,
    loaded,
    contentHeight,
    onIframeLoad,
    onRefreshIframe,
    isRefreshing,
  }
}
