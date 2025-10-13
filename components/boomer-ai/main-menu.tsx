"use client"

import type { UserProfile } from "@/app/page"

interface MainMenuProps {
  userProfile: UserProfile
  onNavigate: (view: string) => void
}

export function MainMenu({ userProfile, onNavigate }: MainMenuProps) {
  const displayName = userProfile.userTitle || "friend"
  const hasProfile = userProfile.persona && userProfile.level

  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="p-8 text-center border-b border-slate-200/70">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">
          {hasProfile ? `Welcome, ${displayName}!` : "Welcome to your AI companion"}
        </h2>
        <p className="text-lg text-slate-600">
          {hasProfile
            ? `You're set to ${userProfile.level} level — explore what AI can do.`
            : "Let's explore what AI can do—together."}
        </p>
      </div>

      <div className="p-6 space-y-3">
        <button
          onClick={() => onNavigate("lesson-what-is-ai")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md"
        >
          What is AI? An introduction
        </button>

        <button
          onClick={() => onNavigate("audio-lessons")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md"
        >
          Listen to Audio Lessons
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("ai-chat")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md"
          >
            Ask a question
          </button>
          <button
            onClick={() => onNavigate("lesson-meet-ai")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md"
          >
            Meet AI
          </button>
        </div>

        <button
          onClick={() => onNavigate("lesson-first-lesson")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md"
        >
          Begin your first lesson
        </button>

        <button
          onClick={() => onNavigate("lesson-everyday-uses")}
          className="w-full bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 text-left hover:shadow-md"
        >
          Everyday uses
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("lesson-more-ai")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md"
          >
            More AI…
          </button>
          <button
            onClick={() => onNavigate("lesson-coming-soon")}
            className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-4 rounded-xl transition-all duration-200 text-left hover:shadow-md"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </section>
  )
}
