"use client"

import { useState, useEffect } from "react"
import { AvatarSelection } from "@/components/boomer-ai/avatar-selection"
import { AgeSelection } from "@/components/boomer-ai/age-selection"
import { LearningLevel } from "@/components/boomer-ai/learning-level"
import { MainApp } from "@/components/boomer-ai/main-app"
import { Stepper } from "@/components/boomer-ai/stepper"

export type UserProfile = {
  persona: string | null
  age: string | null
  aiLevel: number
  userTitle: string | null
  avatarSrc: string | null
  level: string | null
  stars: number
  streak: number
  badges: string[]
  lessonsCompleted: string[]
  userName: string | null
  name?: string
  deviceId: string | null
  dailyArtCount: number
  lastArtDate: string | null
  pinnedFeatures: string[]
  email: string | null
  isLoggedIn: boolean
}

function calculateLevelFromStars(stars: number): string {
  if (stars < 200) return "Basic"
  if (stars < 600) return "Intermediate"
  if (stars < 1400) return "Advanced"
  return "Expert"
}

const DEFAULT_PROFILE: UserProfile = {
  persona: null,
  age: null,
  aiLevel: 0,
  userTitle: null,
  avatarSrc: null,
  level: null,
  stars: 0,
  streak: 0,
  badges: [],
  lessonsCompleted: [],
  userName: null,
  deviceId: null,
  dailyArtCount: 0,
  lastArtDate: null,
  pinnedFeatures: [],
  email: null,
  isLoggedIn: false,
}

export default function BoomerAIPage() {
  const [currentView, setCurrentView] = useState<"onboarding" | "app">("onboarding")
  const [onboardingStep, setOnboardingStep] = useState<"avatar" | "age" | "level">("avatar")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let deviceId = localStorage.getItem("boomer-device-id")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("boomer-device-id", deviceId)
    }

    // Try to load existing profile
    loadProfile(deviceId)
  }, [])

  const loadProfile = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/profile?deviceId=${deviceId}`)
      const data = await response.json()

      if (data.success && data.profile) {
        const loadedProfile = { ...data.profile, deviceId, isLoggedIn: false, email: null }
        setUserProfile(loadedProfile)
        if (loadedProfile.level) {
          setCurrentView("app")
        }
      } else {
        // Fallback to localStorage
        try {
          const saved = localStorage.getItem("boomer_profile")
          if (saved) {
            const profile = JSON.parse(saved)
            setUserProfile({ ...profile, deviceId })
            if (profile.level) {
              setCurrentView("app")
            }
          } else {
            setUserProfile({ ...DEFAULT_PROFILE, deviceId })
          }
        } catch {
          setUserProfile({ ...DEFAULT_PROFILE, deviceId })
        }
      }
    } catch {
      // Fallback to localStorage on error
      try {
        const saved = localStorage.getItem("boomer_profile")
        if (saved) {
          const profile = JSON.parse(saved)
          setUserProfile({ ...profile, deviceId })
          if (profile.level) {
            setCurrentView("app")
          }
        } else {
          setUserProfile({ ...DEFAULT_PROFILE, deviceId })
        }
      } catch {
        setUserProfile({ ...DEFAULT_PROFILE, deviceId })
      }
    }
  }

  const saveToDatabase = async (profile: UserProfile) => {
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
    } catch {
      // Silently fail - data is saved to localStorage as backup
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (updates.stars !== undefined) {
      const correctLevel = calculateLevelFromStars(updates.stars)
      updates.level = correctLevel
    }

    const newProfile = { ...userProfile, ...updates }
    setUserProfile(newProfile)
    if (mounted) {
      localStorage.setItem("boomer_profile", JSON.stringify(newProfile))
      if (newProfile.userName && newProfile.level) {
        saveToDatabase(newProfile)
      }
    }
  }

  const resetProfile = () => {
    const deviceId = localStorage.getItem("boomer-device-id")
    setUserProfile({ ...DEFAULT_PROFILE, deviceId })
    if (mounted) {
      localStorage.removeItem("boomer_profile")
    }
    setCurrentView("onboarding")
    setOnboardingStep("avatar")
  }

  const skipOnboarding = () => {
    updateProfile({ age: userProfile.age ?? null, aiLevel: 0, level: userProfile.level || "Beginner" })
    setCurrentView("app")
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Loading Boomer AI...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-white flex items-center justify-center"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div className="relative bg-white w-full max-w-md md:max-w-2xl lg:max-w-full lg:w-screen mx-auto h-screen overflow-hidden flex flex-col md:border-x md:border-slate-200 lg:border-none">
        {currentView === "onboarding" && (
          <>
            <div className="flex items-center gap-4 px-6 pt-5 pb-4 border-b border-slate-200">
              <Stepper currentStep={onboardingStep === "avatar" ? 1 : onboardingStep === "age" ? 2 : 3} />
              <button
                type="button"
                onClick={skipOnboarding}
                className="shrink-0 rounded-lg px-3 py-2 text-base font-semibold text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              >
                Skip for now
              </button>
            </div>

            <main className="flex-grow overflow-y-auto hide-scrollbar">
              {onboardingStep === "avatar" && (
                <AvatarSelection
                  onSelect={(persona, userTitle, avatarSrc, userName) => {
                    updateProfile({ persona, userTitle, avatarSrc, userName, name: userName })
                    setOnboardingStep("age")
                  }}
                />
              )}

              {onboardingStep === "age" && (
                <AgeSelection
                  onSelect={(age) => {
                    updateProfile({ age, aiLevel: 0 })
                    setOnboardingStep("level")
                  }}
                  onSkip={() => {
                    updateProfile({ age: null, aiLevel: 0 })
                    setOnboardingStep("level")
                  }}
                />
              )}

              {onboardingStep === "level" && (
                <LearningLevel
                  recommendedLevel={userProfile.level || "Beginner"}
                  onContinue={(level) => {
                    updateProfile({ level, aiLevel: 0 })
                    setCurrentView("app")
                  }}
                />
              )}
            </main>
          </>
        )}

        {currentView === "app" && (
          <MainApp
            userProfile={userProfile}
            updateProfile={updateProfile}
            onReset={resetProfile}
          />
        )}
      </div>
    </div>
  )
}
