"use client"

import { Star, Trophy, Target, Trash2, LogOut } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useEffect } from "react"

interface ProfileViewProps {
  userProfile: UserProfile
  onReset: () => void
  onBack: () => void
  onDeleteAccount?: () => void
  onLogout?: () => void
}

function getLevelProgress(userProfile: UserProfile) {
  const stars = userProfile.stars || 0

  let currentLevel = "Basic"
  if (stars >= 1400) currentLevel = "Expert"
  else if (stars >= 600) currentLevel = "Advanced"
  else if (stars >= 200) currentLevel = "Intermediate"
  else currentLevel = "Basic"

  let currentLevelStars = 0
  let starsNeeded = 0
  let nextLevelName = null

  if (currentLevel === "Basic") {
    currentLevelStars = stars
    starsNeeded = 200
    nextLevelName = "Intermediate"
  } else if (currentLevel === "Intermediate") {
    currentLevelStars = stars - 200
    starsNeeded = 400
    nextLevelName = "Advanced"
  } else if (currentLevel === "Advanced") {
    currentLevelStars = stars - 600
    starsNeeded = 800
    nextLevelName = "Expert"
  } else {
    // Expert level - completed
    return {
      currentLevelStars: stars,
      starsNeeded: 0,
      progress: 100,
      nextLevelName: null,
      isComplete: true,
      displayLevel: "Expert",
    }
  }

  const progress = Math.min((currentLevelStars / starsNeeded) * 100, 100)

  return {
    currentLevelStars: Math.max(0, currentLevelStars),
    starsNeeded,
    progress,
    nextLevelName,
    isComplete: false,
    displayLevel: currentLevel,
  }
}

export function ProfileView({ userProfile, onReset, onBack, onDeleteAccount, onLogout }: ProfileViewProps) {
  const { currentLevelStars, starsNeeded, progress, nextLevelName, isComplete, displayLevel } =
    getLevelProgress(userProfile)

  useEffect(() => {
    console.log("[v0] Profile stars:", userProfile.stars)
    console.log("[v0] Calculated level:", displayLevel)
    console.log("[v0] Current level stars:", currentLevelStars)
    console.log("[v0] Stars needed:", starsNeeded)
    console.log("[v0] Progress:", progress, "%")
  }, [userProfile.stars, displayLevel, currentLevelStars, starsNeeded, progress])

  return (
    <section className="h-full flex flex-col p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Profile</h2>

        <img
          src={userProfile.avatarSrc || "https://placehold.co/128x128/E2E8F0/475569?text=AI"}
          alt="Your selected avatar"
          className="w-24 h-24 object-cover rounded-full mx-auto shadow-lg mb-4 ring-4 ring-white"
        />

        {userProfile.email && (
          <div className="text-center mb-6">
            <p className="text-lg font-bold text-slate-900">{userProfile.name || userProfile.userName || "User"}</p>
            <p className="text-sm text-slate-500">{userProfile.email}</p>
          </div>
        )}

        {/* Progress card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border-2 border-blue-200 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Progress to {nextLevelName || "Complete"}
            </h3>
            <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border-2 border-yellow-400">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="text-lg font-bold text-slate-900">{userProfile.stars}</span>
            </div>
          </div>

          {!isComplete ? (
            <>
              <div className="relative w-full h-8 bg-white rounded-full overflow-hidden border-2 border-slate-200 mb-3 shadow-inner">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 flex items-center justify-center"
                  style={{ width: `${progress}%` }}
                >
                  {progress > 15 && (
                    <span className="text-xs font-bold text-white drop-shadow">{Math.round(progress)}%</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-sm mb-2">
                <span className="text-slate-600 font-medium">
                  {currentLevelStars} / {starsNeeded} stars
                </span>
                <span className="text-blue-600 font-bold">{starsNeeded - currentLevelStars} to go!</span>
              </div>

              <div className="mb-3 p-2 bg-white rounded-lg border border-slate-200 text-center">
                <p className="text-xs text-slate-600">Current Level</p>
                <p className="text-lg font-bold text-blue-600">{displayLevel}</p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-200">
                <p className="text-xs text-slate-600 text-center">
                  <span className="font-bold text-blue-600">Goal:</span> Complete all levels to unlock{" "}
                  <span className="font-bold text-purple-600">1 FREE MONTH</span> of Boomer AI Premium!
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-3 animate-bounce" />
              <p className="text-lg font-bold text-slate-900 mb-2">Congratulations!</p>
              <p className="text-sm text-slate-600 mb-3">
                You've completed all levels and earned <span className="font-bold text-purple-600">1 FREE MONTH</span>{" "}
                of Boomer AI Premium!
              </p>
              <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl border-2 border-yellow-400">
                <p className="text-xs font-bold text-slate-900">Check your email for your premium access code!</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile info card */}
        <div className="space-y-2 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">Companion:</p>
            <p className="text-sm font-bold text-slate-900">{userProfile.persona || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">Your Title:</p>
            <p className="text-sm font-bold text-slate-900">{userProfile.userTitle || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">Age Range:</p>
            <p className="text-sm font-bold text-slate-900">{userProfile.age || "Not set"}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">Learning Level:</p>
            <p className="text-sm font-bold text-slate-900">{displayLevel}</p>
          </div>
          <hr className="border-slate-200" />
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-600 font-medium">Streak:</p>
            <p className="text-sm font-bold text-orange-600">{userProfile.streak} days</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {onLogout && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to log out?")) {
                  onLogout()
                }
              }}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-900 font-bold text-base py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          )}

          <button
            onClick={onReset}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-base py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Start Over
          </button>

          {onDeleteAccount && (
            <button
              onClick={() => {
                if (
                  confirm(
                    "Are you sure you want to delete your account? This action cannot be undone. All your data, including stars and progress, will be permanently deleted.",
                  )
                ) {
                  if (confirm("This is your final warning. Delete account permanently?")) {
                    onDeleteAccount()
                  }
                }
              }}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-base py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Delete Account
            </button>
          )}

          <button
            onClick={onBack}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base py-3 px-6 rounded-xl transition-colors"
          >
            Back to Menu
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
            <a href="#privacy" className="hover:text-blue-600 underline">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="#terms" className="hover:text-blue-600 underline">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
