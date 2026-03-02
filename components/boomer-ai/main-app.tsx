"use client"

import { useState, useRef, useEffect } from "react"
import { Home, MessageSquare, BookOpen, Star, Mic, MicOff, Send, Lightbulb, History, Menu, RotateCcw, X, Gamepad2, User, Palette } from "lucide-react"
import { HomeTab } from "./home-tab"
import { ChatTab } from "./chat-tab"
import { LessonsTab } from "./lessons-tab"
import { ProfileView } from "./profile-view"
import { TipsTab } from "./tips-tab"
import { ChatHistoryView } from "./chat-history-view"
import { QuestionsTab } from "./questions-tab"
import { VoiceChatTab } from "./voice-chat-tab"
import { PlayTab } from "./play-tab"
import { CelebrationModal } from "./celebration-modal"
import { AiArtTab } from "./ai-art-tab"
import { QuickQuestionsTab } from "./quick-questions"
import type { UserProfile } from "@/app/page"

interface MainAppProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onReset?: () => void
}

const REWARD_LEARNING_PROMPTS = [
  "Teach me something fascinating about AI that I can share with my friends!",
  "What's a fun and easy way I can use AI in my daily life?",
  "Tell me an interesting fact about technology that would surprise me!",
  "What's a creative way to use AI that most people don't know about?",
  "Explain something new in technology like I'm just getting started!",
  "What's a simple AI trick I can try right now?",
  "Share a fun tip about using AI that will make me look tech-savvy!",
  "What's something amazing AI can do that sounds like science fiction?",
]

