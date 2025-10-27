"use client"

import { MessageSquare, Camera, Lightbulb, User } from "lucide-react"
import type { UserProfile } from "@/app/page"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "tips" | "profile") => void
}

export function HomeTab({ userProfile, onNavigate }: HomeTabProps) {
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
      id: "camera",
      title: "Take a Picture",
      description: "Scan & learn",
      icon: Camera,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      action: () => onNavigate("lessons"), // Opens lessons tab which has camera feature
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

  const showRewardPrompt = userProfile.streak === 0 || userProfile.stars < 20

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {showRewardPrompt && (
        <div className="flex-shrink-0 mx-6 mt-3 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-3">
          <p className="text-sm font-bold text-orange-700 text-center">
            {userProfile.streak === 0
              ? "🔥 Start your learning streak today! Complete a lesson to begin."
              : "⭐ Keep learning to earn more stars! Try a new lesson."}
          </p>
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
