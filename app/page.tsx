"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ButtonGlow } from "@/components/ui/button-glow"
import { AnimatedRings } from "@/components/animated-rings"

export default function WelcomePage() {
  const router = useRouter()

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-black to-charcoal p-4">
      <AnimatedRings />

      <motion.div
        className="z-10 flex flex-col items-center justify-center text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="mb-6 text-6xl font-bold text-white"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <img src="/logo.png" alt="V-Life Logo" className="h-48 w-auto" />
        </motion.div>

        <motion.p
          className="mb-12 max-w-md text-xl text-white/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Your Lifestyle. Your Plan. <span className="text-accent">Powered by AI.</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <ButtonGlow
            variant="accent-glow"
            size="lg"
            onClick={() => router.push("/auth/signup")}
            className="text-base font-semibold"
          >
            Start Your 90-Second Quiz
          </ButtonGlow>
        </motion.div>
      </motion.div>
    </div>
  )
}
