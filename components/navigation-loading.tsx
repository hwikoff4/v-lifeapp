"use client"

import { useEffect, useState, useCallback, useRef, memo } from "react"
import { usePathname } from "next/navigation"

export const NavigationLoading = memo(function NavigationLoading() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset loading state when pathname changes (navigation complete)
    setIsLoading(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }, [pathname])

  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement
    const link = target.closest("a")
    if (link?.href?.startsWith(window.location.origin)) {
      const href = new URL(link.href).pathname
      if (href !== pathname) {
        // Small delay before showing loading to avoid flashing on fast navigations
        timeoutRef.current = setTimeout(() => {
          setIsLoading(true)
        }, 250)
      }
    }
  }, [pathname])

  useEffect(() => {
    // Use passive listener for better scroll performance
    document.addEventListener("click", handleClick, { passive: true })
    return () => {
      document.removeEventListener("click", handleClick)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [handleClick])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-black/20">
      <div className="h-full bg-accent animate-pulse w-full" />
    </div>
  )
})

