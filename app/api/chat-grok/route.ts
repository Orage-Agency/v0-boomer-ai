import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { xai } from "@ai-sdk/xai"
import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit"

export const maxDuration = 30

export async function POST(req: Request) {
  // Rate limit: 30 chat requests per minute per IP.
  const limit = rateLimit(clientKey(req, "chat-grok"), 30, 60_000)
  if (!limit.ok) return tooManyRequests(limit.resetAt)

  const { messages, capturedImage }: { messages: UIMessage[]; capturedImage?: string } = await req.json()

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
    }
  }

  const prompt = await convertToModelMessages(processedMessages)

  const result = streamText({
    model: xai("grok-4", {
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
