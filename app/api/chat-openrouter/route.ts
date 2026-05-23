import { clientKey, rateLimit, tooManyRequests } from "@/lib/rate-limit"

export const maxDuration = 30

export async function POST(req: Request) {
  // Rate limit: 30 chat requests per minute per IP.
  const limit = rateLimit(clientKey(req, "chat-openrouter"), 30, 60_000)
  if (!limit.ok) return tooManyRequests(limit.resetAt)

  const {
    messages,
    model = "anthropic/claude-3.5-sonnet",
    capturedImage,
  }: { messages: any[]; model?: string; capturedImage?: string } = await req.json()

  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.GEMINIFREEOPENROUTER

  if (!openRouterKey) {
    return new Response(
      JSON.stringify({
        error:
          "OpenRouter API key not configured. Please add OPENROUTER_API_KEY to your environment variables or switch to AI SDK provider.",
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    )
  }

  // Convert AI SDK messages to OpenRouter format
  const openRouterMessages = messages.map((msg) => {
    if (msg.role === "user" && capturedImage && msg === messages[messages.length - 1]) {
      // Add image to the last user message
      return {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: capturedImage,
            },
          },
          {
            type: "text",
            text: msg.parts?.[0]?.text || msg.content || "",
          },
        ],
      }
    }

    return {
      role: msg.role,
      content: msg.parts?.[0]?.text || msg.content || "",
    }
  })

  // Add system message
  const allMessages = [
    {
      role: "system",
      content:
        "You are a friendly and helpful AI companion named Boomer AI. You specialize in helping older adults learn about and use technology. Always provide clear, concise, and easy-to-understand answers. Be patient, encouraging, and supportive. When explaining technical concepts, use simple language and relatable examples. Break down complex topics into simple steps. When analyzing images, describe what you see in detail and provide helpful context about what's in the image, what it might be used for, and any relevant information that would be helpful to someone learning about technology.",
    },
    ...openRouterMessages,
  ]

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "Boomer AI",
      },
      body: JSON.stringify({
        model: model,
        messages: allMessages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("OpenRouter API error:", response.status, errorBody)

      return new Response(
        JSON.stringify({
          error: `OpenRouter API error (${response.status}): ${errorBody}. Please check your OPENROUTER_API_KEY or switch to AI SDK provider.`,
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    // Create a TransformStream to convert OpenRouter SSE to AI SDK format
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") continue

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content

                  if (content) {
                    // Convert to AI SDK format
                    const aiSdkChunk = `0:${JSON.stringify({ type: "text-delta", textDelta: content })}\n`
                    controller.enqueue(encoder.encode(aiSdkChunk))
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } finally {
          reader.releaseLock()
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vercel-AI-Data-Stream": "v1",
      },
    })
  } catch (error) {
    console.error("OpenRouter API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to connect to OpenRouter. Please check your API key or switch to AI SDK provider.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
