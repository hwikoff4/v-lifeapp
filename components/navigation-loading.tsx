"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function NavigationLoading() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Reset loading state when pathname changes (navigation complete)
    setIsLoading(false)
  }, [pathname])

  useEffect(() => {
    // Listen for link clicks to show loading indicator
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest("a")
      if (link && link.href && link.href.startsWith(window.location.origin)) {
        const href = new URL(link.href).pathname
        if (href !== pathname) {
          setIsLoading(true)
        }
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [pathname])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-black/20">
      <div 
        className="h-full bg-accent transition-all duration-300"
        style={{ 
          width: "100%",
          animation: "pulse 1.5s ease-in-out infinite" 
        }} 
      />
    </div>
  )
}

