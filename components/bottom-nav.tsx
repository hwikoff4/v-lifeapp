"use client"

import { memo, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Home, Dumbbell, Utensils, Users, Bot } from "lucide-react"
import { cn } from "@/lib/utils"

const leftNavItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Dumbbell, label: "Fitness", path: "/fitness" },
]

const rightNavItems = [
  { icon: Utensils, label: "Nutrition", path: "/nutrition" },
  { icon: Users, label: "Community", path: "/community" },
]

// Memoized nav item to prevent unnecessary re-renders
const NavItem = memo(function NavItem({ 
  path, 
  label, 
  Icon, 
  isActive 
}: { 
  path: string
  label: string
  Icon: typeof Home
  isActive: boolean 
}) {
  return (
    <Link
      href={path}
      prefetch={true}
      className="flex flex-col items-center justify-center min-w-[60px]"
    >
      <Icon className={cn("h-6 w-6", isActive ? "text-accent" : "text-white/60")} />
      <span className={cn("mt-1 text-xs", isActive ? "text-accent font-medium" : "text-white/60")}>
        {label}
      </span>
    </Link>
  )
})

export const BottomNav = memo(function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const isVBotActive = pathname === "/vbot"

  // Prefetch main app routes to reduce perceived navigation latency
  useEffect(() => {
    const routesToPrefetch = ["/dashboard", "/fitness", "/nutrition", "/community", "/vbot", "/settings"]
    routesToPrefetch.forEach((route) => {
      try {
        // Next.js prefetch returns void in the App Router, so just fire and forget
        router.prefetch(route)
      } catch {
        // Ignore prefetch errors (e.g., during development or offline)
      }
    })
  }, [router])

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/90 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex h-20 max-w-md items-end justify-between px-4 pb-2 relative">
        {/* Left nav items */}
        <div className="flex gap-2 mr-2">
          {leftNavItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              label={item.label}
              Icon={item.icon}
              isActive={pathname === item.path}
            />
          ))}
        </div>

        <Link
          href="/vbot"
          prefetch={true}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-black",
            isVBotActive
              ? "bg-accent scale-105 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              : "bg-gradient-to-br from-accent to-accent/90 hover:scale-110 shadow-[0_0_15px_rgba(255,215,0,0.5)]",
          )}
        >
          <Bot className="h-7 w-7 text-black" strokeWidth={2.5} />
        </Link>

        {/* Right nav items */}
        <div className="flex gap-2 ml-2">
          {rightNavItems.map((item) => (
            <NavItem
              key={item.path}
              path={item.path}
              label={item.label}
              Icon={item.icon}
              isActive={pathname === item.path}
            />
          ))}
        </div>
      </div>
    </div>
  )
})
