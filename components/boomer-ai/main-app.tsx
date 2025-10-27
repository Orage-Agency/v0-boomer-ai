"use client"

import { useState, useRef, useEffect } from "react"
import { Home, MessageSquare, BookOpen, User, Star, Mic, MicOff, Send, Lightbulb } from "lucide-react"
import { HomeTab } from "./home-tab"
import { ChatTab } from "./chat-tab"
import { LessonsTab } from "./lessons-tab"
import { ProfileView } from "./profile-view"
import { TipsTab } from "./tips-tab"
import type { UserProfile } from "@/app/page"

interface MainAppProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onReset: () => void
}

export function MainApp({ userProfile, updateProfile, onReset }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "lessons" | "tips" | "profile">("home")
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<any>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputValue((prev) => prev + " " + transcript)
        setIsListening(false)
      }

      recognitionRef.current.onerror = () => {
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const toggleVoiceRecognition = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in your browser. Please try Chrome or Safari.")
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
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

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header with Stars */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
        <h1 className="text-2xl font-bold text-slate-900">Boomer AI</h1>
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-lg font-bold text-slate-900">{userProfile.stars}</span>
        </div>
      </header>

      {/* Main Content - adjusted height to account for input */}
      <main className="flex-grow overflow-hidden" style={{ height: "calc(100vh - 64px - 100px - 80px)" }}>
        {activeTab === "home" && <HomeTab userProfile={userProfile} onNavigate={setActiveTab} />}
        {activeTab === "chat" && (
          <ChatTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            pendingMessage={pendingMessage}
            onMessageSent={() => setPendingMessage(null)}
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
        {activeTab === "profile" && (
          <ProfileView userProfile={userProfile} onReset={onReset} onBack={() => setActiveTab("home")} />
        )}
      </main>

      <div className="flex-shrink-0 px-4 py-3 border-t-2 border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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

      {/* Bottom Navigation */}
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
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
            activeTab === "profile" ? "bg-blue-100 text-blue-600" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <User className="w-6 h-6" />
          <span className="text-xs font-semibold">Profile</span>
        </button>
      </nav>
    </div>
  )
}
