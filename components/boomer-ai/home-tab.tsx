"use client"

import type React from "react"
import { MessageSquare, Lightbulb, Heart, Video, Mic, X, MessageCircle } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState, useEffect } from "react"

interface HomeTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onStartChat: () => void
  onOpenLessons: () => void
  onOpenTips: () => void
  onOpenQuestions: () => void
  onOpenVoice: () => void
}

const ROTATING_FEATURES = [
  {
    id: "whats-new",
    type: "What's New",
    icon: "✨",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    fullScreenBg: "from-purple-600 via-pink-600 to-red-600",
    content: [
      "New Voice Assistant: Talk to AI hands-free!",
      "Daily Discoveries: Learn something new every day!",
      "Video Lessons: Step-by-step AI tutorials!",
      "Smart Tips: Quick tricks to use AI better!",
    ],
    expandedContent: [
      {
        title: "Voice Assistant is Here!",
        description:
          "Simply tap the avatar and start talking. No typing needed - just have a natural conversation with AI!",
        cta: "Try Voice Chat",
      },
      {
        title: "Daily Discoveries Await!",
        description: "Every day brings a new AI exploration. Ask questions you've always wondered about!",
        cta: "Start Exploring",
      },
      {
        title: "Video Lessons Ready!",
        description: "Watch step-by-step tutorials designed specifically for you. Learn at your own pace!",
        cta: "Watch Now",
      },
      {
        title: "Smart Tips Daily!",
        description: "Quick, actionable tips to make AI work better for you. New tips every day!",
        cta: "See Tips",
      },
    ],
  },
  {
    id: "daily-discovery",
    type: "Today's Discovery",
    icon: "🎯",
    gradient: "from-yellow-400 via-orange-400 to-pink-400",
    fullScreenBg: "from-yellow-500 via-orange-500 to-pink-500",
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
    expandedContent: [
      {
        title: "Gluten-Free Cherry Cobbler",
        description:
          "Let's discover how to make a delicious cherry cobbler that everyone can enjoy, with easy substitutions!",
        cta: "Ask AI Now",
      },
      {
        title: "The World of Tires",
        description: "Ever wondered how rubber becomes the tires on your car? Let's explore this fascinating process!",
        cta: "Learn More",
      },
      {
        title: "TV Show History",
        description: "Take a trip down memory lane and discover the stories behind your favorite classic shows!",
        cta: "Explore",
      },
      {
        title: "Microwave Magic",
        description:
          "The science behind this kitchen wonder is actually quite fascinating. Let's find out how it works!",
        cta: "Discover",
      },
      {
        title: "Northern Lights Mystery",
        description: "One of nature's most beautiful displays - learn the science behind the aurora borealis!",
        cta: "Explore",
      },
      {
        title: "The Science of Bread",
        description: "Yeast, gluten, and chemistry combine to create the perfect loaf. Let's dive in!",
        cta: "Learn",
      },
      {
        title: "Navigation Before GPS",
        description: "From stars to compasses to paper maps - how did people find their way?",
        cta: "Discover",
      },
      {
        title: "Your Birthstone Story",
        description: "Each month has a special gem with its own history and meaning. What's yours?",
        cta: "Find Out",
      },
    ],
  },
  {
    id: "use-ai-this-way",
    type: "Use AI This Way",
    icon: "💡",
    gradient: "from-green-400 to-teal-400",
    fullScreenBg: "from-green-500 to-teal-500",
    content: [
      "Ask AI to plan your weekly meals",
      "Get AI to explain your medications",
      "Let AI help write birthday cards",
      "Use AI for family history research",
      "Have AI suggest gift ideas for loved ones",
      "Ask AI about local events happening near you",
    ],
    expandedContent: [
      {
        title: "Meal Planning Made Easy",
        description: "Tell AI your preferences and dietary needs, and get a whole week of delicious meal ideas!",
        cta: "Plan Meals",
      },
      {
        title: "Understand Your Medications",
        description: "Ask AI to explain what your medications do in simple terms. Always consult your doctor too!",
        cta: "Ask Now",
      },
      {
        title: "Perfect Birthday Messages",
        description: "Let AI help you write heartfelt, personalized birthday cards for your loved ones!",
        cta: "Write Card",
      },
      {
        title: "Family History Research",
        description: "AI can help you explore genealogy resources and organize your family tree!",
        cta: "Start Research",
      },
      {
        title: "Gift Ideas Generator",
        description: "Describe the person and occasion, and AI will suggest thoughtful gift ideas!",
        cta: "Get Ideas",
      },
      {
        title: "Local Events Finder",
        description: "Ask AI about concerts, festivals, and activities happening in your area!",
        cta: "Find Events",
      },
    ],
  },
  {
    id: "weekly-challenge",
    type: "Challenge of the Week",
    icon: "🏆",
    gradient: "from-indigo-400 to-blue-400",
    fullScreenBg: "from-indigo-500 to-blue-500",
    content: [
      "This week: Ask AI about 3 hobbies you've never tried!",
      "Challenge: Use AI to plan a family gathering!",
      "Try it: Ask AI to explain something you've always wondered!",
      "Goal: Have 5 conversations with AI this week!",
      "Mission: Discover 3 new ways AI can help your daily life!",
    ],
    expandedContent: [
      {
        title: "Explore New Hobbies!",
        description: "Ask AI about hobbies you've always been curious about. You might find your new passion!",
        cta: "Start Exploring",
      },
      {
        title: "Plan a Family Gathering",
        description: "Let AI help you plan the menu, activities, and logistics for a memorable family event!",
        cta: "Start Planning",
      },
      {
        title: "Satisfy Your Curiosity",
        description: "What have you always wondered about? Space? History? Science? Ask AI anything!",
        cta: "Ask Away",
      },
      {
        title: "5 Conversations Challenge",
        description: "Try having 5 different conversations with AI this week. Each one teaches you something new!",
        cta: "Start Chatting",
      },
      {
        title: "AI Life Hacks",
        description: "Discover 3 new ways AI can make your daily routine easier and more enjoyable!",
        cta: "Discover",
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
      size: "medium",
      action: onOpenTips,
    },
    {
      id: "ask-me",
      title: "Ask Me",
      description: "Anything",
      icon: MessageCircle,
      gradient: "from-cyan-500 to-blue-500",
      shadowColor: "shadow-cyan-500/30",
      size: "medium",
      action: onOpenVoice,
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
              onClick={() => {
                setExpandedCard(null)
                onStartChat()
              }}
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

          {/* Tips */}
          <button
            onClick={coreFeatures[3].action}
            className={`bg-gradient-to-br ${coreFeatures[3].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[3].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <Lightbulb className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[3].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[3].description}</p>
          </button>

          {/* Ask Me Anything - same style as Tips, positioned next to Tips under Gallery */}
          <button
            onClick={coreFeatures[4].action}
            className={`bg-gradient-to-br ${coreFeatures[4].gradient} text-white rounded-3xl p-4 shadow-xl ${coreFeatures[4].shadowColor} hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden`}
          >
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
            <MessageCircle className="w-10 h-10 mb-2 relative z-10" strokeWidth={2} />
            <h3 className="text-lg font-black relative z-10">{coreFeatures[4].title}</h3>
            <p className="text-xs text-white/80 font-medium relative z-10">{coreFeatures[4].description}</p>
          </button>
        </div>
      </div>
    </div>
  )
}
