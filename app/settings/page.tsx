"use client"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  Flame,
  Trophy,
  Calendar,
  TrendingUp,
  Award,
  Target,
  Zap,
  Bell,
  Lock,
  User,
  Ruler,
  Globe,
  Gift,
  Copy,
  Check,
  Share2,
  Mail,
  MessageCircle,
  Briefcase,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { BottomNav } from "@/components/bottom-nav"
import { ButtonGlow } from "@/components/ui/button-glow"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function Settings() {
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState(true)
  const [workoutReminders, setWorkoutReminders] = useState(true)
  const [mealReminders, setMealReminders] = useState(true)
  const [progressUpdates, setProgressUpdates] = useState(false)
  const [useMetric, setUseMetric] = useState(false)

  const [copied, setCopied] = useState(false)
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false)
  const [affiliateForm, setAffiliateForm] = useState({
    name: "",
    email: "",
    phone: "",
  })
  const [submitting, setSubmitting] = useState(false)

  const referralCode = "VLIFE-ALEX2024"
  const creditsBalance = 3
  const referralsCount = 7
  const creditsEarned = 21

  const copyReferralCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive",
      })
    }
  }

  const shareReferralCode = async (platform: string) => {
    const message = `Join me on V-Life! Use my code ${referralCode} to get started. Your Lifestyle. Your Plan. Powered by AI.`
    const url = `https://vlife.app?ref=${referralCode}`

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({
          title: "Join V-Life",
          text: message,
          url: url,
        })
      } catch (err) {
        console.log("Share cancelled")
      }
    } else if (platform === "email") {
      window.location.href = `mailto:?subject=Join me on V-Life&body=${encodeURIComponent(message + "\n\n" + url)}`
    } else if (platform === "sms") {
      window.location.href = `sms:?body=${encodeURIComponent(message + " " + url)}`
    }
  }

  const submitAffiliateApplication = async () => {
    if (!affiliateForm.name || !affiliateForm.email || !affiliateForm.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/affiliate-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(affiliateForm),
      })

      if (response.ok) {
        toast({
          title: "Application Submitted!",
          description: "We'll review your application and get back to you soon.",
        })
        setAffiliateModalOpen(false)
        setAffiliateForm({ name: "", email: "", phone: "" })
      } else {
        throw new Error("Failed to submit")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const overallStreak = 24
  const longestStreak = 45
  const totalDaysActive = 156

  const habitStreaks = [
    {
      id: 1,
      name: "Morning Workout",
      currentStreak: 12,
      longestStreak: 18,
      category: "fitness",
      lastCompleted: "Today",
      completionRate: 85,
      totalCompletions: 132,
    },
    {
      id: 2,
      name: "Protein Intake",
      currentStreak: 24,
      longestStreak: 45,
      category: "nutrition",
      lastCompleted: "Today",
      completionRate: 92,
      totalCompletions: 143,
    },
    {
      id: 3,
      name: "8 Glasses of Water",
      currentStreak: 8,
      longestStreak: 15,
      category: "nutrition",
      lastCompleted: "Today",
      completionRate: 78,
      totalCompletions: 121,
    },
    {
      id: 4,
      name: "Evening Stretch",
      currentStreak: 5,
      longestStreak: 12,
      category: "fitness",
      lastCompleted: "Yesterday",
      completionRate: 65,
      totalCompletions: 101,
    },
  ]

  const milestones = [
    { id: 1, name: "First Week", achieved: true, icon: Target, color: "text-accent" },
    { id: 2, name: "30 Day Warrior", achieved: false, icon: Trophy, color: "text-yellow-500" },
    { id: 3, name: "100 Day Legend", achieved: false, icon: Award, color: "text-purple-500" },
    { id: 4, name: "Consistency King", achieved: true, icon: Zap, color: "text-blue-500" },
  ]

  const weeklyActivity = [
    { day: "Mon", active: true },
    { day: "Tue", active: true },
    { day: "Wed", active: true },
    { day: "Thu", active: true },
    { day: "Fri", active: true },
    { day: "Sat", active: false },
    { day: "Sun", active: true },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
      <div className="container max-w-md px-4 py-6">
        {/* Header */}
        <motion.div
          className="mb-6 flex items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.back()} className="mr-3 h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </ButtonGlow>
          <div>
            <h1 className="text-2xl font-bold text-white">Settings</h1>
            <p className="text-white/70">Manage your preferences</p>
          </div>
        </motion.div>

        <Accordion type="multiple" className="space-y-4">
          {/* Account Settings */}
          <AccordionItem value="account" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <User className="h-5 w-5 text-accent" />
                Account
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Edit Profile
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Change Password
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Manage Subscription
                </ButtonGlow>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Referrals & Rewards Section */}
          <AccordionItem value="referrals" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Gift className="h-5 w-5 text-accent" />
                Referrals & Rewards
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                {/* Credits Balance */}
                <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-black/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">Your Credits</h3>
                      <Badge className="bg-accent text-black">{creditsBalance} Credits</Badge>
                    </div>

                    <div className="mb-4 text-center">
                      <div className="text-4xl font-bold text-accent">{creditsBalance}</div>
                      <div className="text-sm text-white/70">
                        {creditsBalance >= 12 ? "Free year available!" : `${12 - creditsBalance} more for a free year`}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Progress
                        value={(creditsBalance / 12) * 100}
                        className="h-2 bg-white/10"
                        indicatorClassName="bg-accent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-black/30 p-3 text-center">
                        <div className="text-2xl font-bold text-white">{referralsCount}</div>
                        <div className="text-xs text-white/60">Referrals</div>
                      </div>
                      <div className="rounded-lg bg-black/30 p-3 text-center">
                        <div className="text-2xl font-bold text-white">{creditsEarned}</div>
                        <div className="text-xs text-white/60">Credits Earned</div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-black/30 p-3 text-center text-xs text-white/70">
                      Earn 3 credits per referral • 12 credits = 1 free month
                    </div>
                  </CardContent>
                </Card>

                {/* Referral Code */}
                <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-bold text-white">Your Referral Code</h3>

                    <div className="mb-4 flex items-center gap-2">
                      <div className="flex-1 rounded-lg bg-white/5 p-3 text-center font-mono text-lg font-bold text-accent">
                        {referralCode}
                      </div>
                      <ButtonGlow
                        variant="outline-glow"
                        size="icon"
                        onClick={copyReferralCode}
                        className="h-12 w-12 shrink-0"
                      >
                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </ButtonGlow>
                    </div>

                    <div className="space-y-2">
                      <ButtonGlow
                        variant="outline-glow"
                        className="w-full justify-start"
                        onClick={() => shareReferralCode("native")}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Code
                      </ButtonGlow>
                      <div className="grid grid-cols-2 gap-2">
                        <ButtonGlow
                          variant="outline-glow"
                          className="justify-start"
                          onClick={() => shareReferralCode("email")}
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          Email
                        </ButtonGlow>
                        <ButtonGlow
                          variant="outline-glow"
                          className="justify-start"
                          onClick={() => shareReferralCode("sms")}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          SMS
                        </ButtonGlow>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Affiliate Program */}
                <Card className="border-white/10 bg-gradient-to-br from-black to-charcoal backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-accent" />
                      <h3 className="font-bold text-white">Affiliate Program</h3>
                    </div>
                    <p className="mb-4 text-sm text-white/70">
                      Earn more by becoming an official V-Life affiliate. Get exclusive benefits, higher commissions,
                      and marketing materials.
                    </p>
                    <ButtonGlow variant="glow" className="w-full" onClick={() => setAffiliateModalOpen(true)}>
                      <Briefcase className="mr-2 h-4 w-4" />
                      Become an Affiliate
                    </ButtonGlow>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Notifications */}
          <AccordionItem value="notifications" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Bell className="h-5 w-5 text-accent" />
                Notifications
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-white">
                    Push Notifications
                  </Label>
                  <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                </div>
                <Separator className="bg-white/10" />
                <div className="flex items-center justify-between">
                  <Label htmlFor="workout-reminders" className="text-white/80">
                    Workout Reminders
                  </Label>
                  <Switch
                    id="workout-reminders"
                    checked={workoutReminders}
                    onCheckedChange={setWorkoutReminders}
                    disabled={!notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="meal-reminders" className="text-white/80">
                    Meal Reminders
                  </Label>
                  <Switch
                    id="meal-reminders"
                    checked={mealReminders}
                    onCheckedChange={setMealReminders}
                    disabled={!notifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="progress-updates" className="text-white/80">
                    Progress Updates
                  </Label>
                  <Switch
                    id="progress-updates"
                    checked={progressUpdates}
                    onCheckedChange={setProgressUpdates}
                    disabled={!notifications}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Units & Measurements */}
          <AccordionItem value="units" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Ruler className="h-5 w-5 text-accent" />
                Units & Measurements
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="flex items-center justify-between pt-2">
                <div>
                  <Label htmlFor="units" className="text-white">
                    Use Metric System
                  </Label>
                  <p className="text-xs text-white/60">{useMetric ? "kg, cm, km" : "lbs, in, miles"}</p>
                </div>
                <Switch id="units" checked={useMetric} onCheckedChange={setUseMetric} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Privacy */}
          <AccordionItem value="privacy" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Lock className="h-5 w-5 text-accent" />
                Privacy & Data
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Privacy Policy
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Terms of Service
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Export My Data
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start text-red-500">
                  Delete Account
                </ButtonGlow>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Streaks Section */}
          <AccordionItem value="streaks" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Flame className="h-5 w-5 text-accent" />
                Streaks & Progress
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
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

                {/* Milestones */}
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">Milestones</h3>
                    <Trophy className="h-4 w-4 text-yellow-500" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {milestones.map((milestone) => {
                      const Icon = milestone.icon
                      return (
                        <Card
                          key={milestone.id}
                          className={`border-white/10 ${milestone.achieved ? "bg-accent/10 border-accent/30" : "bg-black/50"} backdrop-blur-sm`}
                        >
                          <CardContent className="p-4 text-center">
                            <Icon
                              className={`mx-auto mb-2 h-8 w-8 ${milestone.achieved ? milestone.color : "text-white/30"}`}
                            />
                            <h4 className={`text-sm font-bold ${milestone.achieved ? "text-white" : "text-white/50"}`}>
                              {milestone.name}
                            </h4>
                            {milestone.achieved && <div className="mt-1 text-xs text-accent">Unlocked!</div>}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

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
                      <li>• Don't break the chain - consistency is key!</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* About */}
          <AccordionItem value="about" className="border-white/10 rounded-lg bg-black/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2 text-lg font-bold text-white">
                <Globe className="h-5 w-5 text-accent" />
                About
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3 pt-2">
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Help & Support
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Rate the App
                </ButtonGlow>
                <ButtonGlow variant="outline-glow" className="w-full justify-start">
                  Share with Friends
                </ButtonGlow>
                <div className="pt-2 text-center text-xs text-white/50">Version 1.0.0</div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Affiliate Application Modal */}
      <Dialog open={affiliateModalOpen} onOpenChange={setAffiliateModalOpen}>
        <DialogContent className="border-white/10 bg-gradient-to-b from-black to-charcoal">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <Briefcase className="h-5 w-5 text-accent" />
              Become an Affiliate
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Fill out the form below and we'll review your application. We'll get back to you within 2-3 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="affiliate-name" className="text-white">
                Full Name
              </Label>
              <Input
                id="affiliate-name"
                placeholder="John Doe"
                value={affiliateForm.name}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label htmlFor="affiliate-email" className="text-white">
                Email Address
              </Label>
              <Input
                id="affiliate-email"
                type="email"
                placeholder="john@example.com"
                value={affiliateForm.email}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, email: e.target.value })}
                className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div>
              <Label htmlFor="affiliate-phone" className="text-white">
                Phone Number
              </Label>
              <Input
                id="affiliate-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={affiliateForm.phone}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, phone: e.target.value })}
                className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="rounded-lg bg-accent/10 p-3 text-sm text-white/70">
              <p className="mb-2 font-bold text-white">Affiliate Benefits:</p>
              <ul className="space-y-1 text-xs">
                <li>• Higher commission rates (up to 30%)</li>
                <li>• Exclusive marketing materials</li>
                <li>• Dedicated affiliate dashboard</li>
                <li>• Priority support</li>
              </ul>
            </div>
          </div>

          <div className="flex gap-3">
            <ButtonGlow
              variant="outline-glow"
              className="flex-1"
              onClick={() => setAffiliateModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </ButtonGlow>
            <ButtonGlow variant="glow" className="flex-1" onClick={submitAffiliateApplication} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Application"}
            </ButtonGlow>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  )
}
