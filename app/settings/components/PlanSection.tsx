"use client"

import { RotateCcw } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PlanSectionProps {
  isStartingFresh: boolean
  onStartFresh: () => void
}

export function PlanSection({ isStartingFresh, onStartFresh }: PlanSectionProps) {
  return (
    <AccordionItem value="plan" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <RotateCcw className="h-5 w-5 text-accent" />
          Training plan
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3 pt-2 text-sm text-white/80">
          <p className="text-white/70">
            Start fresh when you want a clean slate. We'll regenerate your workouts and nutrition using your latest data.
          </p>
          <ButtonGlow
            type="button"
            variant="outline-glow"
            className="w-full justify-start"
            onClick={(e) => {
              e.stopPropagation()
              onStartFresh()
            }}
            disabled={isStartingFresh}
          >
            {isStartingFresh ? "Starting..." : "Start fresh"}
          </ButtonGlow>
          <p className="text-white/50 text-xs">
            Tip: you rarely need this - use it after big changes or a long break.
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}


