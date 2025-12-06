import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const ALLOWED_ORIGIN = Deno.env.get("APP_ORIGIN") || Deno.env.get("NEXT_PUBLIC_APP_URL") || "*"
const corsHeaders = () => ({
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
})

// Generate embedding using OpenAI
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text.slice(0, 8000),
    }),
  })
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error("Embedding API error:", errorText)
    throw new Error("Failed to generate embedding")
  }
  
  const data = await response.json()
  return data.data[0].embedding
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() })
  }

  try {
    const adminToken = Deno.env.get("EMBEDDINGS_ADMIN_TOKEN")
    if (!adminToken) {
      throw new Error("EMBEDDINGS_ADMIN_TOKEN is not configured")
    }

    const providedToken = req.headers.get("x-admin-token")
    if (!providedToken || providedToken !== adminToken) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not configured")
    }

    // Create Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get all knowledge entries without embeddings
    const { data: knowledgeEntries, error: fetchError } = await supabase
      .from('vitalflow_habits_knowledge')
      .select('id, title, body, category, tags, goal_segments')
      .is('embedding', null)

    if (fetchError) {
      console.error("[PopulateEmbeddings] Fetch error:", fetchError)
      throw new Error("Failed to fetch knowledge entries")
    }

    if (!knowledgeEntries || knowledgeEntries.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "All entries already have embeddings",
          processed: 0 
        }),
        { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
      )
    }

    console.log(`[PopulateEmbeddings] Processing ${knowledgeEntries.length} entries...`)

    let processedCount = 0
    let errorCount = 0

    // Process each entry
    for (const entry of knowledgeEntries) {
      try {
        // Create a rich text representation for embedding
        const embeddingText = `
Title: ${entry.title}
Category: ${entry.category}
Tags: ${entry.tags?.join(', ') || 'none'}
Goals: ${entry.goal_segments?.join(', ') || 'general'}
Description: ${entry.body}
        `.trim()

        console.log(`[PopulateEmbeddings] Generating embedding for: ${entry.title}`)
        
        const embedding = await generateEmbedding(embeddingText, openaiApiKey)
        
        // Update the entry with the embedding
        const embeddingString = `[${embedding.join(',')}]`
        
        const { error: updateError } = await supabase
          .from('vitalflow_habits_knowledge')
          .update({ embedding: embeddingString })
          .eq('id', entry.id)

        if (updateError) {
          console.error(`[PopulateEmbeddings] Update error for ${entry.id}:`, updateError)
          errorCount++
        } else {
          processedCount++
          console.log(`[PopulateEmbeddings] ✓ Updated ${entry.title}`)
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (err) {
        console.error(`[PopulateEmbeddings] Error processing ${entry.id}:`, err)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount,
        errors: errorCount,
        total: knowledgeEntries.length,
        message: `Successfully processed ${processedCount} entries with ${errorCount} errors`
      }),
      { headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("[PopulateEmbeddings Error]", error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Internal server error" 
      }),
      { status: 500, headers: { ...corsHeaders(), "Content-Type": "application/json" } }
    )
  }
})

