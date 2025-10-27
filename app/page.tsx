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
}

export default function BoomerAIPage() {
  const [currentView, setCurrentView] = useState<"onboarding" | "app">("onboarding")
  const [onboardingStep, setOnboardingStep] = useState<"avatar" | "age" | "quiz" | "level">("avatar")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const saved = localStorage.getItem("boomer_profile")
      if (saved) {
        const profile = JSON.parse(saved)
        setUserProfile(profile)
        if (profile.persona && profile.level) {
          setCurrentView("app")
        }
      }
    } catch (error) {
      console.log("[v0] Error restoring profile:", error)
    }
  }, [])

  const updateProfile = (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates }
    setUserProfile(newProfile)
    if (mounted) {
      localStorage.setItem("boomer_profile", JSON.stringify(newProfile))
    }
  }

  const resetProfile = () => {
    setUserProfile(DEFAULT_PROFILE)
    if (mounted) {
      localStorage.removeItem("boomer_profile")
    }
    setCurrentView("onboarding")
    setOnboardingStep("avatar")
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-0">
      <div className="relative bg-white w-full max-w-md mx-auto h-screen overflow-hidden flex flex-col">
        {currentView === "onboarding" && (
          <>
            <Stepper
              currentStep={
                onboardingStep === "avatar" ? 1 : onboardingStep === "age" ? 2 : onboardingStep === "quiz" ? 3 : 4
              }
            />

            <main className="flex-grow overflow-y-auto">
              {onboardingStep === "avatar" && (
                <AvatarSelection
                  onSelect={(persona, userTitle, avatarSrc) => {
                    updateProfile({ persona, userTitle, avatarSrc })
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
