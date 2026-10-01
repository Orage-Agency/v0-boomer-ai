"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { AlertTriangle, ArrowLeft, Download, Loader2, RefreshCw, Share2, Wand2 } from "lucide-react"
import { containsProhibitedContent, SAFETY_MESSAGE } from "@/lib/content-moderation"
import { API_PATHS } from "@boomer-ai/shared"

interface AiArtTabProps {
  onBack: () => void
}

type ImageProvider = "fal" | "openai-codex"

const STYLE_PRESETS = [
  { id: "realistic", label: "Realistic" },
  { id: "artistic", label: "Illustration" },
  { id: "cartoon", label: "Cartoon" },
  { id: "vintage", label: "Vintage" },
]

const PROMPT_SUGGESTIONS = ["Cozy cottage", "Sunset lake", "Friendly dog", "Vintage car", "Spring flowers", "Mountain view"]

export function AiArtTab({ onBack }: AiArtTabProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("realistic")
  const [provider, setProvider] = useState<ImageProvider>("fal")
  const [codexAvailable, setCodexAvailable] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isImproving, setIsImproving] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showSafetyModal, setShowSafetyModal] = useState(false)

  useEffect(() => {
    fetch(API_PATHS.generateImage)
      .then((response) => response.ok ? response.json() : null)
      .then((data) => setCodexAvailable(Boolean(data?.providers?.openaiCodex)))
      .catch(() => setCodexAvailable(false))
  }, [])

  const handleImprove = async () => {
    if (!prompt.trim() || isImproving) return
    setIsImproving(true)
    setError(null)
    try {
      const response = await fetch(API_PATHS.improvePrompt, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      })
      const data = await response.json()
      if (!response.ok) setError(data.error || "We couldn't improve the description. You can keep editing it yourself.")
      else if (data.improvedPrompt) setPrompt(data.improvedPrompt.trim())
    } catch {
      setError("We couldn't reach the prompt helper. You can keep editing your description yourself.")
    } finally {
      setIsImproving(false)
    }
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    if (containsProhibitedContent(prompt).isProhibited) {
      setShowSafetyModal(true)
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const fullPrompt = `Create an image of ${prompt.trim()}, ${selectedStyle} style, high quality, beautiful lighting.`
      const response = await fetch(API_PATHS.generateImage, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt, provider }),
      })
      const data = await response.json()

      if (!response.ok) {
        if (data.errorType === "content_safety") setShowSafetyModal(true)
        else setError(data.error || "We couldn't create the image. Your description is still here; you can try again.")
        return
      }

      setGeneratedImage(data.imageUrl)
    } catch {
      setError("We couldn't reach the image service. Your description is still here; check your connection and try again.")
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
      const link = document.createElement("a")
      link.href = url
      link.download = `boomer-ai-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setError("The image couldn't be downloaded. Try saving it from the image menu instead.")
    }
  }

  const handleShare = async () => {
    if (!generatedImage || !navigator.share) {
      setError("Sharing isn't available on this device. You can save the image instead.")
      return
    }
    try {
      await navigator.share({ title: "My AI Art", text: "I made this with Boomer AI!", url: generatedImage })
    } catch {
      // A cancelled share is an ordinary way to leave this action.
    }
  }

  const startAnother = () => {
    setGeneratedImage(null)
    setError(null)
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-slate-900">
      {showSafetyModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="presentation">
          <section className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="safety-title">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
              <AlertTriangle className="h-5 w-5 text-slate-700" aria-hidden="true" />
            </div>
            <h2 id="safety-title" className="text-lg font-semibold">Try a different description</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{SAFETY_MESSAGE}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <button onClick={() => setShowSafetyModal(false)} className="min-h-12 flex-1 rounded-xl bg-slate-900 px-4 font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900">Edit description</button>
              <button onClick={() => { setShowSafetyModal(false); onBack() }} className="min-h-12 flex-1 rounded-xl border border-slate-300 px-4 font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">Go back</button>
            </div>
          </section>
        </div>
      )}

      <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
        <button onClick={onBack} aria-label="Go back" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <div>
          <h1 className="text-lg font-semibold sm:text-xl">Create an image</h1>
          <p className="text-sm text-slate-600">Describe an idea and choose a visual style.</p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
          {generatedImage ? (
            <section aria-label="Generated image" className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                <Image src={generatedImage} alt={`AI-generated image: ${prompt}`} width={1024} height={1024} unoptimized className="mx-auto max-h-[62vh] w-full object-contain" />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button onClick={handleDownload} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"><Download className="h-4 w-4" aria-hidden="true" />Save image</button>
                <button onClick={handleShare} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 font-semibold hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"><Share2 className="h-4 w-4" aria-hidden="true" />Share</button>
              </div>
              <button onClick={startAnother} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"><RefreshCw className="h-4 w-4" aria-hidden="true" />Make another image</button>
            </section>
          ) : (
            <section className="flex flex-col gap-6">
              <div>
                <label htmlFor="image-prompt" className="block text-base font-semibold">What would you like to see?</label>
                <p id="image-prompt-help" className="mt-1 text-sm leading-6 text-slate-600">A subject and setting are enough to begin. You can add colors or a mood if you like.</p>
                <textarea id="image-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="A small cottage beside a lake at sunset" aria-describedby="image-prompt-help" className="mt-3 min-h-32 w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-base leading-6 placeholder:text-slate-500 focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200" />
                <button type="button" onClick={handleImprove} disabled={!prompt.trim() || isImproving || isGenerating} className="mt-2 min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 disabled:cursor-not-allowed disabled:text-slate-500">{isImproving ? "Improving description…" : "Improve my description"}</button>
              </div>

              <fieldset>
                <legend className="text-base font-semibold">Choose a style</legend>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {STYLE_PRESETS.map((style) => {
                    const selected = selectedStyle === style.id
                    return <button key={style.id} type="button" aria-pressed={selected} onClick={() => setSelectedStyle(style.id)} className={`min-h-12 rounded-xl border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${selected ? "border-slate-900 bg-slate-100 text-slate-950" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>{style.label}{selected && <span className="sr-only">, selected</span>}</button>
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="text-base font-semibold">Image service</legend>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" aria-pressed={provider === "fal"} onClick={() => setProvider("fal")} className={`min-h-14 rounded-xl border px-4 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${provider === "fal" ? "border-slate-900 bg-slate-100" : "border-slate-300 hover:bg-slate-50"}`}><span className="block font-semibold">Fal.ai</span><span className="mt-0.5 block text-sm text-slate-600">Current image service</span></button>
                  <button type="button" aria-pressed={provider === "openai-codex"} disabled={!codexAvailable} onClick={() => setProvider("openai-codex")} className={`min-h-14 rounded-xl border px-4 py-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${provider === "openai-codex" ? "border-slate-900 bg-slate-100" : "border-slate-300"} ${codexAvailable ? "hover:bg-slate-50" : "cursor-not-allowed bg-slate-50 text-slate-500"}`}><span className="block font-semibold">OpenAI Codex · test</span><span className="mt-0.5 block text-sm text-slate-600">{codexAvailable ? "Uses the authorized ChatGPT plan" : "Not configured on this server"}</span></button>
                </div>
                {!codexAvailable && <p className="mt-2 text-sm leading-6 text-slate-600">To test this option, configure an authorized ChatGPT plan access token on the server. It is never sent to this screen.</p>}
              </fieldset>

              <div>
                <p className="text-sm font-medium text-slate-700">Or start with an idea</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {PROMPT_SUGGESTIONS.map((suggestion) => <button key={suggestion} type="button" onClick={() => setPrompt(suggestion)} className="min-h-11 rounded-full border border-slate-300 px-4 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">{suggestion}</button>)}
                </div>
              </div>

              {error && <p role="alert" className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800">{error}</p>}

              <button type="button" onClick={handleGenerate} disabled={!prompt.trim() || isGenerating || isImproving} className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-base font-semibold text-white hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600">
                {isGenerating ? <><Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />Creating your image…</> : <><Wand2 className="h-5 w-5" aria-hidden="true" />Create image</>}
              </button>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
