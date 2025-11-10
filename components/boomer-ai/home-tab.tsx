"use client"

import { MessageSquare, Sparkles, Lightbulb, TrendingUp, Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState, useEffect } from "react"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "tips" | "profile") => void
  onOpenArtGenerator: () => void
  updateProfile: (updates: Partial<UserProfile>) => void
}

const ROTATING_FEATURES = [
  {
    id: "whats-new",
    type: "What's New",
    icon: "✨",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    content: [
      "New Voice Assistant: Talk to AI hands-free!",
      "Daily Discoveries: Learn something new every day!",
      "Video Lessons: Step-by-step AI tutorials!",
      "Smart Tips: Quick tricks to use AI better!",
    ],
  },
  {
    id: "daily-discovery",
    type: "Today's Discovery",
    icon: "🎯",
    gradient: "from-yellow-400 via-orange-400 to-pink-400",
    content: [
      "Let's ask AI how to make a cherry cobbler gluten-free!",
      "Tell me about the manufacturing of tires - I'm curious!",
      "What's the history behind my favorite old TV shows?",
      "How do microwave ovens actually work?",
      "Teach me about the Northern Lights - why do they happen?",
      "What makes bread rise? I'd love to know the science!",
      "How did people navigate before GPS?",
      "What's the story behind my birthstone?",
    ],
  },
  {
    id: "use-ai-this-way",
    type: "Use AI This Way",
    icon: "💡",
    gradient: "from-green-400 to-teal-400",
    content: [
      "Ask AI to plan your weekly meals",
      "Get AI to explain your medications",
      "Let AI help write birthday cards",
      "Use AI for family history research",
      "Have AI suggest gift ideas for loved ones",
      "Ask AI about local events happening near you",
    ],
  },
  {
    id: "weekly-challenge",
    type: "Challenge of the Week",
    icon: "🏆",
    gradient: "from-indigo-400 to-blue-400",
    content: [
      "This week: Ask AI about 3 hobbies you've never tried!",
      "Challenge: Use AI to plan a family gathering!",
      "Try it: Ask AI to explain something you've always wondered!",
      "Goal: Have 5 conversations with AI this week!",
      "Mission: Discover 3 new ways AI can help your daily life!",
    ],
  },
]

export function HomeTab({ userProfile, onNavigate, onOpenArtGenerator, updateProfile }: HomeTabProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0)
  const [dailyContentIndex, setDailyContentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setDailyContentIndex(dayOfYear)
  }, [])

  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentFeatureIndex((prev) => (prev + 1) % ROTATING_FEATURES.length)
    }, 7000)

    return () => clearInterval(timer)
  }, [isPaused])

  const currentFeature = ROTATING_FEATURES[currentFeatureIndex]
  const currentContent = currentFeature.content[dailyContentIndex % currentFeature.content.length]

  const togglePin = (featureId: string) => {
    const pinnedFeatures = userProfile.pinnedFeatures || []
    const isPinned = pinnedFeatures.includes(featureId)

    if (isPinned) {
      updateProfile({
        pinnedFeatures: pinnedFeatures.filter((id) => id !== featureId),
      })
    } else {
      updateProfile({
        pinnedFeatures: [...pinnedFeatures, featureId],
        stars: userProfile.stars + 1,
      })
    }
  }

  const navigateFeature = (direction: "prev" | "next") => {
    setIsPaused(true)
    setCurrentFeatureIndex((prev) => {
      if (direction === "prev") {
        return prev === 0 ? ROTATING_FEATURES.length - 1 : prev - 1
      }
      return (prev + 1) % ROTATING_FEATURES.length
    })
    setTimeout(() => setIsPaused(false), 5000)
  }

  const pinnedFeaturesList = ROTATING_FEATURES.filter((f) => (userProfile.pinnedFeatures || []).includes(f.id))

  const mainActions = [
    {
      id: "chat",
      title: "Let's Chat!",
      description: "Ask me anything!",
      icon: MessageSquare,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      hoverColor: "hover:from-blue-600 hover:to-blue-700",
      action: () => onNavigate("chat"),
    },
    {
      id: "art",
      title: "Create AI Art",
      description: "Make amazing art!",
      icon: Sparkles,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
      action: () => onOpenArtGenerator(),
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {pinnedFeaturesList.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b-2 border-slate-200 px-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="text-xs font-bold text-slate-700">MY FAVORITES</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pinnedFeaturesList.map((feature) => (
              <button
                key={feature.id}
                onClick={() => {
                  const index = ROTATING_FEATURES.findIndex((f) => f.id === feature.id)
                  setCurrentFeatureIndex(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 5000)
                }}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-xs font-bold shadow-md relative group`}
              >
                <span>{feature.icon}</span>
                <span>{feature.type}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePin(feature.id)
                  }}
                  className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="relative">
          <div
            className={`bg-gradient-to-r ${currentFeature.gradient} rounded-2xl p-5 shadow-2xl border-2 border-white/30 min-h-[140px] flex flex-col justify-between transition-all duration-500`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{currentFeature.icon}</span>
                  <h3 className="text-lg font-black text-white uppercase">{currentFeature.type}</h3>
                </div>
                <button
                  onClick={() => togglePin(currentFeature.id)}
                  className={`p-2 rounded-full transition-all ${
                    (userProfile.pinnedFeatures || []).includes(currentFeature.id)
                      ? "bg-white text-pink-500"
                      : "bg-white/20 text-white hover:bg-white hover:text-pink-500"
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      (userProfile.pinnedFeatures || []).includes(currentFeature.id) ? "fill-current" : ""
                    }`}
                  />
                </button>
              </div>
              <p className="text-base font-bold text-white leading-relaxed">{currentContent}</p>
            </div>

            {currentFeature.id === "daily-discovery" && (
              <button
                onClick={() => onNavigate("chat")}
                className="mt-3 text-xs text-white/90 font-semibold bg-white/20 px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors self-start"
              >
                Tap to explore! (+2 ⭐)
              </button>
            )}
          </div>

          <button
            onClick={() => navigateFeature("prev")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={() => navigateFeature("next")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>

          <div className="flex justify-center gap-1.5 mt-3">
            {ROTATING_FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFeatureIndex(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 5000)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentFeatureIndex ? "w-6 bg-slate-600" : "w-2 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center px-4">
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {mainActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center aspect-square border-4 border-white`}
            >
              <action.icon className="w-16 h-16 mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-black mb-1">{action.title}</h3>
              <p className="text-sm text-white/90 font-semibold">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("tips")}
            className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-white/30"
          >
            <Lightbulb className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-sm font-black">Quick Tips</span>
          </button>

          <button
            onClick={() => onNavigate("profile")}
            className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-white/30"
          >
            <TrendingUp className="w-6 h-6" strokeWidth={2.5} />
            <span className="text-sm font-black">My Progress</span>
          </button>
        </div>

        <div className="mt-2 bg-yellow-50 border border-yellow-300 rounded-lg p-1.5">
          <p className="text-[9px] text-yellow-900 text-center font-semibold leading-tight">
            Medical features coming soon. Always consult your healthcare provider for medical advice.
          </p>
        </div>
      </div>
    </div>
  )
}
