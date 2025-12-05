"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Check, Zap, Crown, Star } from "lucide-react"

interface ManageSubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ManageSubscriptionModal({ isOpen, onClose }: ManageSubscriptionModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState<{
    plan: string
    status: string
    billing_cycle: string
    price: number
    next_billing_date: string | null
    payment_method_last4?: string | null
  } | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const loadSubscription = async () => {
      const { getSubscription } = await import("@/lib/actions/subscription")
      const record = await getSubscription()
      setSubscription(record)
    }
    loadSubscription()
  }, [isOpen])

  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      icon: Star,
      features: ["Basic workout plans", "Limited AI recommendations", "Track up to 3 habits", "Community access"],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: 29.99,
      icon: Zap,
      features: [
        "Unlimited AI-powered plans",
        "Personalized nutrition guidance",
        "Unlimited habit tracking",
        "Priority support",
        "Advanced analytics",
      ],
      popular: true,
    },
    {
      id: "elite",
      name: "Elite",
      price: 49.99,
      icon: Crown,
      features: [
        "Everything in Pro",
        "1-on-1 coaching sessions",
        "Custom meal plans",
        "Exclusive community",
        "Early access to features",
      ],
      popular: false,
    },
  ]

  const handleChangePlan = async (planId: string) => {
    setLoading(true)
    const { changeSubscriptionPlan } = await import("@/lib/actions/subscription")
    const result = await changeSubscriptionPlan(planId as "free" | "pro" | "elite")
    setLoading(false)
    if (!result.success) {
      toast({
        title: "Unable to change plan",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Plan updated",
      description: `You're now on the ${planId} plan.`,
    })
    const { getSubscription } = await import("@/lib/actions/subscription")
    const record = await getSubscription()
    setSubscription(record)
  }

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You'll lose access to Pro features.")) {
      return
    }

    setLoading(true)
    const { cancelSubscription } = await import("@/lib/actions/subscription")
    const result = await cancelSubscription()
    setLoading(false)
    if (!result.success) {
      toast({
        title: "Unable to cancel",
        description: result.error || "Please try again.",
        variant: "destructive",
      })
      return
    }
    toast({
      title: "Subscription cancelled",
      description: "You'll have access until the end of your billing period.",
    })
    const { getSubscription } = await import("@/lib/actions/subscription")
    const record = await getSubscription()
    setSubscription(record)
  }

  const currentPlan = subscription || {
    plan: "free",
    status: "active",
    billing_cycle: "monthly",
    price: 0,
    next_billing_date: null,
    payment_method_last4: null,
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-gradient-to-b from-black to-charcoal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <CreditCard className="h-5 w-5 text-accent" />
            Manage Subscription
          </DialogTitle>
          <DialogDescription className="text-white/70">
            View your current plan and make changes to your subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current Subscription */}
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-black/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Current Plan</h3>
                <Badge className="bg-accent text-black capitalize">{currentPlan.status}</Badge>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold text-accent capitalize">{currentPlan.plan}</div>
                <div className="text-white/70">
                  ${currentPlan.price}/{currentPlan.billing_cycle}
                </div>
              </div>

              <div className="space-y-2 text-sm text-white/70">
                <div className="flex justify-between">
                  <span>Billing Cycle:</span>
                  <span className="font-medium text-white">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Billing Date:</span>
                  <span className="font-medium text-white">
                    {currentPlan.next_billing_date ? currentPlan.next_billing_date : "Not scheduled"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="font-medium text-white">
                    {currentPlan.payment_method_last4 ? `•••• ${currentPlan.payment_method_last4}` : "Not on file"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Available Plans */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-white">Available Plans</h3>
            <div className="space-y-3">
              {plans.map((plan) => {
                const Icon = plan.icon
                const isCurrentPlan = plan.id === currentPlan.plan

                return (
                  <Card
                    key={plan.id}
                    className={`border-white/10 ${plan.popular ? "border-accent/30 bg-accent/5" : "bg-black/50"} backdrop-blur-sm`}
                  >
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5 text-accent" />
                          <div>
                            <h4 className="font-bold text-white">{plan.name}</h4>
                            <p className="text-sm text-white/70">
                              ${plan.price}
                              {plan.price > 0 && "/month"}
                            </p>
                          </div>
                        </div>
                        {plan.popular && <Badge className="bg-accent text-black text-xs">Popular</Badge>}
                        {isCurrentPlan && <Badge className="bg-white/10 text-white text-xs">Current</Badge>}
                      </div>

                      <ul className="mb-4 space-y-2 text-sm text-white/70">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {!isCurrentPlan && (
                        <ButtonGlow
                          variant={plan.popular ? "glow" : "outline-glow"}
                          className="w-full"
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={loading}
                        >
                      {plan.price > currentPlan.price ? "Upgrade" : plan.price === 0 ? "Downgrade" : "Switch"} to{" "}
                          {plan.name}
                        </ButtonGlow>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Billing History */}
          <Card className="border-white/10 bg-black/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="mb-3 font-bold text-white">Recent Billing History</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70">
                  <span>Oct 30, 2025</span>
                  <span className="font-medium text-white">$29.99</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Sep 30, 2025</span>
                  <span className="font-medium text-white">$29.99</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Aug 30, 2025</span>
                  <span className="font-medium text-white">$29.99</span>
                </div>
              </div>
              <ButtonGlow variant="outline-glow" className="mt-4 w-full" size="sm">
                View All Invoices
              </ButtonGlow>
            </CardContent>
          </Card>

          {/* Cancel Subscription */}
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <h3 className="mb-2 font-bold text-red-400">Cancel Subscription</h3>
            <p className="mb-3 text-sm text-white/70">
              You'll continue to have access until the end of your current billing period.
            </p>
            <ButtonGlow
              variant="outline-glow"
              className="w-full text-red-400 hover:text-red-300"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              Cancel Subscription
            </ButtonGlow>
          </div>
        </div>

        <div className="flex gap-3">
          <ButtonGlow variant="outline-glow" className="flex-1" onClick={onClose} disabled={loading}>
            Close
          </ButtonGlow>
        </div>
      </DialogContent>
    </Dialog>
  )
}
