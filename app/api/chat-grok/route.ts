import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { xai } from "@ai-sdk/xai"
import { BOOMER_AI_CHAT_SYSTEM_PROMPT } from "@/lib/chat-system-prompt"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, capturedImage }: { messages: UIMessage[]; capturedImage?: string } = await req.json()

  console.log("[v0] Grok Chat API - Messages count:", messages.length)
  console.log("[v0] Grok Chat API - Has captured image:", !!capturedImage)

  // Process messages with image if provided
  let processedMessages = messages
  if (capturedImage && messages.length > 0) {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === "user") {
      processedMessages = [
        ...messages.slice(0, -1),
        {
          ...lastMessage,
          content: [
            {
              type: "image" as const,
              image: capturedImage,
            },
            {
              type: "text" as const,
              text: typeof lastMessage.content === "string" ? lastMessage.content : lastMessage.content[0]?.text || "",
            },
          ],
        },
      ]
      console.log("[v0] Added image to last user message")
    }
  }

  const prompt = convertToModelMessages(processedMessages)

  const result = streamText({
    model: xai("grok-4", {
      apiKey: process.env.XAI_API_KEY,
    }),
    system: BOOMER_AI_CHAT_SYSTEM_PROMPT,
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
