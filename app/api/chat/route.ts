import { convertToModelMessages, streamText, type UIMessage } from "ai"
import { createOpenRouter } from "@ai-sdk/openrouter"

export const maxDuration = 30

const openrouter = createOpenRouter({
  apiKey: process.env.GEMINIFREEOPENROUTER,
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: openrouter("google/gemini-2.0-flash-exp:free"),
    system:
      "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
