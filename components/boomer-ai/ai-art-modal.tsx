"use client"

import { useState, useEffect } from "react"
import { X, Sparkles, Download, Loader2, Palette, ImageIcon, Brain, Maximize2 } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useUser } from "@/contexts/user-context"

interface AiArtModalProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const DAILY_LIMIT = 5

const ART_TIPS = [
  "Try describing emotions: 'peaceful', 'joyful', 'mysterious' for better mood",
  "Add specific details: 'fluffy clouds', 'tall mountains', 'colorful flowers'",
  "Mention the time of day: 'sunset', 'morning light', 'starry night'",
  "Include textures: 'soft', 'rough', 'smooth', 'detailed'",
  "Be specific about subjects: 'golden retriever puppy' vs just 'dog'",
  "Describe the setting: 'in a garden', 'by the ocean', 'in a cozy room'",
  "Use style keywords: 'watercolor', 'pencil sketch', 'detailed drawing'",
  "Keep it simple for clearer results - focus on one main subject",
]

export function AiArtModal({ isOpen, onClose, userProfile, updateProfile }: AiArtModalProps) {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentTip, setCurrentTip] = useState("")
  const [remainingGenerations, setRemainingGenerations] = useState(DAILY_LIMIT)
  const [isImprovingPrompt, setIsImprovingPrompt] = useState(false)
  const [showFullImage, setShowFullImage] = useState(false)

  const { saveImage } = useUser()

  useEffect(() => {
    const today = new Date().toDateString()
    if (userProfile.lastArtDate !== today) {
      updateProfile({ dailyArtCount: 0, lastArtDate: today })
      setRemainingGenerations(DAILY_LIMIT)
    } else {
      setRemainingGenerations(DAILY_LIMIT - userProfile.dailyArtCount)
    }

    setCurrentTip(ART_TIPS[Math.floor(Math.random() * ART_TIPS.length)])
  }, [isOpen, userProfile.dailyArtCount, userProfile.lastArtDate])

  const generateImage = async () => {
    if (!prompt.trim() || remainingGenerations <= 0) return

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `sketch style, pencil drawing: ${prompt}` }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate image")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)

      await saveImage(data.imageUrl, prompt)

      const today = new Date().toDateString()
      updateProfile({
        dailyArtCount: userProfile.dailyArtCount + 1,
        lastArtDate: today,
        stars: userProfile.stars + 3,
      })
      setRemainingGenerations(remainingGenerations - 1)

      setCurrentTip(ART_TIPS[Math.floor(Math.random() * ART_TIPS.length)])
    } catch (err) {
      setError("Failed to generate image. Please try again.")
      console.error("Image generation error:", err)
    } finally {
      setIsGenerating(false)
    }
  }

  const improvePrompt = async () => {
    if (!prompt.trim() || isImprovingPrompt) return

    setIsImprovingPrompt(true)
    setError(null)

    try {
      const response = await fetch("/api/improve-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error("Failed to improve prompt")
      }

      const data = await response.json()
      setPrompt(data.improvedPrompt)
    } catch (err) {
      setError("Failed to improve prompt. Please try again.")
      console.error("Prompt improvement error:", err)
    } finally {
      setIsImprovingPrompt(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `boomer-ai-art-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    setPrompt("")
    setGeneratedImage(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">AI Art Studio</h2>
                <p className="text-sm text-slate-600">
                  {remainingGenerations} of {DAILY_LIMIT} creations left today
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-slate-600 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-grow overflow-y-auto p-6">
            {remainingGenerations <= 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                  <ImageIcon className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Daily Limit Reached</h3>
                <p className="text-slate-600 mb-4">
                  You've created {DAILY_LIMIT} amazing artworks today! Come back tomorrow for more.
                </p>
                <p className="text-sm text-purple-600 font-semibold">
                  +{userProfile.dailyArtCount * 3} stars earned today! ⭐
                </p>
              </div>
            ) : (
              <>
                {/* Prompt Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    What would you like to create?
                  </label>
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          generateImage()
                        }
                      }}
                      placeholder="Describe your idea... (e.g., 'a peaceful garden with flowers', 'a cute cat playing', 'mountain landscape at sunset')"
                      className="w-full px-4 py-3 pr-14 border-2 border-slate-300 rounded-xl text-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
                      rows={3}
                      disabled={isGenerating || isImprovingPrompt}
                    />
                    <button
                      onClick={improvePrompt}
                      disabled={!prompt.trim() || isGenerating || isImprovingPrompt}
                      className="absolute bottom-3 right-3 p-2 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
                      title="AI Help - Improve your prompt"
                    >
                      {isImprovingPrompt ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Brain className="w-3 h-3" />
                    Click the brain icon for AI help to improve your prompt
                  </p>
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateImage}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mb-4"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Creating your masterpiece...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      Generate Art (+3 ⭐)
                    </>
                  )}
                </button>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 text-center">{error}</p>
                  </div>
                )}

                {/* Generated Image */}
                {generatedImage && (
                  <div className="mb-4">
                    <div
                      className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-purple-200 cursor-pointer group"
                      onClick={() => setShowFullImage(true)}
                    >
                      <img src={generatedImage || "/placeholder.svg"} alt="Generated art" className="w-full h-auto" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                          <Maximize2 className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-green-600 text-center mt-2 font-medium">Image saved to your Gallery!</p>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={downloadImage}
                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                      >
                        <Download className="w-5 h-5" />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setGeneratedImage(null)
                          setPrompt("")
                          setCurrentTip(ART_TIPS[Math.floor(Math.random() * ART_TIPS.length)])
                        }}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-md"
                      >
                        Create Another
                      </button>
                    </div>
                  </div>
                )}

                {/* Dynamic Tip */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500 rounded-lg flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-purple-900 mb-1">Pro Tip</h3>
                      <p className="text-sm text-purple-700">{currentTip}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Full-screen image viewer modal */}
      {showFullImage && generatedImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowFullImage(false)}
        >
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              downloadImage()
            }}
            className="absolute bottom-4 right-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg z-10"
          >
            <Download className="w-5 h-5" />
            Download
          </button>
          <img
            src={generatedImage || "/placeholder.svg"}
            alt="Generated art - Full view"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
