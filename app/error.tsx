"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"
import { Card, CardContent } from "@/components/ui/card"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("[Error Boundary]", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-charcoal flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-red-500/30 bg-black/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-red-500/20 p-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            
            <p className="text-white/70 mb-6">
              We encountered an unexpected error. Don&apos;t worry, your data is safe.
            </p>

            {error.digest && (
              <p className="text-xs text-white/40 mb-4 font-mono">
                Error ID: {error.digest}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <ButtonGlow
                variant="accent-glow"
                className="flex-1"
                onClick={reset}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </ButtonGlow>
              
              <ButtonGlow
                variant="outline-glow"
                className="flex-1"
                onClick={() => window.location.href = "/dashboard"}
              >
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </ButtonGlow>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-white/40 text-sm mt-4">
          If this problem persists, please contact support.
        </p>
      </motion.div>
    </div>
  )
}

