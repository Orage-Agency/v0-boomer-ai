import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { containsProhibitedContent } from "@/lib/content-moderation"

export const maxDuration = 60

export async function POST(req: Request) {
  console.log("[v0] Chat API called")
  try {
    const body = await req.json()
    console.log("[v0] Chat API received body keys:", Object.keys(body))
    
    const {
      messages,
      model = "openai/gpt-4o-mini",
      capturedImage,
    }: { messages: UIMessage[]; model?: string; capturedImage?: string } = body
    
    console.log("[v0] Messages count:", messages?.length, "Model:", model)

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
        // Attach the photo as a `file` part so convertToModelMessages turns it
        // into a vision input. (The previous `content`-array approach was for
        // the web message shape and broke the mobile `parts` format.)
        const match = /^data:([^;]+);/.exec(capturedImage)
        const mediaType = match ? match[1] : "image/jpeg"
        const existingParts = Array.isArray((lastMsg as { parts?: unknown }).parts)
          ? (lastMsg as unknown as { parts: unknown[] }).parts
          : []
        processedMessages = [
          ...messages.slice(0, -1),
          {
            ...lastMsg,
            parts: [...existingParts, { type: "file", mediaType, url: capturedImage }],
          } as UIMessage,
        ]
      }
    }

    // v6: convertToModelMessages is now async
    const prompt = await convertToModelMessages(processedMessages)

    console.log("[v0] Calling streamText with model:", model)
    
    const result = streamText({
      model: model,
      system:
        "You are Sara, a warm and friendly AI companion in the Boomer AI app. You specialize in helping older adults learn about and use technology, and the conversation history is remembered so people can pick up right where they left off. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps. When analyzing images, describe what you see in detail and provide helpful context. You must refuse any requests for inappropriate, harmful, violent, sexual, or illegal content.",
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
