"use client"

import { Lock } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface PrivacySectionProps {
  onPrivacyPolicy: () => void
  onTermsOfService: () => void
  onExportData: () => void
  onDeleteAccount: () => void
}

export function PrivacySection({
  onPrivacyPolicy,
  onTermsOfService,
  onExportData,
  onDeleteAccount,
}: PrivacySectionProps) {
  return (
    <AccordionItem value="privacy" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Lock className="h-5 w-5 text-accent" />
          Privacy & Data
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-3 pt-2">
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onPrivacyPolicy}
          >
            Privacy Policy
          </ButtonGlow>
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onTermsOfService}
          >
            Terms of Service
          </ButtonGlow>
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start"
            onClick={onExportData}
          >
            Export My Data
          </ButtonGlow>
          <ButtonGlow
            variant="outline-glow"
            className="w-full justify-start text-red-500"
            onClick={onDeleteAccount}
          >
            Delete Account
          </ButtonGlow>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

