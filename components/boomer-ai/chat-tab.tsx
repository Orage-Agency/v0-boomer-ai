"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Sparkles, ArrowLeftRight, X, Plus } from "lucide-react"
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
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [compareMode, setCompareMode] = useState(false)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    body: {
      model: MODELS[selectedModel].id,
      capturedImage: capturedImage || undefined,
      conversationId: conversationId || undefined,
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

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Model Picker */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-x-auto flex-grow">
            {Object.entries(MODELS).map(([key, model]) => (
              <button
                key={key}
                onClick={() => setSelectedModel(key as keyof typeof MODELS)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  selectedModel === key
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
