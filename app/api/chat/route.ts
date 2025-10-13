import { createOpenAI } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse()
}
