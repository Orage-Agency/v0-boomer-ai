"use client"

import { MessageSquare, Sparkles, Lightbulb, User } from "lucide-react"
import type { UserProfile } from "@/app/page"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "tips" | "profile") => void
  onOpenArtGenerator: () => void
}

export function HomeTab({ userProfile, onNavigate, onOpenArtGenerator }: HomeTabProps) {
  const mainActions = [
    {
      id: "chat",
      title: "Start Chatting",
      description: "Ask AI anything",
      icon: MessageSquare,
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600",
      action: () => onNavigate("chat"),
    },
    {
      id: "art",
      title: "AI Art",
      description: "Create sketches",
      icon: Sparkles,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      action: () => onOpenArtGenerator(),
    },
    {
      id: "tips",
      title: "Quick Tips",
      description: "Helpful tricks",
      icon: Lightbulb,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      action: () => onNavigate("tips"),
    },
    {
      id: "profile",
      title: "My Progress",
      description: "View stats",
      icon: User,
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600",
      action: () => onNavigate("profile"),
    },
  ]

  const getRewardMessage = () => {
    if (userProfile.streak === 0) {
      return "🔥 Start your streak! Chat with AI or complete a lesson to earn your first star."
    }
    if (userProfile.stars < 10) {
      return "⭐ Keep going! Try a new tip or lesson to earn more stars."
    }
    if (userProfile.stars < 50) {
      return "🌟 Great progress! Complete daily lessons to maintain your streak and earn bonus stars."
    }
    return "✨ Amazing! You're a star collector! Keep your streak alive for bonus rewards."
  }

  const showRewardPrompt = userProfile.stars < 100

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {showRewardPrompt && (
        <div className="flex-shrink-0 mx-6 mt-3 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-3 shadow-md">
          <p className="text-sm font-bold text-orange-700 text-center">{getRewardMessage()}</p>
          <div className="mt-2 flex items-center justify-center gap-4 text-xs text-orange-600">
            <span>💬 Chat: +1 ⭐</span>
            <span>📚 Lesson: +2 ⭐</span>
            <span>🔥 Daily Streak: +5 ⭐</span>
          </div>
        </div>
      )}

      <div className="flex-grow flex items-center justify-center px-6 py-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
          {mainActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center aspect-square`}
            >
              <action.icon className="w-10 h-10 mb-2" strokeWidth={2.5} />
              <h3 className="text-base font-bold mb-1">{action.title}</h3>
              <p className="text-xs text-white/90">{action.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
