"use client"

import { useState } from "react"
import { Wand2, Download, Share2, Loader2, AlertTriangle, ArrowLeft, Sparkles, RefreshCw } from "lucide-react"
import { containsProhibitedContent, SAFETY_MESSAGE } from "@/lib/content-moderation"
import type { UserProfile } from "@/app/page"

interface AiArtTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onBack: () => void
}

const STYLE_PRESETS = [
  { id: "realistic", label: "Real", emoji: "📷" },
  { id: "artistic", label: "Art", emoji: "🎨" },
  { id: "cartoon", label: "Toon", emoji: "🎪" },
  { id: "vintage", label: "Retro", emoji: "📻" },
]

const PROMPT_SUGGESTIONS = [
  "Cozy cottage",
  "Sunset lake",
  "Friendly dog",
  "Vintage car",
  "Spring flowers",
  "Mountain view",
]

export function AiArtTab({ userProfile, updateProfile, onBack }: AiArtTabProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSafetyModal, setShowSafetyModal] = useState(false)

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
          setError(data.error || "Failed to generate. Try again.")
        }
        return
      }

      setGeneratedImage(data.imageUrl)
      updateProfile({ stars: userProfile.stars + 1 })
    } catch (err) {
      setError("Connection error. Please try again.")
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
      alert("Could not download. Try right-clicking the image to save.")
    }
  }

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) {
      alert("Sharing not available on this device.")
      return
    }

    try {
      await navigator.share({
        title: "My AI Art",
        text: "I made this with Boomer AI!",
        url: generatedImage,
      })
    } catch (err) {
      // User cancelled
    }
  }

  const handleNewImage = () => {
    setGeneratedImage(null)
    setPrompt("")
    setError(null)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 overflow-hidden">
      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-[300px] w-full text-center shadow-2xl">
            <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Cannot Complete</h3>
            <p className="text-slate-600 text-sm mb-4">{SAFETY_MESSAGE}</p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  setPrompt("")
                }}
                className="w-full min-h-[44px] py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl touch-manipulation active:scale-95"
              >
                Try Something Else
              </button>
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  onBack()
                }}
                className="w-full min-h-[44px] py-2.5 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl touch-manipulation active:scale-95"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-slate-700/50">
        <button
          onClick={onBack}
          className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-slate-800 flex items-center justify-center touch-manipulation active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <h1 className="text-base font-bold text-white">Create AI Art</h1>
        </div>
        <div className="w-[40px]" /> {/* Spacer for centering */}
      </div>

      {/* Content - No side scroll, fits in view */}
      <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-3">
        {generatedImage ? (
          /* Generated Image View */
          <div className="flex flex-col gap-3">
            {/* Image - Constrained size */}
            <div className="relative w-full aspect-square max-h-[50vh] rounded-2xl overflow-hidden shadow-xl bg-slate-800 mx-auto">
              <img
                src={generatedImage || "/placeholder.svg"}
                alt="AI Art"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Action Buttons - Compact */}
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 bg-green-600 text-white font-bold text-sm rounded-xl touch-manipulation active:scale-95"
              >
                <Download className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl touch-manipulation active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>

            {/* Create Another - Compact */}
            <button
              onClick={handleNewImage}
              className="w-full min-h-[48px] py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-base rounded-xl touch-manipulation active:scale-95 flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Create Another
            </button>
          </div>
        ) : (
          /* Creation View - Compact for mobile */
          <div className="flex flex-col gap-3">
            {/* Prompt Input - Smaller */}
            <div>
              <label className="block text-white font-semibold mb-1.5 text-sm">
                Describe your image
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A beautiful sunset..."
                className="w-full h-20 p-3 bg-slate-800 text-white text-base rounded-xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none resize-none placeholder-slate-500"
                style={{ fontSize: "16px" }}
              />
            </div>

            {/* Quick Suggestions - Horizontal scroll */}
            <div>
              <p className="text-slate-400 font-medium mb-1.5 text-xs">Quick ideas:</p>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
                {PROMPT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="flex-shrink-0 px-3 py-2 min-h-[36px] bg-slate-800 text-slate-300 text-xs rounded-lg touch-manipulation active:scale-95 active:bg-slate-700 whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection - Compact 4-grid */}
            <div>
              <label className="block text-white font-semibold mb-1.5 text-sm">
                Style
              </label>
              <div className="grid grid-cols-4 gap-2">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`min-h-[56px] p-2 rounded-xl border-2 flex flex-col items-center justify-center touch-manipulation active:scale-95 ${
                      selectedStyle === style.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    <span className="text-lg">{style.emoji}</span>
                    <span className="font-medium text-[10px]">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 bg-red-900/50 border border-red-700 rounded-xl">
                <p className="text-red-200 text-xs text-center">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full min-h-[52px] py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 touch-manipulation active:scale-95 ${
                !prompt.trim() || isGenerating
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed active:scale-100"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  Create Image
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
