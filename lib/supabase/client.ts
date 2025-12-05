import { createBrowserClient } from "@supabase/ssr"
import { env } from "@/lib/env"

let clientInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  try {
    return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    throw error
  }
}

export function getSupabaseBrowserClient() {
  if (!clientInstance) {
    clientInstance = createClient()
  }
  return clientInstance
}