export function MainApp({ userProfile, updateProfile, onReset }: MainAppProps) {
  const [activeTab, setActiveTab] = useState<
    "home" | "chat" | "lessons" | "tips" | "profile" | "history" | "questions" | "voice" | "play" | "aiart" | "askme"
  >("home")
  const [inputValue, setInputValue] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const recognitionRef = useRef<any>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pendingMessage, setPendingMessage] = useState<string | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationStars, setCelebrationStars] = useState(5)
  const [lastMilestone, setLastMilestone] = useState(() => Math.floor(userProfile.stars / 5) * 5)
  const [starPop, setStarPop] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"
      recognitionRef.current.maxAlternatives = 1

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

  useEffect(() => {
    const currentMilestone = Math.floor(userProfile.stars / 5) * 5
    if (currentMilestone > lastMilestone && currentMilestone > 0) {
      if (activeTab !== "chat" && activeTab !== "voice") {
        setCelebrationStars(5)
        setShowCelebration(true)
      }
      setLastMilestone(currentMilestone)
    }
  }, [userProfile.stars, lastMilestone, activeTab])

  useEffect(() => {
    setStarPop(true)
    const timer = setTimeout(() => setStarPop(false), 300)
    return () => clearTimeout(timer)
  }, [userProfile.stars])

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

    console.log("[v0] Sending message from main app:", inputValue)
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

  const handleCollectReward = () => {
    const randomPrompt = REWARD_LEARNING_PROMPTS[Math.floor(Math.random() * REWARD_LEARNING_PROMPTS.length)]
    setPendingChatPrompt(randomPrompt)
    setActiveTab("chat")
  }

  const handleStartChat = (prompt: string) => {
    setPendingChatPrompt(prompt)
    setActiveTab("chat")
  }

  const handleOpenCamera = () => {
    // Implement camera opening logic here
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        onCollectReward={handleCollectReward}
        message="Milestone Reached!"
        starsEarned={celebrationStars}
      />
      
      {isMenuOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                >
                  <X className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              {userProfile.email && <p className="text-sm text-slate-500 mt-2 truncate">{userProfile.email}</p>}
            </div>

            <div className="p-4 space-y-2">
              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setActiveTab("profile")
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-100 transition-colors text-left min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Profile</p>
                  <p className="text-sm text-slate-500">View your progress</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false)
                  setActiveTab("history")
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-slate-100 transition-colors text-left min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <History className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Chat History</p>
                  <p className="text-sm text-slate-500">Past conversations</p>
                </div>
              </button>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to start over? This will reset your onboarding progress.")) {
                    setIsMenuOpen(false)
                    if (onReset) {
                      onReset()
                    }
                  }
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-orange-50 transition-colors text-left min-h-[44px] touch-manipulation"
              >
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-bold text-orange-600">Start Over</p>
                  <p className="text-sm text-slate-500">Reset onboarding</p>
                </div>
              </button>


            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-slate-50 pb-safe">
              <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                <a href="/support" className="hover:text-blue-600 underline">
                  Support
                </a>
                <span>•</span>
                <a href="#privacy" className="hover:text-blue-600 underline">
                  Privacy
                </a>
                <span>•</span>
                <a href="#terms" className="hover:text-blue-600 underline">
                  Terms
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-40 sticky top-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("home")}
            className="hover:opacity-80 transition-opacity active:scale-95 touch-manipulation min-h-[44px] flex items-center"
            aria-label="Go to home"
          >
            <img src="/boomer-ai-logo.png" alt="Boomer AI" className="h-[50px] w-auto object-contain" />
          </button>
        </div>

        <div
          className={`flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full shadow-md border border-yellow-200 transition-transform ${
            starPop ? "scale-125" : "scale-100"
          }`}
        >
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="text-base font-bold text-slate-900">{userProfile.stars} Stars</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("voice")}
            className="relative group touch-manipulation flex items-center gap-2 min-h-[44px]"
            aria-label="Talk to AI Assistant"
          >
            <div className="w-[44px] h-[44px] rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-[2px] shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src="/voice-assistant-avatar.jpg" alt="Voice Assistant" className="w-full h-full object-cover" />
              </div>
            </div>
          </button>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      </header>

      <main className="flex-grow overflow-hidden flex flex-col">
        {activeTab === "home" && (
          <HomeTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            onStartChat={handleStartChat}
            onOpenLessons={() => setActiveTab("lessons")}
            onOpenTips={() => setActiveTab("tips")}
            onOpenQuestions={() => setActiveTab("questions")}
            onOpenVoice={() => setActiveTab("voice")}
  onOpenAiArt={() => setActiveTab("aiart")}
  onOpenGames={() => setActiveTab("play")}
  onOpenAskMe={() => setActiveTab("askme")}
  />
        )}

        {activeTab === "chat" && (
          <ChatTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            pendingMessage={pendingMessage}
            setPendingMessage={setPendingMessage}
            capturedImage={capturedImage}
            setCapturedImage={setCapturedImage}
            conversationId={currentConversationId}
            setConversationId={setCurrentConversationId}
            pendingChatPrompt={pendingChatPrompt}
            setPendingChatPrompt={setPendingChatPrompt}
          />
        )}

        {activeTab === "lessons" && (
          <LessonsTab
            userProfile={userProfile}
            updateProfile={updateProfile}
            onNavigateToChat={handleNavigateWithPrompt}
          />
        )}

        {activeTab === "tips" && <TipsTab userProfile={userProfile} onTryPrompt={handleNavigateWithPrompt} />}

        {activeTab === "profile" && (
          <ProfileView
            userProfile={userProfile}
            onReset={onReset}
            onBack={() => setActiveTab("home")}

          />
        )}

        {activeTab === "history" && (
          <ChatHistoryView
            userProfile={userProfile}
            onBack={() => setActiveTab("home")}
            onLoadConversation={(id, messages) => {
              setCurrentConversationId(id)
              setActiveTab("chat")
            }}
          />
        )}

        {activeTab === "questions" && <QuestionsTab userProfile={userProfile} updateProfile={updateProfile} />}

        {activeTab === "voice" && (
          <VoiceChatTab userProfile={userProfile} updateProfile={updateProfile} onBack={() => setActiveTab("home")} />
        )}

        {activeTab === "play" && <PlayTab userProfile={userProfile} updateProfile={updateProfile} />}

  {activeTab === "aiart" && (
  <AiArtTab
  userProfile={userProfile}
  updateProfile={updateProfile}
  onBack={() => setActiveTab("home")}
  />
  )}
  
  {activeTab === "askme" && (
  <QuickQuestionsTab
  onQuestionSelect={(question) => {
    setPendingMessage(question)
    setActiveTab("chat")
  }}
  />
  )}
  </main>

      <div className="flex-shrink-0 px-4 py-3 bg-white border-t border-slate-100 z-30 pb-safe">
        {isListening && (
          <div className="mb-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-2xl shadow-lg animate-pulse">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <p className="text-base font-bold text-blue-900">Listening...</p>
            </div>
            {interimTranscript && <p className="text-base font-medium text-slate-800 mt-1">{interimTranscript}</p>}
          </div>
        )}

        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]">
          <button
            onClick={toggleVoiceRecognition}
            className={`p-3 rounded-xl transition-all flex-shrink-0 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex-shrink-0 touch-manipulation active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <nav
        className="flex-shrink-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 pt-2 pb-safe z-50"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}
      >
        <div className="flex items-center justify-around">
          {[
            { id: "home", icon: Home, label: "Home" },
            { id: "chat", icon: MessageSquare, label: "Chat" },
            { id: "lessons", icon: BookOpen, label: "Learn" },
            { id: "tips", icon: Lightbulb, label: "Tips" },
            { id: "play", icon: Gamepad2, label: "Play" },
            { id: "aiart", icon: Palette, label: "AI Art" },
          ].map((item) => {
            const IconComponent = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl transition-all touch-manipulation min-h-[56px] min-w-[56px] ${
                  activeTab === item.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                <IconComponent className="w-6 h-6" />
                <span className={`text-xs mt-1 font-medium ${activeTab === item.id ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
