"use client"

import type React from "react"
import { MessageSquare, Lightbulb, Heart, Video, Mic, X, MessageCircle, Palette, Gamepad2 } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState, useEffect } from "react"

interface HomeTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onStartChat: (prompt?: string) => void
  onOpenLessons: () => void
  onOpenTips: () => void
  onOpenQuestions: () => void
  onOpenVoice: () => void
  onOpenAiArt: () => void
  onOpenGames: () => void
}

const ROTATING_FEATURES = [
  {
    id: "create-images",
    type: "What's New",
    icon: "🎨",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    fullScreenBg: "from-purple-600 via-pink-600 to-red-600",
    action: "ai-art",
    content: [
      "Create beautiful AI images with just words!",
      "Turn your ideas into stunning artwork!",
      "Design landscapes, portraits, and more!",
      "Express yourself through AI art!",
    ],
    expandedContent: [
      {
        title: "Create Amazing Images!",
        description: "Just describe what you want to see, and AI will create beautiful artwork for you in seconds!",
        cta: "Create Art Now",
      },
      {
        title: "Turn Ideas Into Art!",
        description: "Have an image in your mind? Describe it and watch AI bring it to life!",
        cta: "Start Creating",
      },
      {
        title: "Design Beautiful Scenes!",
        description: "Create landscapes, portraits, still life, and more with simple descriptions!",
        cta: "Try It Now",
      },
      {
        title: "Express Yourself!",
        description: "AI art is a new way to express your creativity. No drawing skills needed!",
        cta: "Make Art",
      },
    ],
  },
  {
    id: "play-games",
    type: "Fun & Games",
    icon: "🎮",
    gradient: "from-green-400 via-teal-400 to-cyan-400",
    fullScreenBg: "from-green-500 via-teal-500 to-cyan-500",
    action: "games",
    content: [
      "Play Tech Collector and earn stars!",
      "New game: Collect items and learn AI!",
      "Fun way to earn rewards while playing!",
      "Challenge yourself with our mini games!",
    ],
    expandedContent: [
      {
        title: "Tech Collector Game!",
        description: "Move your robot to collect tech items and earn stars! Simple, fun, and rewarding!",
        cta: "Play Now",
      },
      {
        title: "Learn While Playing!",
        description: "Our games are designed to be fun while teaching you about technology!",
        cta: "Start Playing",
      },
      {
        title: "Earn Stars!",
        description: "Every item you collect earns you stars. Reach milestones for bonus rewards!",
        cta: "Play Game",
      },
      {
        title: "Challenge Yourself!",
        description: "How many items can you collect? Set your personal best!",
        cta: "Accept Challenge",
      },
    ],
  },
  {
    id: "new-lessons",
    type: "New Lessons",
    icon: "📚",
    gradient: "from-orange-400 via-red-400 to-pink-400",
    fullScreenBg: "from-orange-500 via-red-500 to-pink-500",
    action: "lessons",
    content: [
      "New video lessons added weekly!",
      "Learn AI at your own pace!",
      "Step-by-step tutorials for beginners!",
      "Master new skills with video guides!",
    ],
    expandedContent: [
      {
        title: "Fresh Lessons Weekly!",
        description: "We add new video lessons every week to help you learn something new!",
        cta: "Watch Lessons",
      },
      {
        title: "Learn at Your Pace!",
        description: "No rush - pause, rewind, and watch again as many times as you need!",
        cta: "Start Learning",
      },
      {
        title: "Perfect for Beginners!",
        description: "Our lessons are designed with you in mind - clear, simple, and easy to follow!",
        cta: "Begin Now",
      },
      {
        title: "Master New Skills!",
        description: "From basics to advanced tips, our lessons cover everything you need!",
        cta: "View Lessons",
      },
    ],
  },
  {
    id: "chat-with-ai",
    type: "Chat with AI",
    icon: "💬",
    gradient: "from-blue-400 via-indigo-400 to-purple-400",
    fullScreenBg: "from-blue-500 via-indigo-500 to-purple-500",
    action: "chat",
    content: [
      "Ask AI anything - it's here to help!",
      "Have a friendly conversation with AI!",
      "Get answers to all your questions!",
      "AI is ready to chat whenever you are!",
    ],
    expandedContent: [
      {
        title: "Ask Anything!",
        description: "Curious about something? Just ask! AI is here to answer all your questions!",
        cta: "Start Chatting",
      },
      {
        title: "Friendly Conversation!",
        description: "Chat naturally with AI like you're talking to a helpful friend!",
        cta: "Chat Now",
      },
      {
        title: "Get Answers Fast!",
        description: "No waiting, no searching - just ask and get helpful answers instantly!",
        cta: "Ask Now",
      },
      {
        title: "Always Available!",
        description: "AI is here 24/7, ready to help whenever you need it!",
        cta: "Start Chat",
      },
    ],
  },
]

