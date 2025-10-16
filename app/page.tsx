"use client"

import { useState, useEffect } from "react"
import { AvatarSelection } from "@/components/boomer-ai/avatar-selection"
import { AgeSelection } from "@/components/boomer-ai/age-selection"
import { Quiz } from "@/components/boomer-ai/quiz"
import { LearningLevel } from "@/components/boomer-ai/learning-level"
import { MainMenu } from "@/components/boomer-ai/main-menu"
import { ProfileView } from "@/components/boomer-ai/profile-view"
import { LessonView } from "@/components/boomer-ai/lesson-view"
import { Header } from "@/components/boomer-ai/header"
import { Stepper } from "@/components/boomer-ai/stepper"

export type UserProfile = {
  persona: string | null
  age: string | null
  aiLevel: number
  userTitle: string | null
  avatarSrc: string | null
  level: string | null
}

export type ViewType =
  | "avatar-selection"
  | "age-selection"
  | "quiz"
  | "learning-level"
  | "main-menu"
  | "profile"
  | "lesson-what-is-ai"
  | "lesson-first-lesson"
  | "lesson-everyday-uses"
  | "lesson-meet-ai"
  | "audio-lessons"
  | "lesson-more-ai"
  | "lesson-coming-soon"
  | "ai-chat" // Added new view type for AI chat

const DEFAULT_PROFILE: UserProfile = {
  persona: null,
  age: null,
  aiLevel: 0,
  userTitle: null,
  avatarSrc: null,
  level: null,
}

export default function BoomerAIPage() {
  const [currentView, setCurrentView] = useState<ViewType>("avatar-selection")
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Restore profile from localStorage
    try {
      const saved = localStorage.getItem("boomer_profile")
      if (saved) {
        const profile = JSON.parse(saved)
        setUserProfile(profile)
        if (profile.persona && profile.level) {
          setCurrentView("main-menu")
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
    setCurrentView("avatar-selection")
  }

  const isIntroView = ["avatar-selection", "age-selection", "quiz", "learning-level"].includes(currentView)

  const getStepNumber = () => {
    switch (currentView) {
      case "avatar-selection":
        return 1
      case "age-selection":
        return 2
      case "quiz":
        return 3
      case "learning-level":
        return 4
      default:
        return 4
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex items-center justify-center p-0 sm:p-6">
      <div className="relative bg-white w-full max-w-md mx-auto h-screen sm:h-[calc(100vh-3rem)] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-200/60">
        {/* Subtle top accent */}
        <div className="absolute inset-x-0 -top-24 h-36 pointer-events-none opacity-30">
          <div className="mx-auto h-full w-[600px] bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 blur-3xl rounded-full" />
        </div>

        {!isIntroView && (
          <Header
            currentView={currentView}
            userProfile={userProfile}
            onBack={() => setCurrentView("main-menu")}
            onProfile={() => setCurrentView("profile")}
          />
        )}

        {isIntroView && <Stepper currentStep={getStepNumber()} />}

        <main className="flex-grow overflow-y-auto">
          {currentView === "avatar-selection" && (
            <AvatarSelection
              onSelect={(persona, userTitle, avatarSrc) => {
                updateProfile({ persona, userTitle, avatarSrc })
                setCurrentView("age-selection")
              }}
            />
          )}

          {currentView === "age-selection" && (
            <AgeSelection
              onSelect={(age) => {
                updateProfile({ age, aiLevel: 0 })
                setCurrentView("quiz")
              }}
            />
          )}

          {currentView === "quiz" && (
            <Quiz
              onComplete={(score) => {
                let recommendedLevel = "Absolute Beginner"
                if (score > 7) recommendedLevel = "Advanced"
                else if (score > 5) recommendedLevel = "Intermediate"
                else if (score > 3) recommendedLevel = "Beginner"

                updateProfile({ aiLevel: score, level: recommendedLevel })
                setCurrentView("learning-level")
              }}
            />
          )}

          {currentView === "learning-level" && (
            <LearningLevel
              recommendedLevel={userProfile.level || "Beginner"}
              onContinue={(level) => {
                updateProfile({ level })
                setCurrentView("main-menu")
              }}
            />
          )}

          {currentView === "main-menu" && (
            <MainMenu userProfile={userProfile} onNavigate={(view) => setCurrentView(view as ViewType)} />
          )}

          {currentView === "profile" && (
            <ProfileView userProfile={userProfile} onReset={resetProfile} onBack={() => setCurrentView("main-menu")} />
          )}

          {(currentView === "ai-chat" || currentView.startsWith("lesson-") || currentView === "audio-lessons") && (
            <LessonView
              lessonType={currentView}
              userLevel={userProfile.level || "Beginner"}
              onNavigate={(view) => setCurrentView(view as ViewType)}
            />
          )}
        </main>

        {!isIntroView && (
          <footer className="text-center px-4 py-4 border-t border-slate-200/70 bg-white/80 backdrop-blur-sm">
            <p className="text-sm text-slate-600 font-semibold">Boomerai.us</p>
          </footer>
        )}
      </div>
    </div>
  )
}
