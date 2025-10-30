import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { xai } from "@ai-sdk/xai"

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
    model: xai("grok-beta", {
      apiKey: process.env.XAI_API_KEY,
    }),
    system:
      "You are Grok, a witty and helpful AI assistant created by xAI, now helping older adults learn about and use technology through Boomer AI. You specialize in providing clear, concise, and easy-to-understand answers with a touch of humor. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps. When analyzing images, describe what you see in detail and provide helpful context about what's in the image, what it might be used for, and any relevant information that would be helpful to someone learning about technology.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
