"use client"

import { ImageIcon, Loader2, MessageSquare } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useUser } from "@/contexts/user-context"
import Link from "next/link"

interface ProfileViewProps {
  userProfile: UserProfile
  onReset: () => void
  onBack: () => void
}

export function ProfileView({ userProfile, onReset, onBack }: ProfileViewProps) {
  const { email, galleryCount, chatHistory, isLoading } = useUser()
  const displayName = userProfile.name || userProfile.userName || "User"
  const completedLessons = userProfile.lessonsCompleted?.length ?? 0

  return (
    <section className="h-full overflow-y-auto bg-white px-5 py-7 sm:px-8">
      <div className="mx-auto w-full max-w-xl space-y-7">
        <header className="text-center">
          <img
            src={userProfile.avatarSrc || "https://placehold.co/128x128/E2E8F0/475569?text=AI"}
            alt="Your selected avatar"
            className="mx-auto mb-4 h-20 w-20 rounded-full object-cover"
          />
          <h1 className="text-2xl font-bold text-slate-950">Your Profile</h1>
          <p className="mt-1 text-base text-slate-600">{displayName}</p>
          {email && <p className="mt-1 text-sm text-slate-500">{email}</p>}
        </header>

        <section aria-labelledby="learning-progress" className="rounded-2xl border border-slate-200 p-5">
          <h2 id="learning-progress" className="text-lg font-semibold text-slate-950">Your learning</h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {completedLessons === 0
              ? "Your completed lessons will appear here as you learn."
              : `${completedLessons} ${completedLessons === 1 ? "lesson" : "lessons"} completed.`}
          </p>
          <dl className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
            <ProfileRow label="Starting point" value={userProfile.level || "Beginner"} />
            <ProfileRow label="Companion" value={userProfile.persona || "Not set"} />
            <ProfileRow label="Age range" value={userProfile.age || "Not shared"} />
            <ProfileRow label="Lessons completed" value={String(completedLessons)} />
          </dl>
        </section>

        <section aria-labelledby="saved-data" className="rounded-2xl border border-slate-200 p-5">
          <h2 id="saved-data" className="text-lg font-semibold text-slate-950">Your saved activity</h2>
          {isLoading ? (
            <div className="flex justify-center py-5" role="status" aria-label="Loading saved activity">
              <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
            </div>
          ) : (
            <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200">
              <ProfileRow icon={MessageSquare} label="Saved conversations" value={String(chatHistory.length)} />
              <ProfileRow icon={ImageIcon} label="Created images" value={String(galleryCount)} />
            </div>
          )}
        </section>

        <div className="space-y-3">
          <button
            onClick={onReset}
            className="min-h-12 w-full rounded-xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            Start over
          </button>
          <button
            onClick={onBack}
            className="min-h-12 w-full rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            Back to Home
          </button>
        </div>

        <footer className="flex items-center justify-center gap-4 border-t border-slate-200 pt-5 text-sm text-slate-600">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-slate-950">Privacy Policy</Link>
          <Link href="/terms" className="underline underline-offset-4 hover:text-slate-950">Terms of Service</Link>
        </footer>
      </div>
    </section>
  )
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof MessageSquare
  label: string
  value: string
}) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
      <dt className="flex items-center gap-2 text-sm text-slate-600">
        {Icon && <Icon aria-hidden="true" className="h-4 w-4 text-slate-600" />}
        {label}
      </dt>
      <dd className="text-right text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  )
}
