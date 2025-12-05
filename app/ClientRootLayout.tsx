"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { NavigationLoading } from "@/components/navigation-loading"

export function Providers({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <NavigationLoading />
      {children}
    </ThemeProvider>
  )
}

// Default export for compatibility
export default Providers