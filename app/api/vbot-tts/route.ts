import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

// Proxy to Supabase Edge Function for TTS
// This route forwards the text to the vbot-tts edge function which uses Google Gemini

export async function POST(req: NextRequest) {
  try {
    // Verify authentication and get session
    const supabase = await createClient()
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await req.json()
    
    // Build the edge function URL
    const edgeFunctionUrl = `${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/vbot-tts`

    // Forward the request to the edge function
    const response = await fetch(edgeFunctionUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Edge function error" }))
      console.error("[VBot TTS Proxy] Edge function error:", errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    
    // The edge function returns { audio: base64, mimeType: string }
    // Convert to binary response for direct audio playback
    if (data.audio) {
      const binaryData = Buffer.from(data.audio, "base64")
      return new NextResponse(binaryData, {
        status: 200,
        headers: {
          "Content-Type": data.mimeType || "audio/wav",
          "Content-Length": binaryData.length.toString(),
          "Cache-Control": "no-cache",
        },
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[VBot TTS Proxy Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
