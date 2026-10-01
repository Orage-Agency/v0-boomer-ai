"use client"

import { BookOpen, HelpCircle, Image, Lightbulb, MessageSquare, Mic } from "lucide-react"
import type { UserProfile } from "@/app/page"

interface HomeTabProps {
  userProfile: UserProfile
  onStartChat: (prompt?: string) => void
  onOpenLessons: () => void
  onOpenTips: () => void
  onOpenQuestions: () => void
  onOpenVoice: () => void
  onOpenAiArt: () => void
  onOpenAskMe: () => void
}

export function HomeTab({
  userProfile,
  onStartChat,
  onOpenLessons,
  onOpenTips,
  onOpenQuestions,
  onOpenVoice,
  onOpenAiArt,
  onOpenAskMe,
}: HomeTabProps) {
  const displayName = userProfile.name || userProfile.userName

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 py-7 sm:px-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {displayName ? `Hello, ${displayName}` : "Welcome"}
          </h1>
          <p className="mt-2 text-lg leading-relaxed text-slate-600">What would you like to learn or try today?</p>
        </header>

        <section aria-labelledby="start-heading">
          <h2 id="start-heading" className="mb-3 text-lg font-semibold text-slate-900">Start here</h2>
          <button
            type="button"
            onClick={() => onStartChat()}
            className="flex min-h-24 w-full items-center justify-between gap-4 rounded-2xl border border-slate-300 bg-slate-50 px-5 py-5 text-left transition-colors hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            <span>
              <span className="block text-xl font-semibold text-slate-950">Chat with AI</span>
              <span className="mt-1 block text-base leading-relaxed text-slate-600">Ask a question or get help with a task.</span>
            </span>
            <MessageSquare aria-hidden="true" className="h-7 w-7 shrink-0 text-slate-700" strokeWidth={1.8} />
          </button>
        </section>

        <section aria-labelledby="learn-heading">
          <h2 id="learn-heading" className="mb-3 text-lg font-semibold text-slate-900">Learn at your pace</h2>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
            <HomeAction icon={BookOpen} title="Lessons" description="Follow a practical, step-by-step guide." onClick={onOpenLessons} />
            <HomeAction icon={Lightbulb} title="Tips" description="Find a useful idea for everyday tasks." onClick={onOpenTips} />
          </div>
        </section>

        <section aria-labelledby="explore-heading">
          <h2 id="explore-heading" className="mb-3 text-lg font-semibold text-slate-900">Explore more</h2>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200">
            <HomeAction icon={Mic} title="Voice chat" description="Talk with the assistant." onClick={onOpenVoice} />
            <HomeAction icon={HelpCircle} title="Quick questions" description="Choose a question to start a conversation." onClick={onOpenAskMe} />
            <HomeAction icon={Image} title="Create an image" description="Describe an image you would like AI to make." onClick={onOpenAiArt} />
            <HomeAction icon={MessageSquare} title="Question library" description="Browse more ideas to ask AI." onClick={onOpenQuestions} />
          </div>
        </section>
      </div>
    </div>
  )
}

function HomeAction({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: typeof BookOpen
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-20 w-full items-center gap-4 px-4 py-4 text-left transition-colors first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-slate-700"
    >
      <Icon aria-hidden="true" className="h-6 w-6 shrink-0 text-slate-700" strokeWidth={1.8} />
      <span className="min-w-0 flex-1">
        <span className="block text-base font-semibold text-slate-900">{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-slate-600">{description}</span>
      </span>
      <span aria-hidden="true" className="text-2xl leading-none text-slate-400">›</span>
    </button>
  )
}
