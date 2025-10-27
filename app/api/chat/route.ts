import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, model = "openai/gpt-4o-mini" }: { messages: UIMessage[]; model?: string } = await req.json()

  const prompt = convertToModelMessages(messages)

  console.log("[v0] Chat API - Model:", model)
  console.log("[v0] Chat API - Messages count:", messages.length)
  console.log(
    "[v0] Chat API - Has attachments:",
    messages.some((m) => m.experimental_attachments?.length),
  )

  const result = streamText({
    model: model,
    system:
      "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps. When analyzing images, describe what you see in detail and provide helpful context.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
