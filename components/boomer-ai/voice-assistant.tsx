"use client"

import { useConversation } from "@elevenlabs/react"
import { useState } from "react"
import { PhoneOff, VolumeX } from "lucide-react"

interface VoiceAssistantProps {
  agentId?: string
}

export function VoiceAssistant({ agentId }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)

  const conversation = useConversation({
    onConnect: () => {
      console.log("[v0] Voice assistant connected")
    },
    onDisconnect: () => {
      console.log("[v0] Voice assistant disconnected")
      setIsOpen(false)
    },
    onMessage: (message) => {
      console.log("[v0] Voice assistant message:", message)
    },
    onError: (error) => {
      console.error("[v0] Voice assistant error:", error)
      alert("Voice assistant error. Please try again.")
    },
  })

  const startConversation = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })

      await conversation.startSession({
        agentId: agentId || process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || "",
      })

      setIsOpen(true)
    } catch (error) {
      console.error("[v0] Failed to start voice assistant:", error)
      alert("Please allow microphone access to use the voice assistant.")
    }
  }

  const endConversation = async () => {
    await conversation.endSession()
    setIsOpen(false)
  }

  const toggleMute = () => {
    conversation.setIsMuted(!conversation.isMuted)
  }

  return (
    <div className="relative">
      {!isOpen ? (
        <button
          onClick={startConversation}
          disabled={conversation.status === "connecting"}
          className="relative group"
          aria-label="Start voice conversation"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-0.5 shadow-md hover:shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">🤖</div>
          </div>

          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50">
            Talk to AI Assistant
          </div>
        </button>
      ) : (
        <div className="relative">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-400 via-emerald-400 to-teal-400 p-0.5 shadow-md animate-pulse">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl relative">
              🤖
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white rounded-full shadow-lg border border-slate-200 px-2 py-1">
            <div className="flex items-center gap-1.5 px-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-slate-700">
                {conversation.isSpeaking ? "Speaking" : "Listening"}
              </span>
            </div>

            <button
              onClick={toggleMute}
              className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
              aria-label={conversation.isMuted ? "Unmute" : "Mute"}
              title={conversation.isMuted ? "Unmute" : "Mute"}
            >
              <VolumeX className={`w-3.5 h-3.5 ${conversation.isMuted ? "text-red-600" : "text-slate-600"}`} />
            </button>

            <button
              onClick={endConversation}
              className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
              aria-label="End conversation"
              title="End conversation"
            >
              <PhoneOff className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
