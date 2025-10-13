"use client"

import type { UserProfile } from "@/app/page"

interface ProfileViewProps {
  userProfile: UserProfile
  onReset: () => void
  onBack: () => void
}

export function ProfileView({ userProfile, onReset, onBack }: ProfileViewProps) {
  return (
    <section className="p-8 text-center min-h-full flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Profile</h2>

        <img
          src={userProfile.avatarSrc || "https://placehold.co/128x128/E2E8F0/475569?text=AI"}
          alt="Your selected avatar"
          className="w-32 h-32 object-cover rounded-full mx-auto shadow-lg mb-6 ring-4 ring-white"
        />

        <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="flex justify-between items-center">
            <p className="text-slate-600 font-medium">Companion:</p>
            <p className="font-bold text-slate-900">{userProfile.persona || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-slate-600 font-medium">Your Title:</p>
            <p className="font-bold text-slate-900">{userProfile.userTitle || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-slate-600 font-medium">Age Range:</p>
            <p className="font-bold text-slate-900">{userProfile.age || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-slate-600 font-medium">Learning Level:</p>
            <p className="font-bold text-slate-900">{userProfile.level || "Not set"}</p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Start Over
        </button>
        <button
          onClick={onBack}
          className="mt-3 w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-lg py-4 px-6 rounded-xl transition-colors"
        >
          Back to Menu
        </button>
      </div>
    </section>
  )
}
