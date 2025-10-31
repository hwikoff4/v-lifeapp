import type React from "react"
import type { Metadata } from "next"
import { ClientRootLayout } from "./ClientRootLayout"
import "./globals.css"

export const metadata: Metadata = {
  title: "V-Life Fitness",
  description: "Your Lifestyle. Your Plan. Powered by AI.",
  keywords: ["fitness", "AI", "workout", "nutrition", "lifestyle", "health"],
  authors: [{ name: "V-Life Fitness" }],
  creator: "V-Life Fitness",
  publisher: "V-Life Fitness",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://v-life-fitness.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "V-Life Fitness",
    description: "Your Lifestyle. Your Plan. Powered by AI.",
    url: "https://v-life-fitness.vercel.app",
    siteName: "V-Life Fitness",
    images: [
      {
        url: "/logo.png",
        width: 1024,
        height: 1024,
        alt: "V-Life Fitness Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "V-Life Fitness",
    description: "Your Lifestyle. Your Plan. Powered by AI.",
    images: ["/logo.png"],
    creator: "@vlifefitness",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "V-Life Fitness",
    startupImage: [
      {
        url: "/logo.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/logo.png",
        media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/logo.png",
        media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  applicationName: "V-Life Fitness",
  referrer: "origin-when-cross-origin",
  category: "fitness",
  classification: "Health & Fitness",
  icons: {
    icon: [
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/logo.png", sizes: "152x152", type: "image/png" },
      { url: "/logo.png", sizes: "144x144", type: "image/png" },
      { url: "/logo.png", sizes: "120x120", type: "image/png" },
      { url: "/logo.png", sizes: "114x114", type: "image/png" },
      { url: "/logo.png", sizes: "76x76", type: "image/png" },
      { url: "/logo.png", sizes: "72x72", type: "image/png" },
      { url: "/logo.png", sizes: "60x60", type: "image/png" },
      { url: "/logo.png", sizes: "57x57", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/logo.png",
      },
    ],
  },
  manifest: "/manifest.json",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}
