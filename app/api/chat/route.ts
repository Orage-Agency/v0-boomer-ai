import { consumeStream, convertToModelMessages, gateway, streamText, type UIMessage } from "ai"
import { containsProhibitedContent } from "@/lib/content-moderation"
import { BOOMER_AI_CHAT_SYSTEM_PROMPT } from "@/lib/chat-system-prompt"

export const maxDuration = 60

export async function POST(req: Request) {
  console.log("[v0] Chat API called")
  try {
    const body = await req.json()
    console.log("[v0] Chat API received body keys:", Object.keys(body))
    
    const {
      messages,
      capturedImage,
    }: { messages: UIMessage[]; capturedImage?: string } = body
    
    console.log("[v0] Messages count:", messages?.length)

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "user") {
      const messageText =
        typeof lastMessage.content === "string" ? lastMessage.content : lastMessage.content?.[0]?.text || ""

      const { isProhibited } = containsProhibitedContent(messageText)
      if (isProhibited) {
        return new Response(
          JSON.stringify({
            error: "content_blocked",
            message: "I can't help with that request. Please ask me something else about technology or AI!",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    let processedMessages = messages
    if (capturedImage && messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg.role === "user") {
        processedMessages = [
          ...messages.slice(0, -1),
          {
            ...lastMsg,
            content: [
              {
                type: "image" as const,
                image: capturedImage,
              },
              {
                type: "text" as const,
                text: typeof lastMsg.content === "string" ? lastMsg.content : lastMsg.content[0]?.text || "",
              },
            ],
          },
        ]
      }
    }

    // v6: convertToModelMessages is now async
    const prompt = await convertToModelMessages(processedMessages)

    console.log("[v0] Calling streamText through AI Gateway")
    
    const result = streamText({
      model: gateway("openai/gpt-4o-mini"),
      system: BOOMER_AI_CHAT_SYSTEM_PROMPT,
      messages: prompt,
      abortSignal: req.signal,
    })

    console.log("[v0] streamText called successfully, returning response")
    
    return result.toUIMessageStreamResponse({
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
