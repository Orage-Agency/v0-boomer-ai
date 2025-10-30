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
} from "lucide-react"
import { HomeTab } from "./home-tab"
import { ChatTab } from "./chat-tab"
import { LessonsTab } from "./lessons-tab"
import { ProfileView } from "./profile-view"
import { TipsTab } from "./tips-tab"
import { AiArtModal } from "./ai-art-modal"
import { ChatHistoryView } from "./chat-history-view"
import { QuestionsTab } from "./questions-tab"
import type { UserProfile } from "@/app/page"

interface MainAppProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onReset: () => void
}

export function MainApp({ userProfile, updateProfile, onReset }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<
    "home" | "chat" | "lessons" | "tips" | "profile" | "history" | "questions"
  >("home")
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const recognitionRef = useRef<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [isArtGeneratorOpen, setIsArtGeneratorOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

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
        }
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
        setInterimTranscript("")
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        setInterimTranscript("")
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
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    setPendingMessage(inputValue)
    setInputValue("")
    setActiveTab("chat")
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

  return (
    <div className="flex flex-col h-screen bg-white">
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <button onClick={() => setActiveTab("home")} className="hover:opacity-80 transition-opacity">
          <img src="/boomer-ai-logo.png" alt="Boomer AI" className="h-[90px] w-auto object-contain" />
        </button>

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
          />
        )}
        {activeTab === "chat" && (
          <ChatTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            pendingMessage={pendingMessage}
            onMessageSent={() => setPendingMessage(null)}
            capturedImage={capturedImage}
            onImageCleared={() => setCapturedImage(null)}
            conversationId={currentConversationId}
            onNewConversation={() => setCurrentConversationId(null)}
          />
        )}
        {activeTab === "lessons" && <LessonsTab userProfile={userProfile} updateProfile={updateProfile} />}
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
      </main>

      <div className="flex-shrink-0 px-4 py-3 border-t-2 border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {isListening && interimTranscript && (
          <div className="mb-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">You're saying: </span>
              <span className="italic">{interimTranscript}</span>
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 border-2 border-slate-300 rounded-2xl p-3 bg-white focus-within:border-blue-500 focus-within:shadow-lg transition-all">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-2 rounded-xl transition-all flex-shrink-0 ${
              isListening
                ? "text-red-600 bg-red-50 animate-pulse"
                : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={isListening ? "Listening..." : "Ask BOOMER AI anything..."}
            className="flex-grow bg-transparent text-lg text-slate-900 placeholder-slate-500 focus:outline-none"
            disabled={isListening}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex-shrink-0"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
        {isListening && (
          <p className="text-center text-sm font-semibold text-blue-600 mt-2 animate-pulse">
            🎤 Listening... Speak now
          </p>
        )}
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
