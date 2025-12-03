"use client"

import { motion } from "framer-motion"
import { ArrowLeft, Briefcase } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { ButtonGlow } from "@/components/ui/button-glow"
import { useRouter } from "next/navigation"
import { Accordion } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { UpdateProfileModal } from "@/app/update-profile-modal"
import { getProfile, updateProfile } from "@/lib/actions/profile"
import { createClient } from "@/lib/supabase/client"
import { ChangePasswordModal } from "@/app/change-password-modal"
import { ManageSubscriptionModal } from "@/app/manage-subscription-modal"
import { getReferralStats } from "@/lib/actions/referrals"
import { getStreakStats, getMilestones } from "@/lib/actions/streaks"
import { getNotificationPreferences, updateNotificationPreferences } from "@/lib/actions/notifications"
import {
  requestNotificationPermission,
  registerServiceWorker,
  subscribeToPushNotifications,
  showLocalNotification,
} from "@/lib/notifications/push"
import { savePushSubscription } from "@/lib/actions/notifications"
import { exportUserData } from "@/lib/actions/export-data"
import { RateAppModal } from "@/components/rate-app-modal"
import { SettingsSkeleton } from "@/components/ui/skeleton-loaders"
import {
  AccountSection,
  ReferralsSection,
  NotificationsSection,
  StreaksSection,
  UnitsSection,
  PrivacySection,
  AboutSection,
} from "./components"
import type { ProfileFormData, ReferralStats, StreakStats, Milestone, NotificationPreferences } from "@/lib/types"

const defaultStreakStats: StreakStats = {
  overallStreak: 0,
  longestStreak: 0,
  totalDaysActive: 0,
  habitStreaks: [],
  weeklyActivity: [],
}

const defaultReferralStats: ReferralStats = {
  referralCode: "",
  creditsBalance: 0,
  referralsCount: 0,
  creditsEarned: 0,
}

const defaultNotificationPreferences: NotificationPreferences = {
  notificationsEnabled: true,
  workoutReminders: true,
  workoutReminderTime: "08:00",
  mealReminders: true,
  breakfastReminderTime: "08:00",
  lunchReminderTime: "12:00",
  dinnerReminderTime: "18:00",
  progressUpdates: true,
  streakWarnings: true,
  achievementNotifications: true,
  habitReminders: true,
}

