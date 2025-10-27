"use client"

import { MessageSquare, GraduationCap, Lightbulb, User } from "lucide-react"
import type { UserProfile } from "@/app/page"

interface HomeTabProps {
  userProfile: UserProfile
  onNavigate: (tab: "home" | "chat" | "lessons" | "profile") => void
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
      id: "lessons",
      title: "Learn AI Basics",
      description: "Watch & listen",
      icon: GraduationCap,
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600",
      action: () => onNavigate("lessons"),
    },
    {
      id: "tips",
      title: "Quick Tips",
      description: "Helpful tricks",
      icon: Lightbulb,
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600",
      action: () => onNavigate("lessons"),
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

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      <div className="flex-shrink-0 px-6 pt-3 pb-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Welcome back, {userProfile.userTitle || "Friend"}!</h2>
            <p className="text-xs text-slate-600">Level: {userProfile.learningLevel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span className="text-base animate-pulse">🔥</span>
              <span className="text-xs font-bold text-orange-600">{userProfile.streak}</span>
            </button>
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-1 bg-yellow-50 hover:bg-yellow-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <span className="text-base animate-bounce">⭐</span>
              <span className="text-xs font-bold text-yellow-600">{userProfile.stars}</span>
            </button>
          </div>
        </div>
      </div>

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
