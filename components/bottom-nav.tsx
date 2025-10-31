"use client"

import { usePathname, useRouter } from "next/navigation"
import { Home, Dumbbell, Utensils, Users } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: Home, label: "Home", path: "/dashboard" },
  { icon: Dumbbell, label: "Fitness", path: "/fitness" },
  { icon: null, label: "V-Bot", path: "/chat", isVBot: true }, // Special V-Bot item
  { icon: Utensils, label: "Nutrition", path: "/nutrition" },
  { icon: Users, label: "Community", path: "/community" },
]

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-4 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.path

          // Special rendering for V-Bot
          if (item.isVBot) {
            return (
              <button
                key={item.path}
                className="flex flex-col items-center justify-center relative"
                onClick={() => router.push(item.path)}
              >
                <div
                  className={cn(
                    "inline-flex h-16 w-16 items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 absolute -top-12 shadow-lg",
                    "bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105",
                  )}
                  style={{
                    boxShadow: "0 0 15px hsl(51 100% 50%), 0 0 30px hsl(51 100% 50%)",
                  }}
                >
                  V-Bot
                </div>
              </button>
            )
          }

          // Regular navigation items
          return (
            <button
              key={item.path}
              className="flex flex-col items-center justify-center"
              onClick={() => router.push(item.path)}
            >
              <item.icon className={cn("h-6 w-6 transition-all", isActive ? "text-accent" : "text-white/60")} />
              <span
                className={cn("mt-1 text-xs transition-all", isActive ? "text-accent font-medium" : "text-white/60")}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
