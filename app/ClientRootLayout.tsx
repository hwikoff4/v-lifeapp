"use client"

import type React from "react"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
})

export function ClientRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <style jsx global>{`
            h1, h2, h3, h4, h5, h6 {
              font-family: ${poppins.style.fontFamily}, ${inter.style.fontFamily}, sans-serif;
            }
          `}</style>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
