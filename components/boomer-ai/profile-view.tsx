"use client"

import { useState, type FormEvent } from "react"
import { ImageIcon, Loader2, MessageSquare } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useUser } from "@/contexts/user-context"
import { createUser, loginUser } from "@/lib/auth-service"
import Link from "next/link"

interface ProfileViewProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onReset: () => void
  onBack: () => void
}

export function ProfileView({ userProfile, updateProfile, onReset, onBack }: ProfileViewProps) {
  const { email, galleryCount, chatHistory, isLoading, isLoggedIn, login, logout, refreshData } = useUser()
  const [isCreatingAccount, setIsCreatingAccount] = useState(false)
  const [name, setName] = useState("")
  const [accountEmail, setAccountEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accountError, setAccountError] = useState<string | null>(null)
  const [accountBusy, setAccountBusy] = useState(false)
  const displayName = userProfile.name || userProfile.userName || "User"
  const completedLessons = userProfile.lessonsCompleted?.length ?? 0

  const submitAccount = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAccountError(null)
    if (isCreatingAccount && password.length < 12) {
      setAccountError("Use a password with at least 12 characters.")
      return
    }
    setAccountBusy(true)
    try {
      const result = isCreatingAccount
        ? await createUser(accountEmail, password, name)
        : await loginUser(accountEmail, password)
      if (!result.success || !result.user) throw new Error(result.error || "Unable to sign in.")
      await login(result.user.email, result.user.name)
      await refreshData()
      updateProfile({ email: result.user.email, isLoggedIn: true, userName: result.user.name, name: result.user.name })
      setPassword("")
    } catch (error) {
      setAccountError(error instanceof Error ? error.message : "Unable to sign in.")
    } finally {
      setAccountBusy(false)
    }
  }

  const signOut = async () => {
    await logout()
    updateProfile({ email: null, isLoggedIn: false })
  }

  return (
    <section className="h-full overflow-y-auto bg-white px-5 py-7 sm:px-8">
      <div className="mx-auto w-full max-w-xl space-y-7">
        <header className="text-center">
          <h1 className="text-2xl font-bold text-slate-950">{displayName}</h1>
        </header>

        <section aria-labelledby="account-heading" className="rounded-2xl border border-slate-200 p-5">
          <h2 id="account-heading" className="text-lg font-semibold text-slate-950">Your account</h2>
          {isLoggedIn ? (
            <div className="mt-3 space-y-3">
              <p className="text-base text-slate-600">Signed in as {email}. Your account can keep progress across devices.</p>
              <button
                type="button"
                onClick={() => void signOut()}
                className="min-h-12 rounded-xl border border-slate-300 px-5 py-3 text-base font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              <p className="mt-2 text-base text-slate-600">Create an account or sign in to keep your learning progress across devices.</p>
              <div className="mt-4 flex gap-2" role="group" aria-label="Account action">
                <button type="button" onClick={() => { setIsCreatingAccount(false); setAccountError(null) }} aria-pressed={!isCreatingAccount} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 aria-pressed:bg-slate-100">Sign in</button>
                <button type="button" onClick={() => { setIsCreatingAccount(true); setAccountError(null) }} aria-pressed={isCreatingAccount} className="min-h-11 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 aria-pressed:bg-slate-100">Create account</button>
              </div>
              <form className="mt-4 space-y-3" onSubmit={submitAccount}>
                {isCreatingAccount && (
                  <label className="block text-sm font-medium text-slate-700">
                    Name
                    <input required autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-950" />
                  </label>
                )}
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input required type="email" autoComplete="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-950" />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Password{isCreatingAccount ? " (at least 12 characters)" : ""}
                  <input required type="password" autoComplete={isCreatingAccount ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 min-h-12 w-full rounded-lg border border-slate-300 px-3 text-base text-slate-950" />
                </label>
                {accountError && <p className="text-sm text-red-700" role="alert">{accountError}</p>}
                <button type="submit" disabled={accountBusy} className="min-h-12 w-full rounded-xl bg-slate-900 px-5 py-3 text-base font-semibold text-white hover:bg-slate-700 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
                  {accountBusy ? "Please wait…" : isCreatingAccount ? "Create account" : "Sign in and sync progress"}
                </button>
              </form>
            </>
          )}
        </section>

        <section aria-labelledby="learning-progress" className="rounded-2xl border border-slate-200 p-5">
          <h2 id="learning-progress" className="text-lg font-semibold text-slate-950">Your learning</h2>
          <p className="mt-2 text-base leading-relaxed text-slate-600">
            {completedLessons === 0
              ? "Your completed lessons will appear here as you learn."
              : `${completedLessons} ${completedLessons === 1 ? "lesson" : "lessons"} completed.`}
          </p>
          <dl className="mt-5 divide-y divide-slate-200 rounded-xl border border-slate-200">
            <ProfileRow label="Starting point" value={userProfile.level || "Beginner"} />
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
