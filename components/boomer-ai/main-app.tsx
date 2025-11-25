"use client"

import { useState, useRef, useEffect } from "react"
import {
  Home,
  MessageSquare,
  BookOpen,
  Star,
  Mic,
  MicOff,
  Send,
  Lightbulb,
  History,
  Menu,
  HelpCircle,
  RotateCcw,
} from "lucide-react"
import { HomeTab } from "./home-tab"
import { ChatTab } from "./chat-tab"
import { LessonsTab } from "./lessons-tab"
import { ProfileView } from "./profile-view"
import { TipsTab } from "./tips-tab"
import { AiArtModal } from "./ai-art-modal"
import { ChatHistoryView } from "./chat-history-view"
import { QuestionsTab } from "./questions-tab"
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
        let interim = ""
        let final = ""

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            final += transcript
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
        setIsListening(false)
        setInterimTranscript("")

        if (event.error === "no-speech") {
          return
        }

        if (event.error !== "aborted") {
          alert(`Voice error: ${event.error}. Tap mic to try again.`)
        }
      }

      recognitionRef.current.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognitionRef.current.start()
          } catch (e) {
            setIsListening(false)
            setInterimTranscript("")
          }
        } else {
          setIsListening(false)
          setInterimTranscript("")
        }
      }

      recognitionRef.current.onstart = () => {}
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  useEffect(() => {
    const loadLastConversation = async () => {
      const deviceId = localStorage.getItem("boomer-device-id")
      if (!deviceId) {
        return
      }

      try {
        const response = await fetch(`/api/conversations?deviceId=${deviceId}`)

        if (response.ok) {
          try {
            const data = await response.json()
            if (data.conversations && data.conversations.length > 0) {
              const lastConversation = data.conversations[0]
              setCurrentConversationId(lastConversation.id)
            }
          } catch (jsonError) {
            // Silently fail
          }
        }
      } catch (error) {
        // Silently fail
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
      recognitionRef.current.stop()
      setIsListening(false)
      setInterimTranscript("")
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
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
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("home")}
            className="hover:opacity-80 transition-opacity active:scale-95 touch-manipulation"
            aria-label="Go to home"
          >
            <img src="/boomer-ai-logo.png" alt="Boomer AI" className="h-[60px] w-auto object-contain" />
          </button>

          {/* Voice Assistant Avatar */}
          <button
            onClick={() => setActiveTab("voice")}
            className="relative group touch-manipulation"
            aria-label="Talk to AI Assistant"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-[2px] shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-pulse">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/voice-assistant-avatar.jpg" alt="Voice Assistant" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-lg animate-pulse">
              <span className="text-[10px] font-bold text-slate-800 whitespace-nowrap">ASK ME ANYTHING</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("history")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation active:scale-95"
            aria-label="Chat history"
          >
            <History className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-yellow-50 rounded-xl">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <span className="text-base font-bold text-slate-900">{userProfile.stars}</span>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation active:scale-95"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6 text-slate-700" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 py-2 z-50">
                <button
                  onClick={() => {
                    setActiveTab("profile")
                    setIsMenuOpen(false)
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left touch-manipulation"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-slate-200 flex-shrink-0">
                    <img
                      src={userProfile.avatarSrc || "https://placehold.co/44x44/E2E8F0/475569?text=AI"}
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
                    if (confirm("Are you sure you want to start over? This will reset all your progress and data.")) {
                      onReset()
                      setIsMenuOpen(false)
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-slate-200 touch-manipulation"
                >
                  <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-semibold text-red-600">Start Over</div>
                    <div className="text-xs text-red-400">Reset all progress</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === "home" && (
          <HomeTab
            userProfile={userProfile}
            onNavigate={setActiveTab}
            onOpenArtGenerator={() => setIsArtGeneratorOpen(true)}
            updateProfile={updateProfile}
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
          <VoiceChatTab userProfile={userProfile} updateProfile={updateProfile} onBack={() => setActiveTab("home")} />
        )}
      </main>

      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-100">
        {isListening && (
          <div className="mb-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-base font-bold text-blue-900">Listening...</p>
            </div>
            {interimTranscript && <p className="text-lg font-medium text-slate-800 mt-1">{interimTranscript}</p>}
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-3 rounded-xl transition-all flex-shrink-0 touch-manipulation active:scale-95 ${
              isListening
                ? "text-white bg-red-500 shadow-lg animate-pulse"
                : "text-slate-500 hover:text-blue-600 hover:bg-white"
            }`}
            aria-label={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
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
            placeholder="Ask BOOMER AI anything..."
            className="flex-grow bg-transparent text-base text-slate-900 placeholder-slate-400 focus:outline-none resize-none min-h-[28px] max-h-[120px] overflow-y-auto font-medium py-2"
            disabled={isListening}
            rows={1}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex-shrink-0 touch-manipulation active:scale-95"
            aria-label="Send message"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>

      <nav
        className="flex-shrink-0 flex items-center justify-around bg-white border-t border-slate-200 px-2"
        style={{ height: "85px", paddingBottom: "max(env(safe-area-inset-bottom), 20px)" }}
      >
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all touch-manipulation active:scale-95 min-w-[70px] ${
            activeTab === "home" ? "text-blue-600" : "text-slate-400"
          }`}
          aria-label="Home"
        >
          <Home className="w-7 h-7" strokeWidth={activeTab === "home" ? 2.5 : 1.5} />
          <span className={`text-xs ${activeTab === "home" ? "font-bold" : "font-medium"}`}>Home</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all touch-manipulation active:scale-95 min-w-[70px] ${
            activeTab === "chat" ? "text-blue-600" : "text-slate-400"
          }`}
          aria-label="Chat"
        >
          <MessageSquare className="w-7 h-7" strokeWidth={activeTab === "chat" ? 2.5 : 1.5} />
          <span className={`text-xs ${activeTab === "chat" ? "font-bold" : "font-medium"}`}>Chat</span>
        </button>

        <button
          onClick={() => setActiveTab("lessons")}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all touch-manipulation active:scale-95 min-w-[70px] ${
            activeTab === "lessons" ? "text-blue-600" : "text-slate-400"
          }`}
          aria-label="Lessons"
        >
          <BookOpen className="w-7 h-7" strokeWidth={activeTab === "lessons" ? 2.5 : 1.5} />
          <span className={`text-xs ${activeTab === "lessons" ? "font-bold" : "font-medium"}`}>Learn</span>
        </button>

        <button
          onClick={() => setActiveTab("tips")}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all touch-manipulation active:scale-95 min-w-[70px] ${
            activeTab === "tips" ? "text-blue-600" : "text-slate-400"
          }`}
          aria-label="Tips"
        >
          <Lightbulb className="w-7 h-7" strokeWidth={activeTab === "tips" ? 2.5 : 1.5} />
          <span className={`text-xs ${activeTab === "tips" ? "font-bold" : "font-medium"}`}>Tips</span>
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all touch-manipulation active:scale-95 min-w-[70px] ${
            activeTab === "questions" ? "text-blue-600" : "text-slate-400"
          }`}
          aria-label="Q&A"
        >
          <HelpCircle className="w-7 h-7" strokeWidth={activeTab === "questions" ? 2.5 : 1.5} />
          <span className={`text-xs ${activeTab === "questions" ? "font-bold" : "font-medium"}`}>Q&A</span>
        </button>
      </nav>

      {isArtGeneratorOpen && (
        <AiArtModal
          isOpen={isArtGeneratorOpen}
          onClose={() => setIsArtGeneratorOpen(false)}
          userProfile={userProfile}
          updateProfile={updateProfile}
        />
      )}
    </div>
  )
}
