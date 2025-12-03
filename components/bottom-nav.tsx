"use client"

import { usePathname, useRouter } from "next/navigation"
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

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  const isVBotActive = pathname === "/vbot"

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full border-t border-white/10 bg-black/90 backdrop-blur-lg pb-safe">
      <div className="mx-auto flex h-20 max-w-md items-end justify-between px-4 pb-2 relative">
        {/* Left nav items */}
        <div className="flex gap-2 mr-2">
          {leftNavItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <button
                key={item.path}
                className="flex flex-col items-center justify-center min-w-[60px]"
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

        <style jsx>{`
          @keyframes subtle-glow {
            0%, 100% {
              box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
            }
            50% {
              box-shadow: 0 0 25px rgba(255, 215, 0, 0.7);
            }
          }
          .animate-subtle-glow {
            animation: subtle-glow 3s ease-in-out infinite;
          }
        `}</style>

        <button
          onClick={() => router.push("/vbot")}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 -top-4 flex h-14 w-14 items-center justify-center rounded-full transition-all border-2 border-black",
            isVBotActive
              ? "bg-accent scale-105 shadow-[0_0_20px_rgba(255,215,0,0.6)]"
              : "bg-gradient-to-br from-accent to-accent/90 hover:scale-110 animate-subtle-glow",
          )}
        >
          <Bot className="h-7 w-7 text-black" strokeWidth={2.5} />
        </button>

        {/* Right nav items */}
        <div className="flex gap-2 ml-2">
          {rightNavItems.map((item) => {
            const isActive = pathname === item.path

            return (
              <button
                key={item.path}
                className="flex flex-col items-center justify-center min-w-[60px]"
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
    </div>
  )
}
