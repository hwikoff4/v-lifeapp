"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { X, Loader2 } from "lucide-react"
import { ButtonGlow } from "@/components/ui/button-glow"

export default function AICoach() {
  const router = useRouter()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  const postData = {
    userId: "657",
    company: "addy design begins",
    key: "Z23zkAEMkL1OrdO5z2T9HS0uR5igsAxY",
    style: "dark",
    age: 30,
    height: 175,
    weight: 70,
    gender: "Female",
  }

  const srcURL = "https://kinestex.vercel.app"

  const sendMessage = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(postData, srcURL)
    } else {
      setTimeout(() => {
        try {
          iframeRef.current?.contentWindow?.postMessage(postData, srcURL)
        } catch {
          iframeRef.current?.contentWindow?.postMessage(postData, srcURL)
        }
      }, 100)
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== srcURL) return

      try {
        const message = JSON.parse(event.data)
        console.log("[v0] KinesteX message received:", message)

        switch (message.type) {
          case "kinestex_loaded":
            console.log("[v0] KinesteX loaded, sending initial data")
            sendMessage()
            break
          case "exercise_completed":
            console.log("[v0] Exercise completed:", message.data)
            break
          case "plan_unlocked":
            console.log("[v0] Workout plan unlocked:", message.data)
            break
          case "exit_kinestex":
            console.log("[v0] Exit KinesteX requested")
            router.back()
            break
          default:
            console.log("[v0] Unhandled message:", message)
        }
      } catch (e) {
        console.error("[v0] Failed to parse message:", e)
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [router])

  const handleIframeLoad = () => {
    console.log("[v0] Iframe loaded")
    setIsLoading(false)
    sendMessage()
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header with close button */}
      <motion.div
        className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/90 to-transparent p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-xl font-bold text-white">AI Fitness Coach</h1>
        <ButtonGlow variant="outline-glow" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </ButtonGlow>
      </motion.div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-accent" />
            <p className="mt-4 text-white/70">Loading AI Coach...</p>
          </div>
        </div>
      )}

      <div id="webViewContainer" className="h-full w-full">
        <iframe
          ref={iframeRef}
          id="webView"
          src={srcURL}
          frameBorder="0"
          allow="camera; microphone; autoplay; accelerometer; gyroscope; magnetometer"
          sandbox="allow-same-origin allow-scripts"
          allowFullScreen={true}
          onLoad={handleIframeLoad}
          className="h-full w-full"
        />
      </div>
    </div>
  )
}
