"use client"

import { useConversation } from "@elevenlabs/react"
import { useState, useEffect, useRef } from "react"
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, ArrowLeft, Send } from 'lucide-react'
import type { UserProfile } from "@/app/page"

interface VoiceChatTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onBack: () => void
}

export function VoiceChatTab({ userProfile, updateProfile, onBack }: VoiceChatTabProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [conversationMessages, setConversationMessages] = useState<Array<{ role: string; content: string }>>([])
  const [textInput, setTextInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const conversation = useConversation({
    onConnect: () => {
      console.log("[v0] Voice assistant connected")
      setHasStarted(true)
    },
    onDisconnect: () => {
      console.log("[v0] Voice assistant disconnected")
      setHasStarted(false)
    },
    onMessage: (message) => {
      console.log("[v0] Voice assistant message:", message)
      setConversationMessages((prev) => [...prev, message])
    },
    onError: (error) => {
      console.error("[v0] Voice assistant error:", error)
      alert("Voice assistant error. Please try again.")
    },
  })

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`
    }
  }, [textInput])

  const startConversation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })

      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
      })

      updateProfile({
        stars: userProfile.stars + 2,
      })
    } catch (error) {
      console.error("[v0] Failed to start voice assistant:", error)
      alert("Please allow microphone access to use the voice assistant.")
    }
  }

  const endConversation = async () => {
    await conversation.endSession()
    setHasStarted(false)
  }

  const toggleMute = () => {
    conversation.setIsMuted(!conversation.isMuted)
  }

  const sendTextMessage = () => {
    if (!textInput.trim()) return
    
    // Add the message to display
    setConversationMessages((prev) => [
      ...prev,
      { role: "user", content: textInput }
    ])
    
    setTextInput("")
    
    // TODO: Integrate with ElevenLabs text input if available
    // For now, just display the message
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 via-blue-50 to-white">
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Talk to AI Assistant</h1>
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-4">
          {/* Logo - Smaller for mobile */}
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl border-2 border-white ring-2 ring-blue-200">
              <img
                src="/voice-assistant-avatar.jpg"
                alt="Boomer AI Assistant"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse" />
          </div>

          {/* Welcome Message - Compact */}
          <div className="max-w-sm text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">
              Hi {userProfile.name}!
            </h2>
            <p className="text-base text-slate-700 font-semibold mb-1">
              Ready to chat with AI?
            </p>
            <p className="text-sm text-slate-600">
              Tap below and start talking or type your message!
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={startConversation}
            disabled={conversation.status === "connecting"}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Mic className="w-5 h-5" />
            Start Talking (+2 ⭐)
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo & Status - Compact */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <img
                  src="/voice-assistant-avatar.jpg"
                  alt="AI Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
              {conversation.isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/40 to-emerald-400/40 animate-pulse" />
              )}
              {!conversation.isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40 animate-pulse" />
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-200">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                conversation.isSpeaking ? "bg-green-500" : "bg-blue-500"
              }`} />
              <span className="text-sm font-black text-slate-900">
                {conversation.isSpeaking ? "AI Speaking..." : "Listening..."}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4">
            {conversationMessages.length > 0 ? (
              <div className="space-y-2 pb-2">
                {conversationMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      msg.role === "user"
                        ? "bg-blue-100 text-blue-900 ml-6"
                        : "bg-slate-100 text-slate-900 mr-6"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1 opacity-70">
                      {msg.role === "user" ? "You" : "AI"}
                    </div>
                    <div className="text-sm font-semibold leading-relaxed">{msg.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500 italic">Start speaking or type your message...</p>
              </div>
            )}
          </div>

          <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-200">
            <div className="flex items-end gap-2 mb-3">
              <textarea
                ref={textareaRef}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    sendTextMessage()
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-[80px]"
                rows={1}
              />
              <button
                onClick={sendTextMessage}
                disabled={!textInput.trim()}
                className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full shadow-md transition-all ${
                  conversation.isMuted
                    ? "bg-red-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                aria-label={conversation.isMuted ? "Unmute" : "Mute"}
              >
                {conversation.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={endConversation}
                className="px-5 py-3 bg-red-500 text-white rounded-full font-black text-sm shadow-md hover:bg-red-600 transition-all flex items-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
