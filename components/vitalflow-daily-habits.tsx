"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Sparkles, 
  Check, 
  X, 
  Info, 
  Loader2, 
  RefreshCw,
  Zap,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  Plus
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getVitalFlowSuggestions,
  generateVitalFlowSuggestions,
  updateSuggestionStatus,
  logHabitEvent,
  createManualVitalFlowHabit,
  type VitalFlowSuggestion,
} from "@/lib/actions/vitalflow-habits"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const categoryIcons: Record<string, string> = {
  movement: "🏃",
  nutrition: "🥗",
  sleep: "😴",
  mindset: "🧠",
  recovery: "💆",
  hydration: "💧",
}

const categoryColors: Record<string, string> = {
  movement: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  nutrition: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  sleep: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  mindset: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  recovery: "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  hydration: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
}

const skipReasons = [
  "Too busy",
  "Not feeling well",
  "Already did it",
  "Not relevant today",
]

interface VitalFlowDailyHabitsProps {
  className?: string
}

export function VitalFlowDailyHabits({ className = "" }: VitalFlowDailyHabitsProps) {
  const { toast } = useToast()
  const [suggestions, setSuggestions] = useState<VitalFlowSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(true)
  
  // Custom habit form state
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customTitle, setCustomTitle] = useState("")
  const [customCategory, setCustomCategory] = useState<'movement' | 'nutrition' | 'sleep' | 'mindset' | 'recovery' | 'hydration'>("movement")
  const [customTime, setCustomTime] = useState(10)
  const [customEnergy, setCustomEnergy] = useState(0)
  const [creatingCustom, setCreatingCustom] = useState(false)

  // Load suggestions on mount
  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    setLoading(true)
    try {
      // First try to get existing suggestions
      let result = await getVitalFlowSuggestions()
      
      if (!result.suggestions || result.suggestions.length === 0) {
        // If no suggestions exist, generate them
        result = await generateVitalFlowSuggestions()
      }

      if (result.suggestions) {
        setSuggestions(result.suggestions)
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error loading suggestions:", error)
      toast({
        title: "Error",
        description: "Failed to load VitalFlow habits",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    try {
      const result = await generateVitalFlowSuggestions("Regenerate fresh suggestions", true)
      
      if (result.suggestions) {
        setSuggestions(result.suggestions)
        toast({
          title: "Refreshed!",
          description: "New VitalFlow habits generated for you.",
        })
      } else if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error regenerating:", error)
      toast({
        title: "Error",
        description: "Failed to regenerate suggestions",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleAccept = async (suggestion: VitalFlowSuggestion) => {
    try {
      const result = await updateSuggestionStatus(suggestion.id, 'accepted')
      
      if (result.success) {
        setSuggestions(prev =>
          prev.map(s => s.id === suggestion.id ? { ...s, status: 'accepted' } : s)
        )
        toast({
          title: "Added to your day!",
          description: `"${suggestion.title}" is now on your list.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to accept habit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error accepting:", error)
    }
  }

  const handleSkip = async (suggestion: VitalFlowSuggestion, reason?: string) => {
    try {
      const result = await updateSuggestionStatus(suggestion.id, 'skipped', reason)
      
      if (result.success) {
        setSuggestions(prev =>
          prev.map(s => s.id === suggestion.id ? { ...s, status: 'skipped', skip_reason: reason } : s)
        )
        toast({
          title: "Skipped",
          description: "No problem, we'll adjust future suggestions.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to skip habit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error skipping:", error)
    }
  }

  const handleComplete = async (suggestion: VitalFlowSuggestion) => {
    try {
      const result = await updateSuggestionStatus(suggestion.id, 'completed', undefined, 1.0)
      
      if (result.success) {
        // Log the event for learning
        await logHabitEvent(suggestion.id, 'completed', 1.0)
        
        setSuggestions(prev =>
          prev.map(s => s.id === suggestion.id ? { ...s, status: 'completed', completion_ratio: 1.0 } : s)
        )
        toast({
          title: "Awesome! 🎉",
          description: `You completed "${suggestion.title}"!`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to mark complete",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error completing:", error)
    }
  }

  const handleCreateCustom = async () => {
    if (!customTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your custom habit",
        variant: "destructive",
      })
      return
    }

    setCreatingCustom(true)
    try {
      const result = await createManualVitalFlowHabit(
        customTitle.trim(),
        customCategory,
        customTime,
        customEnergy,
        `Custom habit created by user`
      )

      if (result.suggestion) {
        // Add to suggestions list
        setSuggestions(prev => [...prev, result.suggestion!])
        
        // Reset form
        setCustomTitle("")
        setCustomCategory("movement")
        setCustomTime(10)
        setCustomEnergy(0)
        setShowCustomForm(false)
        
        toast({
          title: "Custom habit added!",
          description: `"${customTitle}" is now on your daily list.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create custom habit",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("[VitalFlow] Error creating custom:", error)
      toast({
        title: "Error",
        description: "Failed to create custom habit",
        variant: "destructive",
      })
    } finally {
      setCreatingCustom(false)
    }
  }

  const activeSuggestions = suggestions.filter(s => s.status === 'suggested' || s.status === 'accepted')
  const completedCount = suggestions.filter(s => s.status === 'completed').length
  const totalEnergyDelta = suggestions
    .filter(s => s.status === 'accepted' || s.status === 'completed')
    .reduce((sum, s) => sum + s.energy_delta_kcal, 0)

  if (loading) {
    return (
      <Card className={`glass-card ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
            <span className="text-sm text-muted-foreground">Loading VitalFlow habits...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`glass-card overflow-hidden ${className}`}>
      {/* Header with gradient accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-full pointer-events-none" />
      
      <CardContent className="p-5 relative">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            >
              <Sparkles className="h-5 w-5 text-accent" />
            </motion.div>
            <h2 className="text-lg font-bold text-foreground">
              VitalFlow Daily Habits
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">
                    AI-suggested habits tuned to your goals and recent data. 
                    They guide your day without rewriting your whole plan.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonGlow
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={generating}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
              </ButtonGlow>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ButtonGlow
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </ButtonGlow>
            </motion.div>
          </div>
        </div>

        {/* Stats Row */}
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 mb-4 pb-4 border-b border-border/50"
          >
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">
                {completedCount} / {suggestions.length} completed
              </span>
            </div>
            {totalEnergyDelta > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-muted-foreground">
                  +{totalEnergyDelta} kcal today
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Suggestions List */}
        <AnimatePresence mode="popLayout">
          {isExpanded && activeSuggestions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-6"
            >
              <Zap className="h-12 w-12 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {suggestions.length === 0 
                  ? "No suggestions yet. Click refresh to generate!" 
                  : "All done! Great work today! 🎉"}
              </p>
            </motion.div>
          )}

          {isExpanded && activeSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="mb-3 last:mb-0"
            >
              <div
                className={`relative rounded-lg border bg-gradient-to-br ${categoryColors[suggestion.category]} p-4 transition-all duration-200`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-2xl">{categoryIcons[suggestion.category]}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {suggestion.title}
                        </h3>
                        {suggestion.source === 'manual' && (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{suggestion.time_minutes} min</span>
                        </div>
                        {suggestion.energy_delta_kcal > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Flame className="h-3 w-3" />
                            <span>+{suggestion.energy_delta_kcal} kcal</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason - Expandable */}
                {suggestion.reason && (
                  <div className="mb-3">
                    <button
                      onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Info className="h-3 w-3" />
                      Why this?
                    </button>
                    <AnimatePresence>
                      {expandedId === suggestion.id && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-xs text-foreground/70 mt-2 leading-relaxed"
                        >
                          {suggestion.reason}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {suggestion.status === 'suggested' && (
                    <>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <ButtonGlow
                          variant="accent-glow"
                          size="sm"
                          onClick={() => handleAccept(suggestion)}
                          className="w-full h-8 text-xs"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Accept
                        </ButtonGlow>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                        <ButtonGlow
                          variant="outline-glow"
                          size="sm"
                          onClick={() => handleSkip(suggestion, "Not today")}
                          className="w-full h-8 text-xs"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Skip
                        </ButtonGlow>
                      </motion.div>
                    </>
                  )}
                  
                  {suggestion.status === 'accepted' && (
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
                      <ButtonGlow
                        variant="accent-glow"
                        size="sm"
                        onClick={() => handleComplete(suggestion)}
                        className="w-full h-8 text-xs"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark Complete
                      </ButtonGlow>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Custom Habit Button/Form */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-4 border-t border-border/50"
            >
              {!showCustomForm ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomForm(true)}
                  className="w-full h-9 text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add custom daily habit
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-foreground">Create Custom Habit</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCustomForm(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-title" className="text-xs">Title *</Label>
                    <Input
                      id="custom-title"
                      placeholder="e.g., Evening walk with dog"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-category" className="text-xs">Category</Label>
                    <Select value={customCategory} onValueChange={(value: any) => setCustomCategory(value)}>
                      <SelectTrigger id="custom-category" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="movement">🏃 Movement</SelectItem>
                        <SelectItem value="nutrition">🥗 Nutrition</SelectItem>
                        <SelectItem value="sleep">😴 Sleep</SelectItem>
                        <SelectItem value="mindset">🧠 Mindset</SelectItem>
                        <SelectItem value="recovery">💆 Recovery</SelectItem>
                        <SelectItem value="hydration">💧 Hydration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-time" className="text-xs">Time (minutes)</Label>
                      <span className="text-xs text-muted-foreground">{customTime} min</span>
                    </div>
                    <Slider
                      id="custom-time"
                      min={5}
                      max={60}
                      step={5}
                      value={[customTime]}
                      onValueChange={(value) => setCustomTime(value[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="custom-energy" className="text-xs">Energy Impact (kcal)</Label>
                      <span className="text-xs text-muted-foreground">{customEnergy} kcal</span>
                    </div>
                    <Slider
                      id="custom-energy"
                      min={0}
                      max={200}
                      step={10}
                      value={[customEnergy]}
                      onValueChange={(value) => setCustomEnergy(value[0])}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCustomForm(false)}
                      disabled={creatingCustom}
                      className="flex-1 h-9"
                    >
                      Cancel
                    </Button>
                    <ButtonGlow
                      variant="accent-glow"
                      size="sm"
                      onClick={handleCreateCustom}
                      disabled={creatingCustom || !customTitle.trim()}
                      className="flex-1 h-9"
                    >
                      {creatingCustom ? "Adding..." : "Add Habit"}
                    </ButtonGlow>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

