import type React from "react"
import { OnboardingProvider } from "@/lib/contexts/onboarding-context"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <OnboardingProvider>{children}</OnboardingProvider>
}
