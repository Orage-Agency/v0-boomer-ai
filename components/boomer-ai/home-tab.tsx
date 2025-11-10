"use client"

import { MessageSquare, Sparkles, Lightbulb, TrendingUp, Zap, Calendar, Target, Pill } from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState, useEffect } from "react"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "tips" | "profile") => void
  onOpenArtGenerator: () => void
}

const DAILY_DISCOVERIES = [
  "Let's ask AI how to make a cherry cobbler gluten-free! 🍒",
  "Tell me about the manufacturing of tires - I'm curious how they're made! 🚗",
  "What's the history behind my favorite old TV shows? 📺",
  "How do microwave ovens actually work? It's fascinating! ⚡",
  "Teach me about the Northern Lights - why do they happen? 🌌",
  "What makes bread rise? I'd love to know the science! 🍞",
  "How did people navigate before GPS? 🧭",
  "What's the story behind my birthstone? 💎",
  "How do birds know when to migrate? 🦅",
  "What makes a sunset so colorful? 🌅",
]

const WHATS_NEW_ITEMS = [
  "🎉 New Voice Assistant: Talk to AI hands-free!",
  "🌟 Daily Discoveries: Learn something new every day!",
  "📚 Video Lessons: Step-by-step AI tutorials!",
  "💡 Smart Tips: Quick tricks to use AI better!",
]

const AI_USE_CASES = [
  "Ask AI to plan your weekly meals 🍽️",
  "Get AI to explain your medications 💊",
  "Let AI help write birthday cards 💌",
  "Use AI for family history research 📖",
]

const WEEKLY_CHALLENGES = [
  "This week: Ask AI about 3 hobbies you've never tried! 🎨",
  "Challenge: Use AI to plan a family gathering! 🎉",
  "Try it: Ask AI to explain something you've always wondered! 🤔",
  "Goal: Have 5 conversations with AI this week! 💬",
]

export function HomeTab({ userProfile, onNavigate, onOpenArtGenerator }: HomeTabProps) {
  const [dailyDiscovery, setDailyDiscovery] = useState("")
  const [whatsNew, setWhatsNew] = useState("")
  const [aiTip, setAiTip] = useState("")
  const [weeklyChallenge, setWeeklyChallenge] = useState("")
  const [floatingIcons, setFloatingIcons] = useState<Array<{ id: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
    setDailyDiscovery(DAILY_DISCOVERIES[dayOfYear % DAILY_DISCOVERIES.length])
    setWhatsNew(WHATS_NEW_ITEMS[dayOfYear % WHATS_NEW_ITEMS.length])
    setAiTip(AI_USE_CASES[dayOfYear % AI_USE_CASES.length])

    const weekNumber = Math.floor(dayOfYear / 7)
    setWeeklyChallenge(WEEKLY_CHALLENGES[weekNumber % WEEKLY_CHALLENGES.length])

    const icons = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    }))
    setFloatingIcons(icons)
  }, [])

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
    <div className="h-full flex flex-col bg-gradient-to-b from-blue-50 to-white overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        {floatingIcons.map((icon) => (
          <div
            key={icon.id}
            className="absolute animate-float"
            style={{
              left: `${(icon.id * 20) % 100}%`,
              top: `${(icon.id * 30) % 100}%`,
              animationDelay: `${icon.delay}s`,
              animationDuration: `${icon.duration}s`,
            }}
          >
            {icon.id % 3 === 0 ? "💡" : icon.id % 3 === 1 ? "⭐" : "🤖"}
            <style jsx>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(10deg); }
              }
              .animate-float {
                animation: float linear infinite;
                font-size: 2rem;
              }
            `}</style>
          </div>
        ))}
      </div>

      <div className="flex-shrink-0 overflow-y-auto px-4 pt-4 pb-2 space-y-3 relative z-10">
        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl p-4 shadow-xl border-2 border-purple-300 animate-pulse">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">✨</span>
            <h3 className="text-base font-black text-white">WHAT'S NEW</h3>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{whatsNew}</p>
        </div>

        {/* Daily Discovery */}
        <div
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-2xl p-4 shadow-xl border-2 border-yellow-300 transform hover:scale-105 transition-transform cursor-pointer"
          onClick={() => onNavigate("chat")}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-white" />
            <h3 className="text-base font-black text-white">TODAY'S DISCOVERY</h3>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{dailyDiscovery}</p>
          <p className="text-xs text-white/90 mt-2 font-semibold">Tap to explore! (+2 ⭐)</p>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-teal-400 rounded-2xl p-4 shadow-lg border-2 border-green-300">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-white" />
            <h3 className="text-base font-black text-white">USE AI THIS WAY</h3>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{aiTip}</p>
        </div>

        <div className="bg-gradient-to-r from-indigo-400 to-blue-400 rounded-2xl p-4 shadow-lg border-2 border-indigo-300">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-white" />
            <h3 className="text-base font-black text-white">CHALLENGE OF THE WEEK</h3>
          </div>
          <p className="text-sm font-bold text-white leading-snug">{weeklyChallenge}</p>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center px-4 relative z-10">
        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {mainActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 active:scale-95 flex flex-col items-center justify-center text-center aspect-square border-4 border-white`}
            >
              <action.icon className="w-16 h-16 mb-3" strokeWidth={2.5} />
              <h3 className="text-xl font-black mb-1">{action.title}</h3>
              <p className="text-sm text-white/90 font-semibold">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 pb-4 relative z-10">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate("tips")}
            className="bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center border-2 border-white/30"
          >
            <Lightbulb className="w-8 h-8 mb-1" strokeWidth={2.5} />
            <span className="text-xs font-black">Tips</span>
          </button>

          <button
            onClick={() => onNavigate("profile")}
            className="bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex flex-col items-center border-2 border-white/30"
          >
            <TrendingUp className="w-8 h-8 mb-1" strokeWidth={2.5} />
            <span className="text-xs font-black">Progress</span>
          </button>

          <button
            disabled
            className="bg-gradient-to-br from-slate-300 to-slate-400 text-white rounded-2xl p-4 shadow-lg relative overflow-hidden border-2 border-white/30 opacity-75"
          >
            <Pill className="w-8 h-8 mb-1" strokeWidth={2.5} />
            <span className="text-xs font-black">Meds</span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-[10px] font-black text-white">
                COMING
                <br />
                SOON
              </span>
            </div>
          </button>
        </div>

        <div className="mt-3 bg-yellow-50 border-2 border-yellow-300 rounded-xl p-2">
          <p className="text-[10px] text-yellow-900 text-center font-semibold leading-tight">
            ⚠️ Medical Disclaimer: This app provides general information only. Always consult your healthcare provider
            for medical advice. We are not responsible for medical decisions.
          </p>
        </div>
      </div>
    </div>
  )
}
