"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Star, Heart, Share2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"

interface RateAppModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RateAppModal({ isOpen, onClose }: RateAppModalProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Tap the stars to rate your experience",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      // In a real app, you would send this to your backend
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Simulate API call
      console.log("Rating submitted:", { rating, feedback })

      setSubmitted(true)

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve V-Life",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setRating(0)
    setHoveredRating(0)
    setFeedback("")
    setSubmitted(false)
    onClose()
  }

  const shareApp = () => {
    const message = "Check out V-Life - Your personalized AI fitness and nutrition coach!"
    const url = "https://vlife.app"

    if (navigator.share) {
      navigator
        .share({
          title: "V-Life Fitness App",
          text: message,
          url: url,
        })
        .catch(() => {
          // User cancelled share
        })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${message} ${url}`)
      toast({
        title: "Link Copied!",
        description: "Share link copied to clipboard",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="border-white/10 bg-gradient-to-b from-black to-charcoal">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="rating-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <DialogHeader>
                <DialogTitle className="text-center text-white">Rate V-Life</DialogTitle>
                <DialogDescription className="text-center text-white/70">
                  How would you rate your experience?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* Star Rating */}
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={`h-12 w-12 ${
                          star <= (hoveredRating || rating) ? "fill-accent text-accent" : "fill-white/10 text-white/30"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>

                {/* Rating Text */}
                {rating > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-white/70"
                  >
                    {rating === 5 && "Amazing! We're so glad you love V-Life! 🎉"}
                    {rating === 4 && "Great! Thanks for your support! 💪"}
                    {rating === 3 && "Good! We'd love to hear how we can improve."}
                    {rating === 2 && "We're sorry to hear that. Please tell us what went wrong."}
                    {rating === 1 && "We apologize for your experience. Your feedback is valuable."}
                  </motion.div>
                )}

                {/* Feedback */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-white">Tell us more (optional)</label>
                  <Textarea
                    placeholder="What do you love? What could be better?"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="min-h-[100px] border-white/10 bg-white/5 text-white placeholder:text-white/40"
                  />
                </div>

                {/* Submit Button */}
                <ButtonGlow
                  variant="glow"
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting || rating === 0}
                >
                  {submitting ? "Submitting..." : "Submit Rating"}
                </ButtonGlow>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="thank-you"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Heart className="mx-auto mb-4 h-16 w-16 fill-accent text-accent" />
              </motion.div>

              <h3 className="mb-2 text-2xl font-bold text-white">Thank You!</h3>
              <p className="mb-6 text-white/70">Your feedback helps us make V-Life better for everyone.</p>

              {rating >= 4 && (
                <div className="mb-6 rounded-lg bg-accent/10 p-4">
                  <p className="mb-3 text-sm text-white">Love V-Life? Share it with your friends!</p>
                  <ButtonGlow variant="outline-glow" className="w-full" onClick={shareApp}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share V-Life
                  </ButtonGlow>
                </div>
              )}

              <ButtonGlow variant="glow" className="w-full" onClick={handleClose}>
                Done
              </ButtonGlow>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
