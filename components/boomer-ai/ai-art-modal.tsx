"use client"

import { useState } from "react"
import { X, Wand2, Download, Share2, Loader2, AlertTriangle, ArrowLeft, Sparkles } from "lucide-react"
import { containsProhibitedContent, SAFETY_MESSAGE } from "@/lib/content-moderation"

interface AiArtModalProps {
  isOpen: boolean
  onClose: () => void
}

const STYLE_PRESETS = [
  { id: "realistic", label: "Realistic", emoji: "📷" },
  { id: "artistic", label: "Artistic", emoji: "🎨" },
  { id: "cartoon", label: "Cartoon", emoji: "🎪" },
  { id: "vintage", label: "Vintage", emoji: "📻" },
]

const PROMPT_SUGGESTIONS = [
  "A cozy cottage in a garden",
  "A peaceful lake at sunset",
  "A friendly dog in the park",
  "A vintage car on the road",
  "A bouquet of spring flowers",
  "A charming small town",
]

export function AiArtModal({ isOpen, onClose }: AiArtModalProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSafetyModal, setShowSafetyModal] = useState(false)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    const moderationResult = containsProhibitedContent(prompt)
    if (moderationResult.isProhibited) {
      setShowSafetyModal(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const fullPrompt = `${prompt}, ${selectedStyle} style, high quality, beautiful lighting`
      
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errorType === "content_safety") {
          setShowSafetyModal(true)
        } else {
          setError(data.error || "Failed to generate image. Please try again.")
        }
        return
      }

      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError("Something went wrong. Please check your connection and try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    
    try {
      const response = await fetch(generatedImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `boomer-ai-art-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Could not download image. Please try right-clicking and saving instead.")
    }
  }

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) {
      alert("Sharing is not available on this device.")
      return
    }

    try {
      await navigator.share({
        title: "My AI Art from Boomer AI",
        text: "Check out this image I created with Boomer AI!",
        url: generatedImage,
      })
    } catch (err) {
      // User cancelled or share failed
    }
  }

  const handleNewImage = () => {
    setGeneratedImage(null)
    setPrompt("")
    setError(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl">
            <div className="w-14 h-14 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Request Not Completed</h3>
            <p className="text-slate-600 text-sm mb-5">{SAFETY_MESSAGE}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  setPrompt("")
                }}
                className="w-full min-h-[48px] py-3 bg-blue-600 text-white font-bold rounded-xl touch-manipulation active:scale-95 transition-transform"
              >
                Try Something Else
              </button>
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  onClose()
                }}
                className="w-full min-h-[48px] py-3 bg-slate-100 text-slate-700 font-bold rounded-xl touch-manipulation active:scale-95 transition-transform"
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header - Fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-slate-800 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          <h1 className="text-lg font-bold text-white">Create AI Art</h1>
        </div>
        <button
          onClick={onClose}
          className="min-w-[44px] min-h-[44px] p-2 rounded-xl bg-slate-800 flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 pb-safe" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 16px)" }}>
          {generatedImage ? (
            /* Generated Image View */
            <div className="flex flex-col gap-4">
              {/* Image */}
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-2xl bg-slate-800">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated AI Art"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[52px] py-3 bg-green-600 text-white font-bold text-base rounded-2xl touch-manipulation active:scale-95 transition-transform"
                >
                  <Download className="w-5 h-5" />
                  Save
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 min-h-[52px] py-3 bg-blue-600 text-white font-bold text-base rounded-2xl touch-manipulation active:scale-95 transition-transform"
                >
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>

              {/* Create Another */}
              <button
                onClick={handleNewImage}
                className="w-full min-h-[56px] py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-2xl touch-manipulation active:scale-95 transition-transform"
              >
                Create Another Image
              </button>
            </div>
          ) : (
            /* Creation View */
            <div className="flex flex-col gap-4">
              {/* Prompt Input */}
              <div>
                <label className="block text-white font-semibold mb-2 text-base">
                  Describe your image
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A beautiful sunset over the ocean..."
                  className="w-full h-24 p-3 bg-slate-800 text-white text-base rounded-2xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none resize-none placeholder-slate-500"
                  style={{ fontSize: "16px" }} /* Prevents zoom on iOS */
                />
              </div>

              {/* Quick Suggestions */}
              <div>
                <p className="text-slate-400 font-medium mb-2 text-sm">Quick ideas:</p>
                <div className="flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setPrompt(suggestion)}
                      className="px-3 py-2 min-h-[40px] bg-slate-800 text-slate-300 text-sm rounded-xl touch-manipulation active:scale-95 active:bg-slate-700 transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selection */}
              <div>
                <label className="block text-white font-semibold mb-2 text-base">
                  Choose a style
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`min-h-[72px] p-2 rounded-xl border-2 flex flex-col items-center justify-center touch-manipulation active:scale-95 transition-all ${
                        selectedStyle === style.id
                          ? "bg-purple-600 border-purple-400 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      <span className="text-xl mb-0.5">{style.emoji}</span>
                      <span className="font-medium text-xs">{style.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-xl">
                  <p className="text-red-200 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={`w-full min-h-[60px] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 touch-manipulation active:scale-95 transition-all ${
                  !prompt.trim() || isGenerating
                    ? "bg-slate-700 text-slate-500 cursor-not-allowed active:scale-100"
                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    Create Image
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
