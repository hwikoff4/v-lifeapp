import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { env } from "@/lib/env"

// Proxy to Supabase Edge Function for TTS
// This route forwards the text to the vbot-tts edge function which uses Google Gemini

// Convert raw PCM (L16) audio to WAV format by adding a header
function pcmToWav(pcmData: Buffer, sampleRate: number = 24000, numChannels: number = 1, bitsPerSample: number = 16): Buffer {
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8)
  const blockAlign = numChannels * (bitsPerSample / 8)
  const dataSize = pcmData.length
  const headerSize = 44
  const fileSize = headerSize + dataSize - 8

  const header = Buffer.alloc(headerSize)
  
  // RIFF header
  header.write("RIFF", 0)
  header.writeUInt32LE(fileSize, 4)
  header.write("WAVE", 8)
  
  // fmt subchunk
  header.write("fmt ", 12)
  header.writeUInt32LE(16, 16) // Subchunk1Size (16 for PCM)
  header.writeUInt16LE(1, 20) // AudioFormat (1 = PCM)
  header.writeUInt16LE(numChannels, 22)
  header.writeUInt32LE(sampleRate, 24)
  header.writeUInt32LE(byteRate, 28)
  header.writeUInt16LE(blockAlign, 32)
  header.writeUInt16LE(bitsPerSample, 34)
  
  // data subchunk
  header.write("data", 36)
  header.writeUInt32LE(dataSize, 40)

  return Buffer.concat([header, pcmData])
}

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
      const pcmData = Buffer.from(data.audio, "base64")
      const mimeType = data.mimeType || "audio/l16"
      
      // If it's raw PCM (L16), convert to WAV for browser compatibility
      if (mimeType.includes("l16") || mimeType.includes("pcm")) {
        console.log("[VBot TTS Proxy] Converting PCM to WAV, size:", pcmData.length)
        const wavData = pcmToWav(pcmData)
        return new NextResponse(wavData, {
          status: 200,
          headers: {
            "Content-Type": "audio/wav",
            "Content-Length": wavData.length.toString(),
            "Cache-Control": "no-cache",
          },
        })
      }
      
      // For other formats, return as-is
      return new NextResponse(pcmData, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Length": pcmData.length.toString(),
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
