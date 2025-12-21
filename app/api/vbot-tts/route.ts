import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createClient } from "@/lib/supabase/server"

// Gemini TTS API Route - Converts AI text responses to speech
// Uses Gemini 2.5 Flash Preview TTS for natural, conversational voice output

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!GOOGLE_AI_API_KEY) {
      console.error("[VBot TTS] GOOGLE_AI_API_KEY not configured")
      return NextResponse.json({ error: "TTS service not configured" }, { status: 500 })
    }

    const { text, voice = "Kore" } = await req.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Limit text length to prevent abuse (TTS has 32k token context limit)
    const truncatedText = text.slice(0, 4000)

    const client = new GoogleGenAI({ apiKey: GOOGLE_AI_API_KEY })

    // Generate speech with Gemini TTS
    // The model responds naturally to the text content
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: `Say in a warm, friendly coaching tone as a fitness AI assistant: ${truncatedText}`,
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: voice,
            },
          },
        },
      },
    })

    // Extract audio data from response
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data

    if (!audioData) {
      console.error("[VBot TTS] No audio data in response")
      return NextResponse.json({ error: "Failed to generate audio" }, { status: 500 })
    }

    // Convert base64 to binary
    const binaryData = Buffer.from(audioData, "base64")

    // Return as WAV audio stream
    return new NextResponse(binaryData, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": binaryData.length.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("[VBot TTS Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
