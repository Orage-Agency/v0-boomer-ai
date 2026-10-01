"use client"

import { ArrowLeft } from "lucide-react"
import type { UserProfile } from "@/app/page"

interface HeaderProps {
  currentView: string
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
  const displayName = userProfile.name || userProfile.userName || "Profile"
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
        className="min-h-11 max-w-28 flex-shrink-0 truncate rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        aria-label={`Open ${displayName}'s profile`}
      >
        {displayName}
      </button>
    </header>
  )
}
