"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Sparkles, ArrowLeftRight, X, Plus, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface ChatTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  pendingMessage: string | null
  onMessageSent: () => void
  capturedImage: string | null
  onImageCleared: () => void
  conversationId: string | null
  onNewConversation: () => void
}

const MODELS = {
  quick: { id: "openai/gpt-4o-mini", name: "Quick Chat", description: "Fast & Simple", icon: "⚡" },
  deep: { id: "openai/gpt-4o", name: "Deep Reasoning", description: "Best for planning", icon: "🧠" },
  creative: { id: "anthropic/claude-3-5-sonnet", name: "Creative", description: "Writing & ideas", icon: "✨" },
}

const OPENROUTER_MODELS = {
  claude: {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude Sonnet",
    description: "Best reasoning",
    icon: "🧠",
  },
  gemini: { id: "google/gemini-2.0-flash-exp:free", name: "Gemini Flash", description: "Fast & Free", icon: "⚡" },
  llama: { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3", description: "Open source", icon: "🦙" },
}

const PROMPT_LIBRARY = [
  {
    category: "Getting Things Done",
    prompts: [
      { title: "Plan my week", text: "Help me plan my week from this calendar text..." },
      { title: "Organize tasks", text: "Help me organize my to-do list by priority..." },
    ],
  },
  {
    category: "Customer Responses",
    prompts: [
      { title: "Friendly reply", text: "Write a friendly reply to this unhappy customer..." },
      { title: "Thank you note", text: "Help me write a thank you note for..." },
    ],
  },
  {
    category: "Writing Help",
    prompts: [
      { title: "Shorten email", text: "Make this email shorter and polite..." },
      { title: "Fix grammar", text: "Fix the grammar in this message..." },
    ],
  },
  {
    category: "How-To",
    prompts: [
      { title: "Facebook post", text: "Step-by-step to post on Facebook Page..." },
      { title: "Send photos", text: "How do I send photos from my phone..." },
    ],
  },
]

export function ChatTab({
  userProfile,
  updateProfile,
  pendingMessage,
  onMessageSent,
  capturedImage,
  onImageCleared,
  conversationId,
  onNewConversation,
}: ChatTabProps) {
  const [selectedModel, setSelectedModel] = useState<keyof typeof MODELS>("quick")
  const [selectedOpenRouterModel, setSelectedOpenRouterModel] = useState<keyof typeof OPENROUTER_MODELS>("claude")
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [provider, setProvider] = useState<"ai-sdk" | "openrouter">(userProfile.aiProvider || "openrouter")
  const [openRouterError, setOpenRouterError] = useState<string | null>(null)

  const currentModels = provider === "openrouter" ? OPENROUTER_MODELS : MODELS
  const currentModelKey = provider === "openrouter" ? selectedOpenRouterModel : selectedModel
  const currentModelId =
    provider === "openrouter" ? OPENROUTER_MODELS[selectedOpenRouterModel].id : MODELS[selectedModel].id

  const { messages, sendMessage, status, setMessages, error } = useChat({
    transport: new DefaultChatTransport({
      api: provider === "openrouter" ? "/api/chat-openrouter" : "/api/chat",
    }),
    body: {
      model: currentModelId,
      capturedImage: capturedImage || undefined,
      conversationId: conversationId || undefined,
    },
    onError: (error) => {
      console.error("[v0] Chat error:", error)
      if (provider === "openrouter" && (error.message.includes("401") || error.message.includes("User not found"))) {
        setOpenRouterError(
          "OpenRouter authentication failed. Please add a valid OPENROUTER_API_KEY to your environment variables. Switching to AI SDK...",
        )
        setTimeout(() => {
          setProvider("ai-sdk")
          updateProfile({ aiProvider: "ai-sdk" })
          setOpenRouterError(null)
        }, 3000)
      }
    },
  })

  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    if (messages.length > 0 && !conversationId) {
      saveConversation()
    }
  }, [messages])

  useEffect(() => {
    if (provider !== userProfile.aiProvider) {
      updateProfile({ aiProvider: provider })
    }
  }, [provider])

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.messages) {
          setMessages(data.messages)
        }
      }
    } catch (error) {
      console.error("Failed to load conversation:", error)
    }
  }

  const saveConversation = async () => {
    try {
      const deviceId = localStorage.getItem("boomer-device-id")
      if (!deviceId || messages.length === 0) return

      const title = messages[0]?.parts?.[0]?.text?.substring(0, 50) || "New conversation"
      const preview = messages[messages.length - 1]?.parts?.[0]?.text?.substring(0, 100) || ""

      await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId,
          title,
          preview,
          messages,
        }),
      })
    } catch (error) {
      console.error("Failed to save conversation:", error)
    }
  }

  useEffect(() => {
    if (pendingMessage) {
      console.log("[v0] Sending message with image:", !!capturedImage)

      sendMessage({
        text: pendingMessage,
      })

      onMessageSent()

      if (messages.length === 0 && !userProfile.badges.includes("First Chat")) {
        updateProfile({
          stars: userProfile.stars + 10,
          badges: [...userProfile.badges, "First Chat"],
        })
      }
    }
  }, [pendingMessage])

  const handlePromptClick = (promptText: string) => {
    sendMessage({
      text: promptText,
    })
    setShowPromptLibrary(false)
  }

  const handleNewConversation = () => {
    setMessages([])
    onNewConversation()
  }

  const handleModelChange = (key: string) => {
    if (provider === "openrouter") {
      setSelectedOpenRouterModel(key as keyof typeof OPENROUTER_MODELS)
    } else {
      setSelectedModel(key as keyof typeof MODELS)
    }
  }

  const toggleProvider = () => {
    const newProvider = provider === "ai-sdk" ? "openrouter" : "ai-sdk"
    setProvider(newProvider)
    updateProfile({ aiProvider: newProvider })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Model Picker with Provider Toggle */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-slate-50">
        {openRouterError && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <p className="text-sm font-bold text-red-900 mb-1">OpenRouter Error</p>
              <p className="text-xs text-red-700">{openRouterError}</p>
            </div>
            <button onClick={() => setOpenRouterError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold text-slate-700">AI Provider:</span>
          <button
            onClick={toggleProvider}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">{provider === "ai-sdk" ? "AI SDK" : "OpenRouter"}</span>
          </button>
        </div>

        {provider === "openrouter" && !openRouterError && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 <strong>Tip:</strong> OpenRouter requires a valid API key. If you see errors, add{" "}
              <code className="bg-blue-100 px-1 rounded">OPENROUTER_API_KEY</code> to your environment variables or
              switch to AI SDK.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto flex-grow">
            {Object.entries(currentModels).map(([key, model]) => (
              <button
                key={key}
                onClick={() => handleModelChange(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  currentModelKey === key
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
                }`}
              >
                <span className="text-lg">{model.icon}</span>
                <div className="text-left">
                  <div className="text-sm font-bold">{model.name}</div>
                  <div className="text-xs opacity-90">{model.description}</div>
                </div>
              </button>
            ))}
          </div>
          {messages.length > 0 && (
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">New</span>
            </button>
          )}
        </div>
      </div>

      {capturedImage && (
        <div className="flex-shrink-0 px-4 py-3 bg-purple-50 border-b border-purple-200">
          <div className="flex items-center gap-3">
            <img
              src={capturedImage || "/placeholder.svg"}
              alt="Captured"
              className="w-16 h-16 rounded-lg object-cover border-2 border-purple-300"
            />
            <div className="flex-grow">
              <p className="text-sm font-bold text-purple-900">Image attached</p>
              <p className="text-xs text-purple-700">Ask me anything about this image!</p>
            </div>
            <button
              onClick={onImageCleared}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto px-4 py-4">
        {messages.length === 0 && !showPromptLibrary && (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="bg-blue-100 p-6 rounded-full mb-4">
              <Sparkles className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Let's chat!</h2>
            <p className="text-lg text-slate-600 mb-6">What can I help you with today?</p>
            <Button
              onClick={() => setShowPromptLibrary(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl"
            >
              Browse Prompts
            </Button>
          </div>
        )}

        {showPromptLibrary && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h3 className="text-xl font-bold text-slate-900">Prompt Library</h3>
            {PROMPT_LIBRARY.map((category) => (
              <div key={category.category}>
                <h4 className="text-sm font-bold text-slate-600 mb-3">{category.category}</h4>
                <div className="space-y-2">
                  {category.prompts.map((prompt) => (
                    <button
                      key={prompt.title}
                      onClick={() => handlePromptClick(prompt.text)}
                      className="w-full text-left bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-colors"
                    >
                      <div className="font-bold text-slate-900 mb-1">{prompt.title}</div>
                      <div className="text-sm text-slate-600 italic">"{prompt.text}"</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-900 border border-slate-200"
                  }`}
                >
                  {message.parts?.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <p key={index} className="text-base leading-relaxed whitespace-pre-wrap">
                          {part.text}
                        </p>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            ))}
            {status === "in_progress" && (
              <div className="flex justify-start">
                <div className="bg-slate-100 border border-slate-200 p-4 rounded-2xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {messages.length > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-slate-200">
          <div className="flex gap-2">
            <Button
              onClick={() => setShowPromptLibrary(!showPromptLibrary)}
              variant="outline"
              className="flex-1 border-2 border-slate-200 hover:border-blue-500 text-base py-3"
            >
              Browse Prompts
            </Button>
            <Button
              onClick={() => setCompareMode(!compareMode)}
              variant="outline"
              className="flex items-center gap-2 border-2 border-slate-200 hover:border-blue-500 text-base py-3"
            >
              <ArrowLeftRight className="w-5 h-5" />
              Compare
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
