import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"

export const maxDuration = 30

export async function POST(req: Request) {
  const {
    messages,
    model = "openai/gpt-4o-mini",
    capturedImage,
  }: { messages: UIMessage[]; model?: string; capturedImage?: string } = await req.json()

  console.log("[v0] Chat API - Model:", model)
  console.log("[v0] Chat API - Messages count:", messages.length)
  console.log("[v0] Chat API - Has captured image:", !!capturedImage)

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
    model: model,
    system:
      "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps. When analyzing images, describe what you see in detail and provide helpful context about what's in the image, what it might be used for, and any relevant information that would be helpful to someone learning about technology.",
    messages: prompt,
    abortSignal: req.signal,
  })

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  })
}
