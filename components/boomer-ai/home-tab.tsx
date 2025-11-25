"use client"

import { MessageSquare, Sparkles, Lightbulb, Heart, Video, Mic } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState, useEffect, useRef } from "react"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "tips" | "profile" | "voice") => void
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
  const [dailyContentIndex, setDailyContentIndex] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setDailyContentIndex(dayOfYear)
  }, [])

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

  const coreFeatures = [
    {
      id: "chat",
      title: "Chat",
      description: "Ask anything",
      icon: MessageSquare,
      gradient: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/30",
      size: "large", // Takes 2 columns
      action: () => onNavigate("chat"),
    },
    {
      id: "voice",
      title: "Voice",
      description: "Talk to AI",
      icon: Mic,
      gradient: "from-purple-500 to-indigo-600",
      shadowColor: "shadow-purple-500/30",
      size: "small",
      action: () => onNavigate("voice"),
    },
    {
      id: "lessons",
      title: "Videos",
      description: "Learn AI",
      icon: Video,
      gradient: "from-orange-500 to-red-500",
      shadowColor: "shadow-orange-500/30",
      size: "small",
      action: () => onNavigate("lessons"),
    },
    {
      id: "ai-art",
      title: "Create Art",
      description: "AI images",
      icon: Sparkles,
      gradient: "from-pink-500 to-rose-600",
      shadowColor: "shadow-pink-500/30",
      size: "medium",
      action: onOpenArtGenerator,
    },
    {
      id: "tips",
      title: "Tips",
      description: "Quick help",
      icon: Lightbulb,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/30",
      size: "medium",
      action: () => onNavigate("tips"),
    },
  ]

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
      <div className="flex-shrink-0 pt-4 pb-2">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-2 no-scrollbar"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {ROTATING_FEATURES.map((feature) => {
            const currentContent = feature.content[dailyContentIndex % feature.content.length]
            const isPinned = (userProfile.pinnedFeatures || []).includes(feature.id)

            return (
              <div key={feature.id} className="flex-shrink-0 snap-center" style={{ width: "calc(100% - 40px)" }}>
                <div
                  className={`bg-gradient-to-br ${feature.gradient} rounded-3xl p-5 shadow-xl border border-white/20 h-[130px] flex flex-col relative overflow-hidden`}
                >
                  {/* Decorative blur circles */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">{feature.type}</h3>
                    </div>
                    <button
                      onClick={() => togglePin(feature.id)}
                      className={`p-2 rounded-full transition-all ${
                        isPinned
                          ? "bg-white text-pink-500"
                          : "bg-white/20 text-white hover:bg-white hover:text-pink-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-white/95 leading-relaxed flex-1 relative z-10">
                    {currentContent}
                  </p>

                  {feature.id === "daily-discovery" && (
                    <button
                      onClick={() => onNavigate("chat")}
                      className="mt-2 text-xs text-white font-bold bg-white/25 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/35 transition-colors self-start relative z-10"
                    >
                      Try it! +2 ⭐
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Subtle scroll indicator */}
        <div className="flex justify-center gap-1.5 mt-2">
          {ROTATING_FEATURES.map((_, index) => (
            <div key={index} className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          ))}
        </div>
      </div>

      <div className="flex-1 px-5 pb-4 overflow-hidden">
        <div className="grid grid-cols-2 gap-3 h-full auto-rows-fr" style={{ gridTemplateRows: "repeat(3, 1fr)" }}>
          {/* Chat - Large card spanning 2 columns */}
          <button
            onClick={coreFeatures[0].action}
            className={`col-span-2 bg-gradient-to-br ${coreFeatures[0].gradient} text-white rounded-3xl p-5 shadow-xl ${coreFeatures[0].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl font-black mb-1">{coreFeatures[0].title}</h3>
              <p className="text-base text-white/90 font-medium">{coreFeatures[0].description}</p>
            </div>
            <MessageSquare className="w-14 h-14 text-white/80 relative z-10" strokeWidth={1.5} />
          </button>

          {/* Voice */}
          <button
            onClick={coreFeatures[1].action}
            className={`bg-gradient-to-br ${coreFeatures[1].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[1].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <Mic className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[1].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[1].description}</p>
          </button>

          {/* Videos */}
          <button
            onClick={coreFeatures[2].action}
            className={`bg-gradient-to-br ${coreFeatures[2].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[2].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <Video className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[2].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[2].description}</p>
          </button>

          {/* AI Art */}
          <button
            onClick={coreFeatures[3].action}
            className={`bg-gradient-to-br ${coreFeatures[3].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[3].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <Sparkles className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[3].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[3].description}</p>
          </button>

          {/* Tips */}
          <button
            onClick={coreFeatures[4].action}
            className={`bg-gradient-to-br ${coreFeatures[4].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[4].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <Lightbulb className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[4].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[4].description}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
