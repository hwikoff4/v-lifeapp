"use client"

import { Globe } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface AboutSectionProps {
  onHelpSupport: () => void
  onRateApp: () => void
  onShare: () => void
}

export function AboutSection({ onHelpSupport, onRateApp, onShare }: AboutSectionProps) {
  return (
    <AccordionItem value="about" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Globe className="h-5 w-5 text-accent" />
          About
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3 pt-2">
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onHelpSupport}
          >
            Help & Support
          </ButtonGlow>
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onRateApp}
          >
            Rate the App
          </ButtonGlow>
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onShare}
          >
            Share with Friends
          </ButtonGlow>
          <div className="pt-2 text-center text-xs text-white/50">Version 1.0.0</div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

