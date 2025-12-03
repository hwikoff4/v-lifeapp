"use client"

import { Ruler } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { COMMON_TIMEZONES } from "@/lib/utils/timezone"

interface UnitsSectionProps {
  useMetric: boolean
  timezone: string
  onMetricChange: (checked: boolean) => void
  onTimezoneChange: (timezone: string) => void
}

export function UnitsSection({
  useMetric,
  timezone,
  onMetricChange,
  onTimezoneChange,
}: UnitsSectionProps) {
  return (
    <AccordionItem value="units" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Ruler className="h-5 w-5 text-accent" />
          Units & Measurements
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="units" className="text-white">
                Use Metric System
              </Label>
              <p className="text-xs text-white/60">{useMetric ? "kg, cm, km" : "lbs, in, miles"}</p>
            </div>
            <Switch id="units" checked={useMetric} onCheckedChange={onMetricChange} />
          </div>

          <Separator className="bg-white/10" />

          <div>
            <Label htmlFor="timezone" className="text-white">
              Timezone
            </Label>
            <p className="text-xs text-white/60 mb-2">Habits reset at midnight in your timezone</p>
            <Select value={timezone} onValueChange={onTimezoneChange}>
              <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-black/95 text-white">
                {COMMON_TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value} className="text-white hover:bg-white/10">
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

