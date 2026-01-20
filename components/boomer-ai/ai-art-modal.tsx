"use client"

import { useState } from "react"
import { X, Wand2, Download, Share2, Loader2, AlertTriangle, ArrowLeft } from "lucide-react"
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
  "A cozy cottage in a flower garden",
  "A peaceful mountain lake at sunset",
  "A friendly golden retriever in a park",
  "A vintage car on a country road",
  "A beautiful bouquet of spring flowers",
  "A charming small town main street",
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

    // Client-side content moderation
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
    <div className="fixed inset-0 z-50 bg-slate-900">
      {/* Safety Modal */}
      {showSafetyModal && (
        <div className="absolute inset-0 z-60 flex items-center justify-center bg-black/80 p-6">
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Request Not Completed</h3>
            <p className="text-slate-600 mb-6">{SAFETY_MESSAGE}</p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  setPrompt("")
                }}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors touch-manipulation active:scale-95"
              >
                Try Something Else
              </button>
              <button
                onClick={() => {
                  setShowSafetyModal(false)
                  onClose()
                }}
                className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors touch-manipulation active:scale-95"
              >
                Return to Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-xl font-bold text-white">Create AI Art</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-safe" style={{ height: "calc(100vh - 80px)" }}>
        {generatedImage ? (
          /* Generated Image View */
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={generatedImage || "/placeholder.svg"}
                alt="Generated AI Art"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex gap-3 w-full max-w-md">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors touch-manipulation active:scale-95"
              >
                <Download className="w-5 h-5" />
                Save
              </button>
              <button
                onClick={handleShare}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors touch-manipulation active:scale-95"
              >
                <Share2 className="w-5 h-5" />
                Share
              </button>
            </div>

            <button
              onClick={handleNewImage}
              className="w-full max-w-md py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity touch-manipulation active:scale-95"
            >
              Create Another Image
            </button>
          </div>
        ) : (
          /* Creation View */
          <div className="flex flex-col gap-6">
            {/* Prompt Input */}
            <div>
              <label className="block text-white font-semibold mb-2 text-lg">
                Describe what you want to create
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A beautiful sunset over the ocean..."
                className="w-full h-32 p-4 bg-slate-800 text-white text-lg rounded-2xl border-2 border-slate-700 focus:border-purple-500 focus:outline-none resize-none placeholder-slate-500"
              />
            </div>

            {/* Suggestions */}
            <div>
              <p className="text-slate-400 font-medium mb-2">Try one of these:</p>
              <div className="flex flex-wrap gap-2">
                {PROMPT_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="px-3 py-2 bg-slate-800 text-slate-300 text-sm rounded-xl hover:bg-slate-700 transition-colors touch-manipulation active:scale-95"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <label className="block text-white font-semibold mb-2 text-lg">
                Choose a style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {STYLE_PRESETS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-2xl border-2 transition-all touch-manipulation active:scale-95 ${
                      selectedStyle === style.id
                        ? "bg-purple-600 border-purple-400 text-white"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{style.emoji}</span>
                    <span className="font-semibold">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-2xl">
                <p className="text-red-200 text-center">{error}</p>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className={`w-full py-5 rounded-2xl font-bold text-xl transition-all touch-manipulation active:scale-95 flex items-center justify-center gap-3 ${
                !prompt.trim() || isGenerating
                  ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Creating your art...
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
  )
}
