"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"

export default function Confirmation() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-black to-charcoal p-4">
      <motion.div
        className="mx-auto w-full max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-black/50"
        >
          <CheckCircle className="h-16 w-16 text-accent animate-glow" />
        </motion.div>

        <motion.h1
          className="mb-3 text-3xl font-bold text-white"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Profile Complete!
        </motion.h1>

        <motion.p
          className="mb-8 text-white/70"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          We're generating your personalized fitness and nutrition plan.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <ButtonGlow
            variant="accent-glow"
            size="lg"
            onClick={() => router.push("/dashboard")}
            className="text-base font-semibold"
          >
            Generate My Plan
          </ButtonGlow>
        </motion.div>
      </motion.div>
    </div>
  )
}
