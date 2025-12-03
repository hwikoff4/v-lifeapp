"use client"

import { Flame, Trophy, TrendingUp, Target, Award, Zap, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { StreakCardSkeleton } from "@/components/ui/skeleton-loaders"
import type { StreakStats, Milestone } from "@/lib/types"

interface StreaksSectionProps {
  loading: boolean
  stats: StreakStats
  milestones: Milestone[]
}

const iconMap = {
  Target,
  Trophy,
  Award,
  Zap,
}

export function StreaksSection({ loading, stats, milestones }: StreaksSectionProps) {
  const { overallStreak, longestStreak, totalDaysActive, habitStreaks, weeklyActivity } = stats

  const milestonesWithIcons = milestones.map((milestone) => ({
    ...milestone,
    IconComponent: iconMap[milestone.icon as keyof typeof iconMap] || Zap,
  }))

  return (
    <AccordionItem value="streaks" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Flame className="h-5 w-5 text-accent" />
          Streaks & Progress
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="py-4">
            <StreakCardSkeleton />
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Overall Streak Stats */}
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-black/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Your Streak</h3>
                  <Flame className="h-6 w-6 text-accent" />
                </div>

                <div className="mb-4 text-center">
                  <div className="text-5xl font-bold text-accent">{overallStreak}</div>
                  <div className="text-sm text-white/70">Days in a row</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-black/30 p-3 text-center">
                    <div className="text-2xl font-bold text-white">{longestStreak}</div>
                    <div className="text-xs text-white/60">Longest Streak</div>
                  </div>
                  <div className="rounded-lg bg-black/30 p-3 text-center">
                    <div className="text-2xl font-bold text-white">{totalDaysActive}</div>
                    <div className="text-xs text-white/60">Total Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <h3 className="mb-3 text-sm font-bold text-white">This Week</h3>
                <div className="flex justify-between gap-2">
                  {weeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`h-10 w-full rounded ${day.active ? "bg-accent" : "bg-white/10"} transition-colors`}
                      />
                      <span className="text-xs text-white/60">{day.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Habit Streaks Details */}
            {habitStreaks.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Habit Streaks</h3>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </div>

                <div className="space-y-3">
                  {habitStreaks.map((habit) => (
                    <Card key={habit.id} className="border-white/10 bg-black/50 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-white">{habit.name}</h4>
                            <p className="text-xs text-white/60">Last: {habit.lastCompleted}</p>
                          </div>
                          <div className="flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1">
                            <Flame className="h-4 w-4 text-accent" />
                            <span className="text-sm font-bold text-accent">{habit.currentStreak}</span>
                          </div>
                        </div>

                        <div className="mb-2 flex items-center justify-between text-xs text-white/60">
                          <span>Completion Rate</span>
                          <span className="font-medium text-white">{habit.completionRate}%</span>
                        </div>
                        <Progress
                          value={habit.completionRate}
                          className="mb-3 h-2 bg-white/10"
                          indicatorClassName="bg-accent"
                        />

                        <div className="flex justify-between text-xs text-white/60">
                          <span>Best: {habit.longestStreak} days</span>
                          <span>Total: {habit.totalCompletions} times</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {milestonesWithIcons.length > 0 && (
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">Milestones</h3>
                  <Trophy className="h-4 w-4 text-yellow-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {milestonesWithIcons.map((milestone) => {
                    const Icon = milestone.IconComponent
                    return (
                      <Card
                        key={milestone.id}
                        className={`border-white/10 ${milestone.achieved ? "bg-accent/10 border-accent/30" : "bg-black/50"} backdrop-blur-sm`}
                      >
                        <CardContent className="p-4 text-center">
                          <Icon
                            className={`mx-auto mb-2 h-8 w-8 ${milestone.achieved ? milestone.color : "text-white/30"}`}
                          />
                          <h4
                            className={`text-sm font-bold ${milestone.achieved ? "text-white" : "text-white/50"}`}
                          >
                            {milestone.name}
                          </h4>
                          {milestone.achieved && <div className="mt-1 text-xs text-accent">Unlocked!</div>}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Streak Tips */}
            <Card className="border-white/10 bg-gradient-to-br from-black to-charcoal backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-accent" />
                  <h3 className="font-bold text-white">Streak Tips</h3>
                </div>
                <ul className="space-y-2 text-sm text-white/70">
                  <li>• Set reminders to complete habits at the same time daily</li>
                  <li>• Start with small, achievable habits to build momentum</li>
                  <li>• Track your progress visually to stay motivated</li>
                  <li>• Don&apos;t break the chain - consistency is key!</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