export function HomeTab({
  userProfile,
  updateProfile,
  onStartChat,
  onOpenLessons,
  onOpenTips,
  onOpenQuestions,
  onOpenVoice,
  onOpenAiArt,
  onOpenGames,
}: HomeTabProps) {
  const [dailyContentIndex, setDailyContentIndex] = useState(0)
  const [expandedCard, setExpandedCard] = useState<(typeof ROTATING_FEATURES)[0] | null>(null)
  const [expandedContentIndex, setExpandedContentIndex] = useState(0)

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setDailyContentIndex(dayOfYear)
  }, [])

  const handleCardTap = (feature: (typeof ROTATING_FEATURES)[0]) => {
    const contentIndex = dailyContentIndex % feature.content.length
    setExpandedContentIndex(contentIndex)
    setExpandedCard(feature)
  }

  const handleFeatureAction = (feature: (typeof ROTATING_FEATURES)[0]) => {
    setExpandedCard(null)
    switch (feature.action) {
      case "ai-art":
        onOpenAiArt()
        break
      case "games":
        onOpenGames()
        break
      case "lessons":
        onOpenLessons()
        break
      case "chat":
        onStartChat()
        break
      default:
        onStartChat()
    }
  }

  const togglePin = (featureId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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
      size: "large",
      action: () => onStartChat(),
    },
    {
      id: "voice",
      title: "Voice",
      description: "Talk to AI",
      icon: Mic,
      gradient: "from-purple-500 to-indigo-600",
      shadowColor: "shadow-purple-500/30",
      size: "small",
      action: onOpenVoice,
    },
    {
      id: "lessons",
      title: "Videos",
      description: "Learn AI",
      icon: Video,
      gradient: "from-orange-500 to-red-500",
      shadowColor: "shadow-orange-500/30",
      size: "small",
      action: onOpenLessons,
    },
    {
      id: "tips",
      title: "Tips",
      description: "Quick help",
      icon: Lightbulb,
      gradient: "from-emerald-500 to-teal-600",
      shadowColor: "shadow-emerald-500/30",
      size: "small",
      action: onOpenTips,
    },
    {
      id: "ask-me",
      title: "Ask Me",
      description: "Anything",
      icon: MessageCircle,
      gradient: "from-cyan-500 to-blue-500",
      shadowColor: "shadow-cyan-500/30",
      size: "small",
      action: onOpenVoice,
    },
    {
      id: "ai-art",
      title: "Create Art",
      description: "AI Images",
      icon: Palette,
      gradient: "from-pink-500 to-rose-600",
      shadowColor: "shadow-pink-500/30",
      size: "small",
      action: onOpenAiArt,
    },
    {
      id: "games",
      title: "Games",
      description: "Play & Learn",
      icon: Gamepad2,
      gradient: "from-green-500 to-emerald-600",
      shadowColor: "shadow-green-500/30",
      size: "small",
      action: onOpenGames,
    },
  ]

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white overflow-y-auto relative">
      {expandedCard && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${expandedCard.fullScreenBg} transition-all duration-500`}
          />

          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-black/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          </div>

          <button
            onClick={() => setExpandedCard(null)}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all active:scale-95"
            style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}
          >
            <X className="w-7 h-7 text-white" />
          </button>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 text-center">
            <span className="text-7xl mb-6">{expandedCard.icon}</span>

            <span className="text-sm font-bold text-white/80 uppercase tracking-widest mb-2">{expandedCard.type}</span>

            <h1 className="text-3xl font-black text-white mb-4 leading-tight">
              {expandedCard.expandedContent[expandedContentIndex % expandedCard.expandedContent.length]?.title ||
                expandedCard.content[expandedContentIndex]}
            </h1>

            <p className="text-lg text-white/90 leading-relaxed max-w-md mb-8">
              {expandedCard.expandedContent[expandedContentIndex % expandedCard.expandedContent.length]?.description ||
                "Tap below to explore this with AI!"}
            </p>

<button
  onClick={() => handleFeatureAction(expandedCard)}
  className="px-8 py-4 bg-white text-slate-900 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all"
  >
  {expandedCard.expandedContent[expandedContentIndex % expandedCard.expandedContent.length]?.cta ||
  "Try It Now"}{" "}
  →
  </button>
          </div>

          <div className="relative z-10 pb-8 text-center">
            <p className="text-white/60 text-sm">Tap anywhere or the X to close</p>
          </div>
        </div>
      )}

      <div className="px-5 pt-4 pb-2">
        <h1 className="text-xl font-black text-slate-900">
          Hello, {userProfile.name || userProfile.userName || "Friend"}!
        </h1>
        <p className="text-sm text-slate-500">What would you like to explore today?</p>
      </div>

      <div className="flex-shrink-0 pb-2">
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory px-5 pb-2 no-scrollbar">
          {ROTATING_FEATURES.map((feature) => {
            const currentContent = feature.content[dailyContentIndex % feature.content.length]
            const isPinned = (userProfile.pinnedFeatures || []).includes(feature.id)

            return (
              <div key={feature.id} className="flex-shrink-0 snap-center" style={{ width: "calc(100% - 40px)" }}>
                <button
                  onClick={() => handleCardTap(feature)}
                  className={`w-full text-left bg-gradient-to-br ${feature.gradient} rounded-3xl p-5 shadow-xl border border-white/20 h-[130px] flex flex-col relative overflow-hidden transform transition-all hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-2xl" />

                  <div className="flex items-center justify-between mb-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{feature.icon}</span>
                      <h3 className="text-sm font-black text-white uppercase tracking-wide">{feature.type}</h3>
                    </div>
                    <div
                      onClick={(e) => togglePin(feature.id, e)}
                      className={`p-2 rounded-full transition-all ${
                        isPinned
                          ? "bg-white text-pink-500"
                          : "bg-white/20 text-white hover:bg-white hover:text-pink-500"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isPinned ? "fill-current" : ""}`} />
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-white/95 leading-relaxed flex-1 relative z-10">
                    {currentContent}
                  </p>

                  <div className="absolute bottom-3 right-3 text-xs text-white/60 font-medium">Tap to explore →</div>
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex justify-center gap-1.5 mt-2">
          {ROTATING_FEATURES.map((_, index) => (
            <div key={index} className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          ))}
        </div>
      </div>

<div className="flex-1 px-5 pb-4 overflow-hidden">
  <div className="grid grid-cols-2 gap-3 h-full auto-rows-fr" style={{ gridTemplateRows: "repeat(4, 1fr)" }}>
  {/* Chat - Full width */}
  <button
  onClick={coreFeatures[0].action}
  className={`col-span-2 bg-gradient-to-br ${coreFeatures[0].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[0].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
  <div className="relative z-10">
  <h3 className="text-xl font-black mb-0.5">{coreFeatures[0].title}</h3>
  <p className="text-sm text-white/90 font-medium">{coreFeatures[0].description}</p>
  </div>
  <MessageSquare className="w-12 h-12 text-white/80 relative z-10" strokeWidth={1.5} />
  </button>
  
  {/* Voice */}
  <button
  onClick={coreFeatures[1].action}
  className={`bg-gradient-to-br ${coreFeatures[1].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[1].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <Mic className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[1].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[1].description}</p>
  </button>
  
  {/* Videos */}
  <button
  onClick={coreFeatures[2].action}
  className={`bg-gradient-to-br ${coreFeatures[2].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[2].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <Video className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[2].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[2].description}</p>
  </button>
  
  {/* Tips */}
  <button
  onClick={coreFeatures[3].action}
  className={`bg-gradient-to-br ${coreFeatures[3].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[3].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <Lightbulb className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[3].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[3].description}</p>
  </button>
  
  {/* Ask Me */}
  <button
  onClick={coreFeatures[4].action}
  className={`bg-gradient-to-br ${coreFeatures[4].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[4].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <MessageCircle className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[4].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[4].description}</p>
  </button>
  
  {/* Create Art */}
  <button
  onClick={coreFeatures[5].action}
  className={`bg-gradient-to-br ${coreFeatures[5].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[5].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <Palette className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[5].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[5].description}</p>
  </button>
  
  {/* Games */}
  <button
  onClick={coreFeatures[6].action}
  className={`bg-gradient-to-br ${coreFeatures[6].gradient} text-white rounded-3xl p-3 shadow-xl ${coreFeatures[6].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
  >
  <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
  <Gamepad2 className="w-8 h-8 mb-1 relative z-10" strokeWidth={2} />
  <h3 className="text-base font-black relative z-10">{coreFeatures[6].title}</h3>
  <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[6].description}</p>
  </button>
  </div>
  </div>
    </div>
  )
}
