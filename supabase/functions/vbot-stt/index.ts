import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

// VBot STT Edge Function - Transcribes user audio to text using Google Gemini

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const googleApiKey = Deno.env.get("GOOGLE_API_KEY")
    if (!googleApiKey) {
      console.error("[VBot STT] GOOGLE_API_KEY not configured")
      return new Response(
        JSON.stringify({ error: "STT service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create Supabase client to verify user
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Get audio from FormData
    const formData = await req.formData()
    const audioFile = formData.get("audio") as File | null

    if (!audioFile) {
      return new Response(
        JSON.stringify({ error: "Audio file is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Read file as buffer and convert to base64
    const arrayBuffer = await audioFile.arrayBuffer()
    const base64Audio = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    )

    // Determine MIME type
    const mimeType = audioFile.type || "audio/wav"

    console.log("[VBot STT] Processing audio:", {
      type: mimeType,
      size: arrayBuffer.byteLength,
      user: user.id,
    })

    // Call Google Gemini API for transcription
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
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
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[VBot STT] Gemini API error:", errorText)
      return new Response(
        JSON.stringify({ error: "Transcription failed", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const data = await response.json()
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""

    console.log("[VBot STT] Transcription complete:", transcript.slice(0, 100))

    return new Response(
      JSON.stringify({ transcript }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[VBot STT Error]", error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
