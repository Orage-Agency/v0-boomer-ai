"use client"

import type { UserProfile } from "@/app/page"
import { Brain, Headphones, MessageSquare, Sparkles, GraduationCap, Lightbulb, Rocket, Clock } from "lucide-react"

interface MainMenuProps {
  userProfile: UserProfile
  onNavigate: (view: string) => void
}

export function MainMenu({ userProfile, onNavigate }: MainMenuProps) {
  const displayName = userProfile.userTitle || "friend"
  const hasProfile = userProfile.persona && userProfile.level

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex-shrink-0 p-8 text-center border-b border-slate-200/70">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {hasProfile ? `Welcome, ${displayName}!` : "Welcome to your AI companion"}
        </h2>
        <p className="text-lg text-slate-600">
          {hasProfile
            ? `You're set to ${userProfile.level} level — explore what AI can do.`
            : "Let's explore what AI can do—together."}
        </p>
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-3">
        <button
          onClick={() => onNavigate("lesson-what-is-ai")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-3"
        >
          <Brain className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span>What is AI? An introduction</span>
        </button>

        <button
          onClick={() => onNavigate("audio-lessons")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-3"
        >
          <Headphones className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span>Listen to Audio Lessons</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("ai-chat")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-2"
          >
            <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>Ask a question</span>
          </button>
          <button
            onClick={() => onNavigate("lesson-meet-ai")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>Meet AI</span>
          </button>
        </div>

        <button
          onClick={() => onNavigate("lesson-first-lesson")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-3"
        >
          <GraduationCap className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span>Begin your first lesson</span>
        </button>

        <button
          onClick={() => onNavigate("lesson-everyday-uses")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-3"
        >
          <Lightbulb className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <span>Everyday uses</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("lesson-more-ai")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-2"
          >
            <Rocket className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>More AI…</span>
          </button>
          <button
            onClick={() => onNavigate("lesson-coming-soon")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md flex items-center gap-2"
          >
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span>Coming Soon</span>
          </button>
        </div>
      </div>
    </section>
  )
}
