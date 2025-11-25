"use client"

import { useState, useEffect } from "react"
import { AvatarSelection } from "@/components/boomer-ai/avatar-selection"
import { AgeSelection } from "@/components/boomer-ai/age-selection"
import { Quiz } from "@/components/boomer-ai/quiz"
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
}

export default function BoomerAIPage() {
  const [currentView, setCurrentView] = useState<"onboarding" | "app">("onboarding")
  const [onboardingStep, setOnboardingStep] = useState<"avatar" | "age" | "quiz" | "level">("avatar")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    let deviceId = localStorage.getItem("boomer-device-id")
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem("boomer-device-id", deviceId)
    }

    loadFromDatabase(deviceId)
  }, [])

  const loadFromDatabase = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/profile?deviceId=${deviceId}`)
      const data = await response.json()

      if (data.success && data.profile) {
        setUserProfile(data.profile)
        if (data.profile.persona && data.profile.level) {
          setCurrentView("app")
        }
      } else {
        try {
          const saved = localStorage.getItem("boomer_profile")
          if (saved) {
            const profile = JSON.parse(saved)
            setUserProfile({ ...profile, deviceId })
            if (profile.persona && profile.level) {
              setCurrentView("app")
            }
          } else {
            setUserProfile({ ...DEFAULT_PROFILE, deviceId })
          }
        } catch (error) {
          setUserProfile({ ...DEFAULT_PROFILE, deviceId })
        }
      }
    } catch (error) {
      try {
        const saved = localStorage.getItem("boomer_profile")
        if (saved) {
          const profile = JSON.parse(saved)
          setUserProfile({ ...profile, deviceId })
          if (profile.persona && profile.level) {
            setCurrentView("app")
          }
        } else {
          setUserProfile({ ...DEFAULT_PROFILE, deviceId })
        }
      } catch (error) {
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
    } catch (error) {
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
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <div className="relative bg-white w-full max-w-md mx-auto h-screen overflow-hidden flex flex-col">
        {currentView === "onboarding" && (
          <>
            <Stepper
              currentStep={
                onboardingStep === "avatar" ? 1 : onboardingStep === "age" ? 2 : onboardingStep === "quiz" ? 3 : 4
              }
            />

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
                    setOnboardingStep("quiz")
                  }}
                />
              )}

              {onboardingStep === "quiz" && (
                <Quiz
                  onComplete={(score) => {
                    let recommendedLevel = "Absolute Beginner"
                    if (score > 7) recommendedLevel = "Advanced"
                    else if (score > 5) recommendedLevel = "Intermediate"
                    else if (score > 3) recommendedLevel = "Beginner"

                    updateProfile({ aiLevel: score, level: recommendedLevel })
                    setOnboardingStep("level")
                  }}
                />
              )}

              {onboardingStep === "level" && (
                <LearningLevel
                  recommendedLevel={userProfile.level || "Beginner"}
                  onContinue={(level) => {
                    updateProfile({ level, stars: 5, badges: ["Getting Started"] })
                    setCurrentView("app")
                  }}
                />
              )}
            </main>
          </>
        )}

        {currentView === "app" && (
          <MainApp userProfile={userProfile} updateProfile={updateProfile} onReset={resetProfile} />
        )}
      </div>
    </div>
  )
}