export default function Settings() {
  const router = useRouter()
  const { toast } = useToast()

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [referralLoading, setReferralLoading] = useState(true)
  const [streaksLoading, setStreaksLoading] = useState(true)
  const [notificationLoading, setNotificationLoading] = useState(true)

  // UI states
  const [useMetric, setUseMetric] = useState(false)
  const [affiliateModalOpen, setAffiliateModalOpen] = useState(false)
  const [affiliateForm, setAffiliateForm] = useState({ name: "", email: "", phone: "" })
  const [submitting, setSubmitting] = useState(false)
  const [updateProfileModalOpen, setUpdateProfileModalOpen] = useState(false)
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)
  const [manageSubscriptionModalOpen, setManageSubscriptionModalOpen] = useState(false)
  const [rateAppModalOpen, setRateAppModalOpen] = useState(false)

  // Data states
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: "",
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
    goalWeight: "",
    primaryGoal: "",
    activityLevel: 3,
    gymAccess: "",
    selectedGym: "",
    customEquipment: "",
    allergies: [],
    customRestrictions: [],
    timezone: "America/New_York",
  })
  const [referralStats, setReferralStats] = useState<ReferralStats>(defaultReferralStats)
  const [streakStats, setStreakStats] = useState<StreakStats>(defaultStreakStats)
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(defaultNotificationPreferences)

  // Load all settings data
  const loadSettingsData = useCallback(async () => {
    setIsLoading(true)
    setReferralLoading(true)
    setStreaksLoading(true)
    setNotificationLoading(true)

    try {
      // Load all data in parallel
      const [profileResult, referralResult, streaksResult, milestonesResult, notifResult] = await Promise.all([
        getProfile(),
        getReferralStats(),
        getStreakStats(),
        getMilestones(),
        getNotificationPreferences(),
      ])

      // Handle profile
      if (profileResult.profile) {
        const profile = profileResult.profile
        setProfileData({
          name: profile.name || "",
          age: profile.age?.toString() || "",
          gender: profile.gender || "",
          heightFeet: profile.height_feet?.toString() || "",
          heightInches: profile.height_inches?.toString() || "",
          weight: profile.weight?.toString() || "",
          goalWeight: profile.goal_weight?.toString() || "",
          primaryGoal: profile.primary_goal || "",
          activityLevel: profile.activity_level || 3,
          gymAccess: profile.gym_access || "",
          selectedGym: profile.selected_gym || "",
          customEquipment: profile.custom_equipment || "",
          allergies: profile.allergies || [],
          customRestrictions: profile.custom_restrictions || [],
          timezone: profile.timezone || "America/New_York",
        })
      }

      // Handle referrals
      if (referralResult.stats) {
        setReferralStats(referralResult.stats)
      }

      // Handle streaks
      if (streaksResult.stats) {
        setStreakStats(streaksResult.stats)
      }
      if (milestonesResult.milestones) {
        setMilestones(milestonesResult.milestones)
      }

      // Handle notifications
      if (notifResult.preferences) {
        setNotificationPreferences(notifResult.preferences)
      }
      if (typeof window !== "undefined" && "Notification" in window) {
        setNotificationPermission(Notification.permission)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setReferralLoading(false)
      setStreaksLoading(false)
      setNotificationLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadSettingsData()
  }, [loadSettingsData])

  // Handlers
  const handleProfileUpdate = (newProfile: ProfileFormData) => {
    setProfileData(newProfile)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  }

  const handleTimezoneChange = async (newTimezone: string) => {
    const updatedProfile = { ...profileData, timezone: newTimezone }
    setProfileData(updatedProfile)

    const result = await updateProfile(updatedProfile)
    if (result.error) {
      toast({
        title: "Error",
        description: "Failed to update timezone",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Timezone Updated",
        description: "Your timezone has been saved. Habits will reset at midnight in your local time.",
      })
    }
  }

  const handleEnableNotifications = async () => {
    const permission = await requestNotificationPermission()
    setNotificationPermission(permission)

    if (permission === "granted") {
      const registration = await registerServiceWorker()
      if (registration) {
        const subscription = await subscribeToPushNotifications(registration)
        if (subscription) {
          await savePushSubscription(subscription)
          toast({
            title: "Notifications Enabled",
            description: "You'll now receive push notifications",
          })
          showLocalNotification("V-Life Notifications Enabled", {
            body: "You're all set! We'll keep you motivated.",
          })
        }
      }
      await updateNotificationPreferences({ notificationsEnabled: true })
      setNotificationPreferences({ ...notificationPreferences, notificationsEnabled: true })
    } else {
      toast({
        title: "Permission Denied",
        description: "Please enable notifications in your browser settings",
        variant: "destructive",
      })
    }
  }

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const updated = { ...notificationPreferences, [key]: value }
    setNotificationPreferences(updated as NotificationPreferences)
    await updateNotificationPreferences({ [key]: value } as Partial<NotificationPreferences>)
    toast({
      title: "Preferences Updated",
      description: "Your notification settings have been saved",
    })
  }

  const handleTimeChange = async (key: string, value: string) => {
    const updated = { ...notificationPreferences, [key]: value }
    setNotificationPreferences(updated as NotificationPreferences)
    await updateNotificationPreferences({ [key]: value } as Partial<NotificationPreferences>)
  }

  const handleExportData = async () => {
    toast({
      title: "Preparing Export",
      description: "Gathering your data...",
    })

    const result = await exportUserData()
    if (result.error) {
      toast({
        title: "Export Failed",
        description: result.error,
        variant: "destructive",
      })
      return
    }

    if (result.data) {
      const dataStr = JSON.stringify(result.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `vlife-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: "Your data has been downloaded as a JSON file",
      })
    }
  }

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signOut()

      if (error) {
        toast({
          title: "Error",
          description: "Failed to sign out. Please try again.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      })
      router.push("/")
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
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
        headers: { "Content-Type": "application/json" },
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
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const shareReferralCode = async (platform: string) => {
    const message = `Join me on V-Life! Use my code ${referralStats.referralCode} to get started.`
    const url = `https://vlife.app?ref=${referralStats.referralCode}`

    if (platform === "native" && navigator.share) {
      try {
        await navigator.share({ title: "Join V-Life", text: message, url })
      } catch {
        // User cancelled
      }
    }
  }

  // Show skeleton while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-charcoal pb-20">
        <div className="container max-w-md px-4 py-6">
          <div className="mb-6 flex items-center">
            <ButtonGlow variant="outline-glow" size="icon" onClick={() => router.back()} className="mr-3 h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </ButtonGlow>
            <div>
              <h1 className="text-2xl font-bold text-white">Settings</h1>
              <p className="text-white/70">Manage your preferences</p>
            </div>
          </div>
          <SettingsSkeleton />
        </div>
        <BottomNav />
      </div>
    )
  }

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
          <AccountSection
            loading={isLoading}
            profileData={profileData}
            onEditProfile={() => setUpdateProfileModalOpen(true)}
            onChangePassword={() => setChangePasswordModalOpen(true)}
            onManageSubscription={() => setManageSubscriptionModalOpen(true)}
            onSignOut={handleSignOut}
          />

          <ReferralsSection
            loading={referralLoading}
            stats={referralStats}
            onOpenAffiliateModal={() => setAffiliateModalOpen(true)}
          />

          <NotificationsSection
            loading={notificationLoading}
            permission={notificationPermission}
            preferences={notificationPreferences}
            onEnableNotifications={handleEnableNotifications}
            onToggle={handleNotificationToggle}
            onTimeChange={handleTimeChange}
            onTestNotification={() =>
              showLocalNotification("Test Notification", {
                body: "This is how your notifications will look!",
              })
            }
          />

          <UnitsSection
            useMetric={useMetric}
            timezone={profileData.timezone || "America/New_York"}
            onMetricChange={setUseMetric}
            onTimezoneChange={handleTimezoneChange}
          />

          <PrivacySection
            onPrivacyPolicy={() => router.push("/privacy-policy")}
            onTermsOfService={() => router.push("/terms-of-service")}
            onExportData={handleExportData}
            onDeleteAccount={() => {
              toast({
                title: "Delete Account",
                description: "Please contact support to delete your account.",
              })
            }}
          />

          <StreaksSection
            loading={streaksLoading}
            stats={streakStats}
            milestones={milestones}
          />

          <AboutSection
            onHelpSupport={() => router.push("/help-support")}
            onRateApp={() => setRateAppModalOpen(true)}
            onShare={() => shareReferralCode("native")}
          />
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
              Fill out the form below and we&apos;ll review your application within 2-3 business days.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="affiliate-name" className="text-white">Full Name</Label>
              <Input
                id="affiliate-name"
                placeholder="John Doe"
                value={affiliateForm.name}
                onChange={(e) => setAffiliateForm({ ...affiliateForm, name: e.target.value })}
                className="mt-2 border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>
            <div>
              <Label htmlFor="affiliate-email" className="text-white">Email Address</Label>
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
              <Label htmlFor="affiliate-phone" className="text-white">Phone Number</Label>
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
            <ButtonGlow
              variant="glow"
              className="flex-1"
              onClick={submitAffiliateApplication}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Application"}
            </ButtonGlow>
          </div>
        </DialogContent>
      </Dialog>

      <UpdateProfileModal
        isOpen={updateProfileModalOpen}
        onClose={() => setUpdateProfileModalOpen(false)}
        currentProfile={profileData}
        onUpdate={handleProfileUpdate}
      />

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
      />

      <ManageSubscriptionModal
        isOpen={manageSubscriptionModalOpen}
        onClose={() => setManageSubscriptionModalOpen(false)}
      />

      <RateAppModal
        isOpen={rateAppModalOpen}
        onClose={() => setRateAppModalOpen(false)}
      />

      <BottomNav />
    </div>
  )
}
