"use client"

import { useState, useEffect, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Sparkles, Plus, X, ChevronDown, ChevronUp } from "lucide-react"
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

const PROMPT_LIBRARY = [
  {
    category: "🧑‍🍳 COOKING & FOOD",
    prompts: [
      "Give me an easy dinner for one.",
      "How long do I cook chicken in the oven?",
      "Show me a soft meal I can eat with dentures.",
      "What can I make with eggs and cheese?",
      "What's the best way to store leftovers?",
      "Remind me how to boil pasta.",
      "Find a sugar-free dessert recipe.",
      "What can I make that's low salt?",
      "Can I freeze soup?",
      "Make me a grocery list for the week.",
    ],
  },
  {
    category: "💊 HEALTH & MEDICATION",
    prompts: [
      "Remind me to take my pill at 8 a.m.",
      "What's this medicine called Lisinopril for?",
      "Can I take Tylenol with my heart medicine?",
      "How much water should I drink each day?",
      "Show me simple exercises for my back.",
      "What can I eat for better sleep?",
      "Is a short walk after dinner good for me?",
      "Why do I feel dizzy in the morning?",
      "Give me some stretches I can do in a chair.",
      "Tell me a few tips to stay healthy after 65.",
    ],
  },
  {
    category: "🧠 MEMORY & MIND",
    prompts: [
      "Ask me how I'm feeling today.",
      "Remind me what day it is.",
      "Let's play a trivia game.",
      "Tell me a fun fact about the 1960s.",
      "Give me a riddle to solve.",
      "Teach me one new word today.",
      "Help me remember my appointments.",
      "What's a good brain exercise?",
      "Remind me to call my son tomorrow.",
      "Read me some good news.",
    ],
  },
  {
    category: "🐾 PETS & ANIMALS",
    prompts: [
      "How often should I walk my dog?",
      "Can cats eat tuna every day?",
      "What's the best flea treatment for dogs?",
      "How can I train my puppy not to bark?",
      "Why is my dog scratching a lot?",
      "Tell me what foods dogs can't eat.",
      "How do I make homemade dog treats?",
      "Find me a vet near me.",
      "Remind me to feed my cat at 7 p.m.",
      "Is it normal if my dog sleeps all day?",
    ],
  },
  {
    category: "🌷 GARDEN & HOME",
    prompts: [
      "When should I water my plants?",
      "How do I keep bugs off my tomatoes?",
      "What's the best indoor plant for low light?",
      "Why are my leaves turning yellow?",
      "Give me tips for growing herbs inside.",
      "How do I get rid of ants safely?",
      "Tell me what flowers bloom in spring.",
      "Can I use coffee grounds in the garden?",
      "Find a natural cleaner for my kitchen.",
      "How do I unclog a drain?",
    ],
  },
  {
    category: "💬 FAMILY & SOCIAL",
    prompts: [
      "Write a sweet message to my granddaughter.",
      "Remind me to call my sister on Sunday.",
      "What can I talk about with my grandkids?",
      "Send a thank-you message for the gift.",
      "Tell me something nice to say to a friend.",
      "Help me make a birthday card message.",
      "How can I start a group chat with my family?",
      "What's a fun story I can tell the kids?",
      "Find a Bible verse about gratitude.",
      "Write a note to say I miss you.",
    ],
  },
  {
    category: "🏠 DAILY LIFE & ERRANDS",
    prompts: [
      "Make me a list for the store.",
      "What's the weather like today?",
      "Remind me to pay my bills on the 15th.",
      "Find an easy recipe for lunch.",
      "How do I get a stain out of my shirt?",
      "Remind me to water the plants.",
      "Find a good movie to watch tonight.",
      "What's the best way to clean my microwave?",
      "How do I reset my Wi-Fi?",
      "Tell me a joke.",
    ],
  },
  {
    category: "💻 TECH HELP (MADE EASY)",
    prompts: [
      "Show me how to copy and paste.",
      "How do I make my phone louder?",
      "Teach me how to use FaceTime.",
      "Why is my iPad battery dying so fast?",
      "Explain what a password manager is.",
      "How do I delete old photos?",
      "Can you help me find my lost phone?",
      "Set a reminder for tomorrow morning.",
      "Show me how to join a Zoom call.",
      "What's the safest way to shop online?",
    ],
  },
  {
    category: "🌞 FUN & PERSONAL",
    prompts: [
      "Tell me a joke about aging.",
      "Play some old country music.",
      "What's a fun hobby I can start?",
      "Teach me how to paint.",
      "Show me easy yoga for seniors.",
      "What's the weather for my next trip?",
      "Tell me a bedtime story.",
      "What's a good volunteer idea near me?",
      "Give me something inspiring to read.",
      "Ask me about my favorite childhood memory.",
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
  const [showPromptLibrary, setShowPromptLibrary] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
    body: {
      model: "openai/gpt-4o-mini",
      capturedImage: capturedImage || undefined,
      conversationId: conversationId || undefined,
    },
  })

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      }
      // Fallback: also scroll the container
      if (messagesContainerRef.current) {
        messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
      }
    }

    // Scroll immediately
    scrollToBottom()

    // Also scroll after a short delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100)

    return () => clearTimeout(timeoutId)
  }, [messages, status])

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
        const newStars = userProfile.stars + 10
        updateProfile({
          stars: newStars,
          badges: [...userProfile.badges, "First Chat"],
        })
        console.log("[v0] Awarded 10 stars for first chat. Total stars:", newStars)
      } else {
        const newStars = userProfile.stars + 1
        updateProfile({
          stars: newStars,
        })
        console.log("[v0] Awarded 1 star for message. Total stars:", newStars)
      }
    }
  }, [pendingMessage])

  const handlePromptClick = (promptText: string) => {
    console.log("[v0] Prompt clicked:", promptText)
    sendMessage({
      text: promptText,
    })
    setShowPromptLibrary(false)

    if (!userProfile.badges.includes("Prompt Explorer")) {
      const newStars = userProfile.stars + 1
      updateProfile({
        stars: newStars,
        badges: [...userProfile.badges, "Prompt Explorer"],
      })
      console.log("[v0] Awarded 1 star for prompt explorer. Total stars:", newStars)
    }
  }

  const handleNewConversation = () => {
    setMessages([])
    onNewConversation()
  }

  const toggleSection = (category: string) => {
    setExpandedSections((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]))
  }

  return (
    <div className="flex flex-col h-full bg-white">
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

      <div ref={messagesContainerRef} className="flex-grow overflow-y-auto px-4 py-4">
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
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Prompt Library</h3>
              <button onClick={() => setShowPromptLibrary(false)} className="text-slate-600 hover:text-slate-900">
                <X className="w-6 h-6" />
              </button>
            </div>
            {PROMPT_LIBRARY.map((section) => {
              const isExpanded = expandedSections.includes(section.category)
              return (
                <div key={section.category} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => toggleSection(section.category)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <h4 className="text-lg font-bold text-slate-900">{section.category}</h4>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-4 space-y-2 bg-white">
                      {section.prompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt)}
                          className="w-full text-left bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 rounded-lg p-3 transition-all"
                        >
                          <div className="text-base text-slate-900">"{prompt}"</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
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
            <div ref={messagesEndRef} />
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
            <button
              onClick={handleNewConversation}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-bold">New Chat</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
