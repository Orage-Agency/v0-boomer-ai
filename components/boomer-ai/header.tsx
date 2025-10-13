"use client"

import { ArrowLeft } from "lucide-react"
import type { UserProfile, ViewType } from "@/app/page"

interface HeaderProps {
  currentView: ViewType
  userProfile: UserProfile
  onBack: () => void
  onProfile: () => void
}

const VIEW_TITLES: Record<string, string> = {
  "main-menu": "Boomer AI",
  profile: "Your Profile",
  "lesson-what-is-ai": "What is AI?",
  "lesson-first-lesson": "Begin your first lesson",
  "lesson-everyday-uses": "Everyday uses",
  "lesson-chat-gpt": "Meet ChatGPT",
  "audio-lessons": "Listen to Audio Lessons",
  "lesson-more-ai": "More AI…",
  "lesson-coming-soon": "Coming Soon",
}

export function Header({ currentView, userProfile, onBack, onProfile }: HeaderProps) {
  const showBackButton = currentView !== "main-menu"
  const title = VIEW_TITLES[currentView] || "Boomer AI"

  return (
    <header className="flex items-center justify-between px-4 py-4 border-b border-slate-200/70 bg-white/90 backdrop-blur-sm z-10 flex-shrink-0">
      <button
        onClick={onBack}
        className={`text-slate-600 hover:text-slate-900 rounded-full p-2 hover:bg-slate-100 transition-colors ${!showBackButton ? "invisible" : ""}`}
        aria-label="Back to main menu"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div
        className="flex-grow text-center cursor-pointer select-none"
        onClick={currentView !== "main-menu" ? onBack : undefined}
      >
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      </div>

      <button
        onClick={onProfile}
        className="w-11 h-11 flex-shrink-0 rounded-full overflow-hidden ring-2 ring-slate-200 hover:ring-slate-300 transition-all"
        aria-label="Open profile"
      >
        <img
          src={userProfile.avatarSrc || "https://placehold.co/44x44/E2E8F0/475569?text=AI"}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </button>
    </header>
  )
}
