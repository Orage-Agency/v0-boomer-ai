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
    <div className="h-full flex flex-col bg-white">
      <div className="flex-shrink-0 px-6 pt-4 pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Welcome back, {userProfile.userTitle || "Friend"}!</h2>
            <p className="text-sm text-slate-600">Level: {userProfile.learningLevel}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 px-3 py-2 rounded-xl transition-colors"
            >
              <span className="text-xl animate-pulse">🔥</span>
              <span className="text-sm font-bold text-orange-600">{userProfile.streak}</span>
            </button>
            <button
              onClick={() => onNavigate("profile")}
              className="flex items-center gap-1.5 bg-yellow-50 hover:bg-yellow-100 px-3 py-2 rounded-xl transition-colors"
            >
              <span className="text-xl animate-bounce">⭐</span>
              <span className="text-sm font-bold text-yellow-600">{userProfile.stars}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow px-6 py-6 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {mainActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className={`${action.color} ${action.hoverColor} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex flex-col items-center justify-center text-center min-h-[160px]`}
            >
              <action.icon className="w-12 h-12 mb-3" strokeWidth={2.5} />
              <h3 className="text-lg font-bold mb-1">{action.title}</h3>
              <p className="text-sm text-white/90">{action.description}</p>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">💡 Today's Tip</h3>
            <p className="text-sm text-slate-700 mb-3">
              Try asking AI to "Explain this like I'm 5" for simple answers to complex topics.
            </p>
            <button
              onClick={() => onNavigate("chat")}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Try it now →
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">📚 Continue Learning</h3>
            <p className="text-sm text-slate-700 mb-3">
              You've completed {userProfile.lessonsCompleted?.length || 0} lessons. Keep going!
            </p>
            <button
              onClick={() => onNavigate("lessons")}
              className="text-sm font-semibold text-purple-600 hover:text-purple-700"
            >
              View lessons →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
