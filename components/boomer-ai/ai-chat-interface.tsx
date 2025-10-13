"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useState } from "react"
import { Mic, Send, ArrowLeft } from "lucide-react"

interface AIChatInterfaceProps {
  onBack?: () => void
}

export function AIChatInterface({ onBack }: AIChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const suggestedPrompts = [
    {
      text: "What's the latest local news?",
      label: "Get local news",
      icon: "📰",
    },
    {
      text: "Help me draft a message to my friend about dinner.",
      label: "Draft a message",
      icon: "✉️",
    },
    {
      text: "Find me a simple recipe for chicken soup.",
      label: "Find a recipe",
      icon: "🍲",
    },
    {
      text: "I'm trying to remember a song...",
      label: "Find that song",
      icon: "🎵",
    },
  ]

  const handlePromptClick = (prompt: string) => {
    setSelectedPrompt(prompt)
    setInputValue(prompt)
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    sendMessage({ text: inputValue })
    setInputValue("")
    setSelectedPrompt(null)
  }

  const handleReset = () => {
    setSelectedPrompt(null)
    setInputValue("")
  }

  const showChat = messages.length > 0

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white">
      {/* Header */}
      <header className="flex items-center justify-center h-16 relative border-b border-slate-200">
        {(showChat || selectedPrompt) && (
          <button onClick={onBack || handleReset} className="absolute left-4 p-2 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-slate-900">{showChat ? "Chat" : "Boomer AI Companion"}</h1>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 overflow-hidden">
        {!showChat && !selectedPrompt && (
          <>
            {/* Avatar and Greeting */}
            <div className="text-center mb-8 animate-in fade-in duration-300">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-xl font-bold text-slate-900">Let's chat! What can I help you with?</p>
            </div>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-base transition-all duration-200 hover:scale-105"
                >
                  <span className="text-2xl">{prompt.icon}</span>
                  <span>{prompt.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {selectedPrompt && !showChat && (
          <div className="w-full max-w-md animate-in fade-in duration-300">
            <button
              onClick={() => handlePromptClick(selectedPrompt)}
              className="w-full bg-blue-500 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 text-lg"
            >
              {suggestedPrompts.find((p) => p.text === selectedPrompt)?.icon}
              <span>{suggestedPrompts.find((p) => p.text === selectedPrompt)?.label}</span>
            </button>
          </div>
        )}

        {showChat && (
          <div className="flex-grow w-full overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-4 rounded-xl ${
                    message.role === "user" ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-900"
                  }`}
                >
                  {message.parts.map((part, index) => {
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
                <div className="bg-slate-100 text-slate-900 p-4 rounded-xl">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
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
      </main>

      {/* Footer Input */}
      <footer className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-2 border border-slate-300 rounded-xl p-2 bg-white">
          <button className="p-2 text-slate-600 hover:text-slate-900">
            <Mic className="w-6 h-6" />
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type or speak your message..."
            className="flex-grow bg-transparent text-base text-slate-900 placeholder-slate-500 focus:outline-none"
            disabled={status === "in_progress"}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || status === "in_progress"}
            className="p-2 text-slate-600 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-6 h-6 rotate-45" />
          </button>
        </div>
      </footer>
    </div>
  )
}
