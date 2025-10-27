"use client"

import {
  Phone,
  FileText,
  Calendar,
  Search,
  MessageSquare,
  ShoppingCart,
  Camera,
  MapPin,
  Clock,
  Lightbulb,
} from "lucide-react"
import type { UserProfile } from "@/app/page"

interface TipsTabProps {
  userProfile: UserProfile
  onTryPrompt: (prompt: string) => void
}

const TIPS = [
  {
    icon: MessageSquare,
    title: "Write Better Emails",
    description: "Craft clear, professional messages for any situation",
    problem: "Need help writing emails that get results",
    prompt: "Help me write a professional email about [topic] to [person]. Make it clear and polite.",
  },
  {
    icon: Search,
    title: "Research Anything",
    description: "Get instant answers to your questions in simple terms",
    problem: "Want to understand complex topics quickly",
    prompt: "Explain [topic] to me in simple, easy-to-understand terms with examples.",
  },
  {
    icon: FileText,
    title: "Summarize Long Text",
    description: "Extract key points from articles, emails, or documents",
    problem: "Too much to read, need the main points",
    prompt: "Summarize this text in 3-5 bullet points, highlighting the most important information: [paste text]",
  },
  {
    icon: Calendar,
    title: "Plan Your Day",
    description: "Organize tasks, appointments, and priorities efficiently",
    problem: "Feeling overwhelmed with too much to do",
    prompt: "Help me organize my day with these tasks: [list tasks]. Prioritize them and suggest a schedule.",
  },
  {
    icon: Lightbulb,
    title: "Get Creative Ideas",
    description: "Brainstorm solutions, gifts, activities, or projects",
    problem: "Stuck and need fresh ideas or inspiration",
    prompt: "Give me 5 creative and practical ideas for [topic]. Make them easy to understand and do.",
  },
  {
    icon: Phone,
    title: "Practice Conversations",
    description: "Prepare scripts for calls, meetings, or difficult talks",
    problem: "Nervous about an important conversation",
    prompt:
      "Help me prepare a friendly but clear script to call [person/company] about [topic]. Include what to say if they ask questions.",
  },
  {
    icon: ShoppingCart,
    title: "Compare Options",
    description: "Make smarter decisions by weighing pros and cons",
    problem: "Can't decide between different choices",
    prompt:
      "Compare [option A] vs [option B] for me. List the pros and cons of each and help me decide which is better for [my situation].",
  },
  {
    icon: MapPin,
    title: "Plan Trips",
    description: "Get travel tips, directions, and local recommendations",
    problem: "Planning a trip and need guidance",
    prompt:
      "Help me plan a trip to [destination]. What should I know? Include tips on getting around, what to see, and what to avoid.",
  },
  {
    icon: Camera,
    title: "Identify & Learn",
    description: "Understand objects, plants, or things you encounter",
    problem: "Curious about something you see",
    prompt: "What is this? [describe what you see in detail]. Tell me about it in simple terms.",
  },
  {
    icon: Clock,
    title: "Create Reminders",
    description: "Set up helpful reminders for tasks and appointments",
    problem: "Worried about forgetting important things",
    prompt: "Help me create a reminder to [task] at [time]. Make it clear and include what I need to do.",
  },
]

export function TipsTab({ userProfile, onTryPrompt }: TipsTabProps) {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">10 Ways to Use AI</h2>
            <p className="text-sm text-slate-600">Tap any tip to try it in chat</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold text-yellow-600">{userProfile.stars}</span>
          </div>
        </div>
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {TIPS.map((tip) => {
            const Icon = tip.icon
            return (
              <button
                key={tip.title}
                onClick={() => onTryPrompt(tip.prompt)}
                className="flex items-start gap-3 p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left group"
              >
                <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-xl group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-900 text-base mb-1">{tip.title}</h3>
                  <p className="text-sm text-slate-600 mb-1">{tip.description}</p>
                  <p className="text-xs text-blue-600 font-medium">💡 {tip.problem}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
