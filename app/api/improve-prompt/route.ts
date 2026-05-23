import { streamText } from "ai"
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Rate limit: 20 prompt-improvement requests per minute per IP.
    const limit = rateLimit(clientKey(req, "improve-prompt"), 20, 60_000)
    if (!limit.ok) return tooManyRequests(limit.resetAt)

    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    const { text } = await streamText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an expert at creating detailed, vivid image generation prompts. 
      
Take this simple prompt and enhance it to create a better image. Add specific details about:
- Visual style (sketch, watercolor, detailed, etc.)
- Lighting and mood
- Specific details and textures
- Composition and perspective

Keep it concise (2-3 sentences max) and focused on visual elements.

Original prompt: "${prompt}"

Enhanced prompt:`,
      temperature: 0.7,
      maxTokens: 150,
    })

    const improvedPrompt = await text

    return Response.json({ improvedPrompt })
  } catch (error) {
    console.error("Error improving prompt:", error)
    return Response.json({ error: "Failed to improve prompt" }, { status: 500 })
  }
}
