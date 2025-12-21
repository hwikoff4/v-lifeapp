"use client"

import { Mic, Volume2, Play } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ButtonGlow } from "@/components/ui/button-glow"
import { GEMINI_VOICES, type VoicePreferences, type GeminiVoiceName } from "@/lib/types"
import { useState } from "react"

interface VoiceSectionProps {
  loading: boolean
  preferences: VoicePreferences
  onToggle: (key: keyof VoicePreferences, value: boolean) => void
  onVoiceChange: (voice: GeminiVoiceName) => void
  onPreviewVoice: (voice: GeminiVoiceName) => void
}

export function VoiceSection({
  loading,
  preferences,
  onToggle,
  onVoiceChange,
  onPreviewVoice,
}: VoiceSectionProps) {
  const [isPreviewing, setIsPreviewing] = useState(false)

  const handlePreview = async () => {
    if (isPreviewing) return
    setIsPreviewing(true)
    try {
      await onPreviewVoice(preferences.selectedVoice)
    } finally {
      setIsPreviewing(false)
    }
  }

  // Group voices by style for easier selection
  const voicesByStyle = GEMINI_VOICES.reduce((acc, voice) => {
    if (!acc[voice.style]) {
      acc[voice.style] = []
    }
    acc[voice.style].push(voice)
    return acc
  }, {} as Record<string, typeof GEMINI_VOICES>)

  return (
    <AccordionItem value="voice" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Mic className="h-5 w-5 text-accent" />
          Voice & Audio
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="py-4 text-center text-white/60">Loading preferences...</div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Master Voice Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="voice-enabled" className="text-white font-bold">
                  Voice Features
                </Label>
                <p className="text-xs text-white/60">
                  Enable voice input and audio responses in VBot
                </p>
              </div>
              <Switch
                id="voice-enabled"
                checked={preferences.voiceEnabled}
                onCheckedChange={(checked) => onToggle("voiceEnabled", checked)}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Voice Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voice-select" className="text-white">
                    VBot Voice
                  </Label>
                  <p className="text-xs text-white/60">
                    Choose VBot&apos;s speaking voice
                  </p>
                </div>
                <ButtonGlow
                  variant="outline-glow"
                  size="sm"
                  onClick={handlePreview}
                  disabled={!preferences.voiceEnabled || isPreviewing}
                  className="h-8"
                >
                  <Play className="mr-1 h-3 w-3" />
                  {isPreviewing ? "Playing..." : "Preview"}
                </ButtonGlow>
              </div>
              <Select
                value={preferences.selectedVoice}
                onValueChange={(value) => onVoiceChange(value as GeminiVoiceName)}
                disabled={!preferences.voiceEnabled}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-white">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-black/95 text-white max-h-60">
                  {Object.entries(voicesByStyle).map(([style, voices]) => (
                    <div key={style}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-accent/80">
                        {style}
                      </div>
                      {voices.map((voice) => (
                        <SelectItem
                          key={voice.name}
                          value={voice.name}
                          className="text-white hover:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <Volume2 className="h-3 w-3 text-white/40" />
                            {voice.name}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator className="bg-white/10" />

            {/* Auto-play Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="auto-play" className="text-white">
                  Auto-play Responses
                </Label>
                <p className="text-xs text-white/60">
                  Automatically speak VBot&apos;s responses
                </p>
              </div>
              <Switch
                id="auto-play"
                checked={preferences.autoPlayResponses}
                onCheckedChange={(checked) => onToggle("autoPlayResponses", checked)}
                disabled={!preferences.voiceEnabled}
              />
            </div>

            {/* Info Note */}
            <div className="rounded-lg bg-accent/10 p-3 text-xs text-white/70">
              <p className="flex items-start gap-2">
                <Mic className="h-4 w-4 flex-shrink-0 text-accent mt-0.5" />
                <span>
                  Tap the microphone button in VBot to speak your message. 
                  Your speech will be transcribed and sent to VBot automatically.
                </span>
              </p>
            </div>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
