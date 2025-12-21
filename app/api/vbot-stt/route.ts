import { NextRequest, NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"
import { createClient } from "@/lib/supabase/server"

// Gemini STT API Route - Transcribes user audio to text
// Uses Gemini 2.5 Flash for audio understanding

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!GOOGLE_API_KEY) {
      console.error("[VBot STT] GOOGLE_API_KEY not configured")
      return NextResponse.json({ error: "STT service not configured" }, { status: 500 })
    }

    // Get audio from FormData
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return NextResponse.json({ error: "Audio file is required" }, { status: 400 })
    }

    // Read file as buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Audio = buffer.toString("base64")

    // Determine MIME type
    const mimeType = audioFile.type || "audio/wav"

    const client = new GoogleGenAI({ apiKey: GOOGLE_API_KEY })

    // Transcribe audio using Gemini
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Transcribe this audio accurately. Return only the transcription text, nothing else. If the audio is unclear or empty, return an empty string.",
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio,
              },
            },
          ],
        },
      ],
    })

    const transcript = response.text?.trim() || ""

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error("[VBot STT Error]", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
