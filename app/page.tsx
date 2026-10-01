"use client"

import { useState, useEffect } from "react"
import { AvatarSelection } from "@/components/boomer-ai/avatar-selection"
import { AgeSelection } from "@/components/boomer-ai/age-selection"
import { LearningLevel } from "@/components/boomer-ai/learning-level"
import { MainApp } from "@/components/boomer-ai/main-app"
import { Stepper } from "@/components/boomer-ai/stepper"
import { API_PATHS, DEFAULT_PROFILE, type UserProfile } from "@boomer-ai/shared"

export type { UserProfile }

export default function BoomerAIPage() {
  const [currentView, setCurrentView] = useState<"onboarding" | "app">("onboarding")
  const [onboardingStep, setOnboardingStep] = useState<"avatar" | "age" | "level">("avatar")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  const loadProfile = async (deviceId: string) => {
    try {
      const response = await fetch(`${API_PATHS.profile}?deviceId=${deviceId}`)
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

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      const newDeviceId = `device_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
      let deviceId = newDeviceId

      try {
        deviceId = localStorage.getItem("boomer-device-id") || newDeviceId
        localStorage.setItem("boomer-device-id", deviceId)
      } catch {
        // Continue with an in-memory ID when browser storage is unavailable.
      }

      await loadProfile(deviceId)
      if (active) setMounted(true)
    }

    void bootstrap()
    return () => {
      active = false
    }
  }, [])

  const saveToDatabase = async (profile: UserProfile) => {
    try {
      await fetch(API_PATHS.profile, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })
    } catch {
      // Silently fail - data is saved to localStorage as backup
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
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
      <div className="min-h-screen bg-white flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" aria-hidden="true" />
          <p className="text-slate-700 text-lg font-medium">Preparando tu espacio…</p>
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
                  onSelect={(appearance) => {
                    updateProfile({ ...appearance, name: appearance.userName })
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
