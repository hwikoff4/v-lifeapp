"use client"

import { Bell, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { NotificationPreferences } from "@/lib/types"

interface NotificationsSectionProps {
  loading: boolean
  permission: NotificationPermission
  preferences: NotificationPreferences
  onEnableNotifications: () => void
  onToggle: (key: string, value: boolean) => void
  onTimeChange: (key: string, value: string) => void
  onTestNotification: () => void
}

export function NotificationsSection({
  loading,
  permission,
  preferences,
  onEnableNotifications,
  onToggle,
  onTimeChange,
  onTestNotification,
}: NotificationsSectionProps) {
  return (
    <AccordionItem value="notifications" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center gap-2 text-lg font-bold text-white">
          <Bell className="h-5 w-5 text-accent" />
          Notifications
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="py-4 text-center text-white/60">Loading preferences...</div>
        ) : (
          <div className="space-y-4 pt-2">
            {/* Master Toggle */}
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-black/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Label htmlFor="notifications" className="text-white font-bold">
                      Push Notifications
                    </Label>
                    <p className="text-xs text-white/60 mt-1">
                      {permission === "granted"
                        ? "Enabled - You'll receive timely reminders"
                        : permission === "denied"
                          ? "Blocked - Enable in browser settings"
                          : "Enable to receive workout and meal reminders"}
                    </p>
                  </div>
                  {permission === "granted" ? (
                    <Switch
                      id="notifications"
                      checked={preferences.notificationsEnabled}
                      onCheckedChange={(checked) => onToggle("notificationsEnabled", checked)}
                    />
                  ) : (
                    <ButtonGlow variant="glow" size="sm" onClick={onEnableNotifications}>
                      Enable
                    </ButtonGlow>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator className="bg-white/10" />

            {/* Workout Reminders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="workout-reminders" className="text-white">
                    Workout Reminders
                  </Label>
                  <p className="text-xs text-white/60">Daily reminder to complete your workout</p>
                </div>
                <Switch
                  id="workout-reminders"
                  checked={preferences.workoutReminders}
                  onCheckedChange={(checked) => onToggle("workoutReminders", checked)}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>
              {preferences.workoutReminders && (
                <div className="ml-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent" />
                  <Input
                    type="time"
                    value={preferences.workoutReminderTime}
                    onChange={(e) => onTimeChange("workoutReminderTime", e.target.value)}
                    className="w-32 border-white/10 bg-white/5 text-white"
                    disabled={!preferences.notificationsEnabled}
                  />
                </div>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Meal Reminders */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label htmlFor="meal-reminders" className="text-white">
                    Meal Reminders
                  </Label>
                  <p className="text-xs text-white/60">Reminders to log your meals</p>
                </div>
                <Switch
                  id="meal-reminders"
                  checked={preferences.mealReminders}
                  onCheckedChange={(checked) => onToggle("mealReminders", checked)}
                  disabled={!preferences.notificationsEnabled}
                />
              </div>
              {preferences.mealReminders && (
                <div className="ml-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Breakfast</span>
                    <Input
                      type="time"
                      value={preferences.breakfastReminderTime}
                      onChange={(e) => onTimeChange("breakfastReminderTime", e.target.value)}
                      className="w-32 border-white/10 bg-white/5 text-white"
                      disabled={!preferences.notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Lunch</span>
                    <Input
                      type="time"
                      value={preferences.lunchReminderTime}
                      onChange={(e) => onTimeChange("lunchReminderTime", e.target.value)}
                      className="w-32 border-white/10 bg-white/5 text-white"
                      disabled={!preferences.notificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Dinner</span>
                    <Input
                      type="time"
                      value={preferences.dinnerReminderTime}
                      onChange={(e) => onTimeChange("dinnerReminderTime", e.target.value)}
                      className="w-32 border-white/10 bg-white/5 text-white"
                      disabled={!preferences.notificationsEnabled}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="bg-white/10" />

            {/* Habit Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="habit-reminders" className="text-white">
                  Habit Reminders
                </Label>
                <p className="text-xs text-white/60">Daily reminders for your habits</p>
              </div>
              <Switch
                id="habit-reminders"
                checked={preferences.habitReminders}
                onCheckedChange={(checked) => onToggle("habitReminders", checked)}
                disabled={!preferences.notificationsEnabled}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Streak Warnings */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="streak-warnings" className="text-white">
                  Streak Warnings
                </Label>
                <p className="text-xs text-white/60">Alert when you&apos;re about to break a streak</p>
              </div>
              <Switch
                id="streak-warnings"
                checked={preferences.streakWarnings}
                onCheckedChange={(checked) => onToggle("streakWarnings", checked)}
                disabled={!preferences.notificationsEnabled}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Achievement Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="achievement-notifications" className="text-white">
                  Achievement Notifications
                </Label>
                <p className="text-xs text-white/60">Celebrate milestones and achievements</p>
              </div>
              <Switch
                id="achievement-notifications"
                checked={preferences.achievementNotifications}
                onCheckedChange={(checked) => onToggle("achievementNotifications", checked)}
                disabled={!preferences.notificationsEnabled}
              />
            </div>

            <Separator className="bg-white/10" />

            {/* Progress Updates */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="progress-updates" className="text-white">
                  Progress Updates
                </Label>
                <p className="text-xs text-white/60">Weekly progress summaries</p>
              </div>
              <Switch
                id="progress-updates"
                checked={preferences.progressUpdates}
                onCheckedChange={(checked) => onToggle("progressUpdates", checked)}
                disabled={!preferences.notificationsEnabled}
              />
            </div>

            {/* Test Notification Button */}
            {permission === "granted" && preferences.notificationsEnabled && (
              <ButtonGlow
                variant="outline-glow"
                className="w-full mt-4"
                onClick={onTestNotification}
              >
                Send Test Notification
              </ButtonGlow>
            )}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}

