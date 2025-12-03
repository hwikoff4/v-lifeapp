"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function AICoach() {
  const srcURL = "https://kinestex.vercel.app"
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [userData, setUserData] = useState<any>(null)
  const [readyFromKX, setReadyFromKX] = useState(false)
  const [acked, setAcked] = useState(false)
  const retriesRef = useRef(0)
  const maxRetries = 3
  const RETRY_MS = 3000

  useEffect(() => {
    const fetchUserProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        console.log("[v0] No authenticated user found")
        return
      }

      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()

      if (error) {
        console.error("[v0] Error fetching profile:", error)
        return
      }

      if (profile) {
        const postData = {
          userId: user.id,
          company: "addy design begins",
          key: "Z23zkAEMkL1OrdO5z2T9HS0uR5igsAxY",
          style: "dark",
          age: profile.age || 30,
          height:
            profile.height_feet && profile.height_inches
              ? Math.round((profile.height_feet * 12 + profile.height_inches) * 2.54)
              : 175,
          weight: profile.weight || 70,
          gender: profile.gender === "male" ? "Male" : profile.gender === "female" ? "Female" : "Other",
        }
        setUserData(postData)
        console.log("[KX] User profile loaded:", postData)
      }
    }

    fetchUserProfile()
  }, [])

  useEffect(() => {
    if (!iframeRef.current) return
    iframeRef.current.onload = () => {
      console.log("[KX] iframe onload fired")
    }
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Only accept messages from KinesteX origin
      if (event.origin !== srcURL) return

      let msg: any = event.data
      // Some environments send strings; try parsing but do not require it
      if (typeof msg === "string") {
        try {
          msg = JSON.parse(msg)
        } catch {
          /* ignore */
        }
      }

      // Normalize type casing just in case
      const type = msg?.type?.toLowerCase?.()

      if (type === "kinestex_launched" || type === "kinestex_loaded") {
        console.log("[KX] Ready event from KinesteX:", type, msg)
        setReadyFromKX(true)
        return
      }

      if (type === "ack_init_user") {
        console.log("[KX] Received ACK for init user:", msg)
        setAcked(true)
        return
      }

      // Common event types per docs
      switch (type) {
        case "exercise_completed":
        case "plan_unlocked":
        case "workout_started":
        case "workout_completed":
        case "workout_overview":
        case "finished_workout":
        case "exit_kinestex":
        case "error_occurred":
          console.log("[KX] Event:", type, msg)
          break
        default:
          console.log("[KX] Unknown/other message:", msg)
      }
    }

    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  const sendInit = () => {
    if (!iframeRef.current?.contentWindow || !userData) return
    console.log("[KX] Posting init payload to KinesteX...", userData)
    // CRITICAL: Send RAW OBJECT with correct targetOrigin
    iframeRef.current.contentWindow.postMessage(userData, srcURL)
  }

  useEffect(() => {
    if (!readyFromKX || acked || !userData) return

    sendInit()

    const t = setTimeout(() => {
      if (!acked && retriesRef.current < maxRetries) {
        retriesRef.current += 1
        console.warn(`[KX] No ACK yet — retrying ${retriesRef.current}/${maxRetries}`)
        sendInit()
      } else if (!acked) {
        console.error("[KX] Timeout: Did not receive ACK from KinesteX after retries.")
      }
    }, RETRY_MS)

    return () => clearTimeout(t)
  }, [readyFromKX, acked, userData])

  return (
    <div className="relative w-full h-screen bg-black">
      <iframe
        ref={iframeRef}
        src={srcURL}
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
        }}
        allow="camera; microphone; autoplay; accelerometer; gyroscope; magnetometer"
        sandbox="allow-same-origin allow-scripts"
        allowFullScreen
      />
    </div>
  )
}
