import { z } from "zod"

/**
 * Environment variable validation schema
 * This ensures all required env vars are present at build/runtime
 */
const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  
  // OpenAI (optional in development)
  OPENAI_API_KEY: z.string().optional(),
  
  // Google API Key for Gemini TTS/STT (server-side)
  GOOGLE_API_KEY: z.string().optional(),
  
  // Google API Key for Gemini Live API (client-side, for development)
  // NOTE: For production, use a WebSocket proxy to keep this server-side
  NEXT_PUBLIC_GOOGLE_API_KEY: z.string().optional(),
  
  // App URL (optional - can be empty string during build)
  NEXT_PUBLIC_APP_URL: z.union([
    z.string().url(),
    z.literal(""),
  ]).optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
    NEXT_PUBLIC_GOOGLE_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    // Allow empty string for APP_URL during build
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || undefined,
  })

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:")
    console.error(parsed.error.flatten().fieldErrors)
    console.error("Current env values:", {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
    })
    throw new Error("Invalid environment variables")
  }

  return parsed.data
}

// Validate on import (fails fast)
export const env = validateEnv()

// Helper to check if we're in production
export const isProd = process.env.NODE_ENV === "production"

// Helper to check if we're in development
export const isDev = process.env.NODE_ENV === "development"

