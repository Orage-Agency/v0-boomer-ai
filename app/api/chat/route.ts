import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, model = "openai/gpt-4o-mini" }: { messages: UIMessage[]; model?: string } = await req.json()

  const prompt = convertToModelMessages(messages)

  const result = streamText({
    model: model,
    system:
      "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
