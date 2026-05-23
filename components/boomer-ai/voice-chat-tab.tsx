"use client"

import { useConversation } from "@elevenlabs/react"
import { useState, useEffect, useRef } from "react"
import { PhoneOff, Mic, Volume2, VolumeX, ArrowLeft, Send } from "lucide-react"
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
  const [liveTranscript, setLiveTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const conversation = useConversation({
    onConnect: () => {
      setHasStarted(true)
      startSpeechRecognition()
    },
    onDisconnect: () => {
      setHasStarted(false)
      stopSpeechRecognition()
    },
    onMessage: (message) => {
      setConversationMessages((prev) => [...prev, message])
      // Clear live transcript when AI responds
      setLiveTranscript("")
    },
    onError: (error) => {
      console.error("Voice assistant error:", error)
      alert("Voice assistant error. Please try again.")
    },
  })

  const startSpeechRecognition = () => {
    if (typeof window === "undefined") return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      let interimTranscript = ""
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
          // Add final transcript as user message
          if (finalTranscript.trim()) {
            setConversationMessages((prev) => [...prev, { role: "user", content: finalTranscript.trim() }])
            setLiveTranscript("")
          }
        } else {
          interimTranscript += transcript
        }
      }

      // Show interim results as live transcript
      if (interimTranscript) {
        setLiveTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === "no-speech") {
        // Restart recognition if no speech detected
        setTimeout(() => {
          if (hasStarted && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              // Already started
            }
          }
        }, 100)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      // Restart recognition if still in conversation
      if (hasStarted) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            // Already started
          }
        }, 100)
      }
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
    } catch {
      // recognition already started
    }
  }

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setIsListening(false)
    setLiveTranscript("")
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [conversationMessages, liveTranscript])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`
    }
  }, [textInput])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeechRecognition()
    }
  }, [])

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
      console.error("Failed to start voice assistant:", error)
      alert("Please allow microphone access to use the voice assistant.")
    }
  }

  const endConversation = async () => {
    await conversation.endSession()
    setHasStarted(false)
    stopSpeechRecognition()
  }

  const toggleMute = () => {
    conversation.setIsMuted(!conversation.isMuted)
  }

  const sendTextMessage = () => {
    if (!textInput.trim()) return

    setConversationMessages((prev) => [...prev, { role: "user", content: textInput }])

    setTextInput("")
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 via-blue-50 to-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors touch-manipulation active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-lg font-black text-slate-900">Talk to AI Assistant</h1>
          {isListening && (
            <div className="ml-auto flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-bold text-green-700">Live</span>
            </div>
          )}
        </div>
      </div>

      {!hasStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 pb-4">
          <div className="relative">
            <div className="w-28 h-28 rounded-full overflow-hidden shadow-xl border-2 border-white ring-2 ring-blue-200">
              <img src="/voice-assistant-avatar.jpg" alt="Boomer AI Assistant" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 animate-pulse" />
          </div>

          <div className="max-w-sm text-center">
            <h2 className="text-xl font-black text-slate-900 mb-2">Hi {userProfile.name}!</h2>
            <p className="text-base text-slate-700 font-semibold mb-1">Ready to chat with AI?</p>
            <p className="text-sm text-slate-600">
              Tap below and start talking - you'll see your words appear on screen!
            </p>
          </div>

          <button
            onClick={startConversation}
            disabled={conversation.status === "connecting"}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-black text-base shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 touch-manipulation min-h-[48px]"
          >
            <Mic className="w-5 h-5" />
            Start Talking (+2 Stars)
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Logo & Status */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 py-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-white">
                <img src="/voice-assistant-avatar.jpg" alt="AI Assistant" className="w-full h-full object-cover" />
              </div>
              {conversation.isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400/40 to-emerald-400/40 animate-pulse" />
              )}
              {!conversation.isSpeaking && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/40 to-purple-400/40 animate-pulse" />
              )}
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-slate-200">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  conversation.isSpeaking ? "bg-green-500" : "bg-blue-500"
                }`}
              />
              <span className="text-sm font-black text-slate-900">
                {conversation.isSpeaking ? "AI Speaking..." : "Listening..."}
              </span>
            </div>
          </div>

          {/* Messages with live transcription */}
          <div className="flex-1 overflow-y-auto px-4">
            {conversationMessages.length > 0 || liveTranscript ? (
              <div className="space-y-2 pb-2">
                {conversationMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl ${
                      msg.role === "user" ? "bg-blue-100 text-blue-900 ml-6" : "bg-slate-100 text-slate-900 mr-6"
                    }`}
                  >
                    <div className="text-xs font-bold mb-1 opacity-70">{msg.role === "user" ? "You" : "AI"}</div>
                    <div className="text-sm font-semibold leading-relaxed">{msg.content}</div>
                  </div>
                ))}

                {liveTranscript && (
                  <div className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200 border-dashed ml-6 animate-pulse">
                    <div className="text-xs font-bold mb-1 text-blue-600 flex items-center gap-1">
                      <Mic className="w-3 h-3" />
                      You (speaking...)
                    </div>
                    <div className="text-sm font-semibold leading-relaxed text-blue-800 italic">{liveTranscript}</div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-500 italic">Start speaking - your words will appear here...</p>
              </div>
            )}
          </div>

          {/* Input & Controls */}
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
                placeholder="Or type your message..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-base text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[44px] max-h-[80px]"
                rows={1}
              />
              <button
                onClick={sendTextMessage}
                disabled={!textInput.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md flex-shrink-0 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px]"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-full shadow-md transition-all touch-manipulation active:scale-95 min-h-[48px] min-w-[48px] ${
                  conversation.isMuted ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                aria-label={conversation.isMuted ? "Unmute" : "Mute"}
              >
                {conversation.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={endConversation}
                className="px-5 py-3 bg-red-500 text-white rounded-full font-black text-sm shadow-md hover:bg-red-600 transition-all flex items-center gap-2 touch-manipulation active:scale-95 min-h-[48px]"
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
