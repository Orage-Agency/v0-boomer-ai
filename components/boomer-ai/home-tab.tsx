"use client"

import { MessageSquare, Sparkles, Lightbulb, Heart, ChevronLeft, ChevronRight, X } from "lucide-react"
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

  const coreFeatures = [
    {
      id: "chat",
      title: "Chat with AI",
      description: "Ask me anything!",
      icon: MessageSquare,
      gradient: "from-blue-500 to-blue-600",
      action: () => onNavigate("chat"),
    },
    {
      id: "lessons",
      title: "Video Lessons",
      description: "Learn step-by-step!",
      icon: Sparkles,
      gradient: "from-purple-500 to-purple-600",
      action: () => onNavigate("lessons"),
    },
    {
      id: "ai-art",
      title: "AI Art",
      description: "Create images!",
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      action: onOpenArtGenerator,
    },
    {
      id: "tips",
      title: "Quick Tips",
      description: "Smart shortcuts!",
      icon: Lightbulb,
      gradient: "from-green-500 to-emerald-600",
      action: () => onNavigate("tips"),
    },
    {
      id: "history",
      title: "Chat History",
      description: "View past chats!",
      icon: MessageSquare,
      gradient: "from-orange-500 to-amber-600",
      action: () => onNavigate("profile"),
    },
    {
      id: "questions",
      title: "Common Q&A",
      description: "Quick answers!",
      icon: Lightbulb,
      gradient: "from-cyan-500 to-teal-600",
      action: () => onNavigate("profile"),
    },
  ]

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      {pinnedFeaturesList.length > 0 && (
        <div className="flex-shrink-0 bg-white border-b border-slate-200 px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span className="text-[10px] font-bold text-slate-700 uppercase">Favorites</span>
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
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r ${feature.gradient} text-white text-[10px] font-bold shadow-md relative group`}
              >
                <span className="text-sm">{feature.icon}</span>
                <span>{feature.type}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    togglePin(feature.id)
                  }}
                  className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-3 pt-3 pb-2">
        <div className="relative" style={{ minHeight: "120px" }}>
          <div
            className={`bg-gradient-to-r ${currentFeature.gradient} rounded-xl p-3 shadow-lg border border-white/30 transition-all duration-500 h-full flex flex-col`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xl">{currentFeature.icon}</span>
                <h3 className="text-xs font-black text-white uppercase">{currentFeature.type}</h3>
              </div>
              <button
                onClick={() => togglePin(currentFeature.id)}
                className={`p-1 rounded-full transition-all flex-shrink-0 ${
                  (userProfile.pinnedFeatures || []).includes(currentFeature.id)
                    ? "bg-white text-pink-500"
                    : "bg-white/20 text-white hover:bg-white hover:text-pink-500"
                }`}
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    (userProfile.pinnedFeatures || []).includes(currentFeature.id) ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-white leading-snug">{currentContent}</p>

              {currentFeature.id === "daily-discovery" && (
                <button
                  onClick={() => onNavigate("chat")}
                  className="mt-2 text-[10px] text-white/90 font-semibold bg-white/20 px-2 py-1 rounded-full hover:bg-white/30 transition-colors inline-block self-start"
                >
                  Try it! (+2 ⭐)
                </button>
              )}
            </div>
          </div>

          <button
            onClick={() => navigateFeature("prev")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
          >
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => navigateFeature("next")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 bg-white rounded-full p-1 shadow-md hover:scale-110 transition-transform"
          >
            <ChevronRight className="w-4 h-4 text-slate-700" />
          </button>

          <div className="flex justify-center gap-1 mt-2">
            {ROTATING_FEATURES.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFeatureIndex(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 5000)
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentFeatureIndex ? "w-4 bg-slate-600" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col justify-end pb-2">
          <div className="flex-shrink-0 px-3">
            <div className="grid grid-cols-2 gap-2">
              {coreFeatures.map((feature) => {
                const isPinned = (userProfile.pinnedFeatures || []).includes(feature.id)
                return (
                  <div key={feature.id} className="relative">
                    <button
                      onClick={feature.action}
                      className={`w-full h-20 bg-gradient-to-br ${feature.gradient} text-white rounded-xl p-2.5 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center border-2 border-white/30`}
                    >
                      <feature.icon className="w-7 h-7 mb-1" strokeWidth={2.5} />
                      <h3 className="text-xs font-black leading-tight mb-0.5">{feature.title}</h3>
                      <p className="text-[9px] text-white/90 font-semibold leading-tight">{feature.description}</p>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        togglePin(feature.id)
                      }}
                      className={`absolute top-1 right-1 p-1 rounded-full transition-all z-10 ${
                        isPinned
                          ? "bg-white text-pink-500"
                          : "bg-white/20 text-white hover:bg-white hover:text-pink-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isPinned ? "fill-current" : ""}`} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 px-3 pb-2">
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-1.5">
          <p className="text-[9px] text-yellow-900 text-center font-semibold leading-tight">
            Medical features coming soon. Always consult your healthcare provider.
          </p>
        </div>
      </div>
    </div>
  )
}
