import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

// Configure fal client
fal.config({
  credentials: process.env.FAL_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] Generating image with prompt:", prompt)

    // Generate image using the fal schnell model (optimized for fast, high-quality image generation)
    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: {
        prompt,
        image_size: "square_hd",
        num_inference_steps: 4,
        num_images: 1,
      },
    })

    // Extract the image URL from the result
    const imageUrl = result.images?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image generated")
    }

    console.log("[v0] Image generated successfully:", imageUrl)

    return NextResponse.json({ imageUrl })
  } catch (error) {
    console.error("[v0] Error generating image:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
  }
}
