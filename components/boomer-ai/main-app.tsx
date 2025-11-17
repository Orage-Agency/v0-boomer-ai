"use client"

import { useState, useRef, useEffect } from "react"
import { Home, MessageSquare, BookOpen, Star, Mic, MicOff, Send, Lightbulb, History, Menu, HelpCircle, RotateCcw } from 'lucide-react'
import { HomeTab } from "./home-tab"
import { ChatTab } from "./chat-tab"
import { LessonsTab } from "./lessons-tab"
import { ProfileView } from "./profile-view"
import { TipsTab } from "./tips-tab"
import { AiArtModal } from "./ai-art-modal"
import { ChatHistoryView } from "./chat-history-view"
import { QuestionsTab } from "./questions-tab"
import { VoiceAssistant } from "./voice-assistant"
import { VoiceChatTab } from "./voice-chat-tab"
import type { UserProfile } from "@/app/page"

interface MainAppProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onReset: () => void
}

export function MainApp({ userProfile, updateProfile, onReset }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<
    "home" | "chat" | "lessons" | "tips" | "profile" | "history" | "questions" | "voice"
  >("home")
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const recognitionRef = useRef<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [isArtGeneratorOpen, setIsArtGeneratorOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true // Keep listening
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"
      recognitionRef.current.maxAlternatives = 1 // Faster processing

      recognitionRef.current.onresult = (event: any) => {
        console.log("[v0] Speech recognition result received")
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
            console.log("[v0] Final transcript:", final)
          } else {
            interim += transcript
          }
        }

        if (interim) {
          setInterimTranscript(interim)
        }

        if (final) {
          setInputValue((prev) => (prev + " " + final).trim())
          setInterimTranscript("")
          if (recognitionRef.current) {
            recognitionRef.current.stop()
          }
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error("[v0] Speech recognition error:", event.error)
        setIsListening(false)
        setInterimTranscript("")

        if (event.error === "no-speech") {
          console.log("[v0] No speech detected, keeping mic open")
          return
        }

        if (event.error !== "aborted") {
          alert(`Voice error: ${event.error}. Tap mic to try again.`)
        }
      }

      recognitionRef.current.onend = () => {
        console.log("[v0] Speech recognition ended")
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            console.log("[v0] Could not restart recognition")
            setIsListening(false)
            setInterimTranscript("")
          }
        } else {
          setIsListening(false)
          setInterimTranscript("")
        }
      }

      recognitionRef.current.onstart = () => {
        console.log("[v0] Speech recognition started")
      }
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isMenuOpen])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`
    }
  }, [inputValue])

  useEffect(() => {
    const loadLastConversation = async () => {
      const deviceId = localStorage.getItem("boomer-device-id")
      if (!deviceId) {
        console.log("[v0] No device ID found, skipping conversation load")
        return
      }

      try {
        console.log("[v0] Loading last conversation for device:", deviceId)
        const response = await fetch(`/api/conversations?deviceId=${deviceId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.conversations && data.conversations.length > 0) {
            const lastConversation = data.conversations[0]
            console.log(
              "[v0] Found last conversation:",
              lastConversation.id,
              "with",
              lastConversation.message_count,
              "messages",
            )
            setCurrentConversationId(lastConversation.id)
          } else {
            console.log("[v0] No previous conversations found")
          }
        } else {
          console.error("[v0] Failed to load conversations:", response.status)
        }
      } catch (error) {
        console.error("[v0] Failed to load last conversation:", error)
      }
    }

    loadLastConversation()
  }, [])

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please try Chrome or Safari.")
      return
    }

    if (isListening) {
      console.log("[v0] Stopping voice recognition")
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript("")
    } else {
      console.log("[v0] Starting voice recognition")
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error("[v0] Failed to start voice recognition:", error)
        alert("Failed to start voice recognition. Please try again.")
      }
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    setPendingMessage(inputValue)
    setInputValue("")
    setActiveTab("chat")

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData)
    setActiveTab("chat")
    setInputValue("What can you tell me about this image?")
  }

  const handleLoadConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
    setActiveTab("chat")
  }

  const handleNavigateWithPrompt = (prompt: string) => {
    setPendingChatPrompt(prompt)
    setActiveTab("chat")
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveTab("home")} className="hover:opacity-80 transition-opacity">
            <img src="/boomer-ai-logo.png" alt="Boomer AI" className="h-[90px] w-auto object-contain" />
          </button>

          <button
            onClick={() => setActiveTab("voice")}
            className="relative group"
            aria-label="Talk to AI Assistant"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-0.5 shadow-lg hover:shadow-xl transition-all hover:scale-110 animate-pulse">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src="/voice-assistant-avatar.jpg"
                  alt="Voice Assistant"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-lg animate-pulse">
              <span className="text-xs font-bold text-slate-800 whitespace-nowrap">Talk to Me</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <History className="w-5 h-5 text-slate-600" />
            <span className="text-sm font-semibold text-slate-700">History</span>
          </button>

          <div className="flex items-center gap-2 group relative">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-bold text-slate-900">{userProfile.stars}</span>
            <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg z-50">
              <div className="font-semibold mb-1">Earn Stars:</div>
              <div>💬 Chat: +1 star</div>
              <div>📚 Lesson: +2 stars</div>
              <div>🔥 Daily: +5 stars</div>
            </div>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
                <button
                  onClick={() => {
                    setActiveTab("profile")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-slate-200 flex-shrink-0">
                    <img
                      src={userProfile.avatarSrc || "https://placehold.co/40x40/E2E8F0/475569?text=AI"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-slate-900">{userProfile.name}</div>
                    <div className="text-xs text-slate-500">View Profile</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to start over? This will reset all your progress and data.')) {
                      onReset()
                      setIsMenuOpen(false)
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-slate-200"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-red-600">Start Over</div>
                    <div className="text-xs text-red-400">Reset all progress</div>
                  </div>
                </button>

                <div className="h-px bg-slate-200 my-2" />

                <div className="px-4 py-2 text-xs text-slate-400 font-semibold">MORE OPTIONS COMING SOON</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow overflow-hidden" style={{ height: "calc(100vh - 64px - 100px - 80px)" }}>
        {activeTab === "home" && (
          <HomeTab
            userProfile={userProfile}
            onNavigate={setActiveTab}
            onOpenArtGenerator={() => setIsArtGeneratorOpen(true)}
            updateProfile={updateProfile} // Pass updateProfile to HomeTab for pinning functionality
          />
        )}
        {activeTab === "chat" && (
          <ChatTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            pendingMessage={pendingMessage || pendingChatPrompt}
            onMessageSent={() => {
              setPendingMessage(null)
              setPendingChatPrompt(null)
            }}
            capturedImage={capturedImage}
            onImageCleared={() => setCapturedImage(null)}
            conversationId={currentConversationId}
            onNewConversation={() => setCurrentConversationId(null)}
          />
        )}
        {activeTab === "lessons" && (
          <LessonsTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            onNavigateToChat={handleNavigateWithPrompt}
          />
        )}
        {activeTab === "tips" && (
          <TipsTab
            userProfile={userProfile}
            onTryPrompt={(prompt) => {
              setInputValue(prompt)
              setActiveTab("chat")
            }}
          />
        )}
        {activeTab === "history" && (
          <ChatHistoryView
            userProfile={userProfile}
            onLoadConversation={handleLoadConversation}
            onBack={() => setActiveTab("home")}
          />
        )}
        {activeTab === "questions" && (
          <QuestionsTab
            onAskQuestion={(question) => {
              setInputValue(question)
              setActiveTab("chat")
            }}
          />
        )}
        {activeTab === "profile" && (
          <ProfileView userProfile={userProfile} onReset={onReset} onBack={() => setActiveTab("home")} />
        )}
        {activeTab === "voice" && (
          <VoiceChatTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            onBack={() => setActiveTab("home")}
          />
        )}
      </main>

      <div className="flex-shrink-0 px-4 py-3 border-t-2 border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {isListening && (
          <div className="mb-3 px-5 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-lg font-bold text-blue-900">🎤 LISTENING NOW</p>
            </div>
            {interimTranscript && (
              <div className="mt-2 p-3 bg-white rounded-xl border border-blue-200">
                <p className="text-xl font-semibold text-slate-900">{interimTranscript}</p>
              </div>
            )}
            {!interimTranscript && (
              <p className="text-base text-blue-700 italic font-medium">Start speaking... I'm listening</p>
            )}
          </div>
        )}

        <div className="flex items-start gap-2 border-2 border-slate-300 rounded-xl p-2 bg-white focus-within:border-blue-500 focus-within:shadow-lg transition-all">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-lg transition-all flex-shrink-0 ${
              isListening
                ? "text-white bg-red-600 animate-pulse shadow-lg"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            placeholder={isListening ? "Listening..." : "Ask BOOMER AI anything..."}
            className="flex-grow bg-transparent text-base text-slate-900 placeholder-slate-500 focus:outline-none resize-none min-h-[24px] max-h-[150px] overflow-y-auto font-medium"
            disabled={isListening}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav className="flex-shrink-0 flex items-center justify-around border-t border-slate-200 bg-white py-3 px-4">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "home" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs font-semibold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "chat" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <MessageSquare className="w-6 h-6" />
          <span className="text-xs font-semibold">Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("lessons")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "lessons" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <BookOpen className="w-6 h-6" />
          <span className="text-xs font-semibold">Lessons</span>
        </button>

        <button
          onClick={() => setActiveTab("tips")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "tips" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Lightbulb className="w-6 h-6" />
          <span className="text-xs font-semibold">Tips</span>
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "questions" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <HelpCircle className="w-6 h-6" />
          <span className="text-xs font-semibold">Questions</span>
        </button>

        <button
          onClick={() => setActiveTab("voice")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "voice" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <img src="/voice-assistant-avatar.jpg" alt="Voice Assistant" className="w-6 h-6 object-cover rounded-full" />
          <span className="text-xs font-semibold">Voice</span>
        </button>
      </nav>

      <AiArtModal
        isOpen={isArtGeneratorOpen}
        onClose={() => setIsArtGeneratorOpen(false)}
        userProfile={userProfile}
        updateProfile={updateProfile}
      />
    </div>
  )
}
