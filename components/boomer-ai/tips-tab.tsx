"use client"

import { Mail, Newspaper, UtensilsCrossed, Calendar, Phone, FileText, HelpCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface TipsTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const TIPS = [
  {
    icon: Mail,
    title: "Fix my email",
    description: "Make it clear and kind",
    prompt: "Rewrite this email to be clear and kind, 5 sentences max: [paste your email]",
  },
  {
    icon: Phone,
    title: "Phone script",
    description: "Confirm appointments",
    prompt: "Make me a quick call script to confirm an appointment for [service] with [name] at [time].",
  },
  {
    icon: FileText,
    title: "Explain invoice",
    description: "Understand bills",
    prompt: "Explain this invoice in plain English and highlight anything unusual: [paste invoice]",
  },
  {
    icon: Newspaper,
    title: "Facebook post",
    description: "For local business",
    prompt:
      "Write a friendly Facebook post for a [industry] business in Oklahoma City, 80-120 words, add 3 relevant hashtags.",
  },
  {
    icon: UtensilsCrossed,
    title: "Recipe ideas",
    description: "Quick & easy meals",
    prompt: "Give me a simple [meal type] recipe that takes less than 30 minutes.",
  },
  {
    icon: Calendar,
    title: "Plan my week",
    description: "Stay organized",
    prompt: "Help me plan my week from this calendar text: [paste your schedule]",
  },
  {
    icon: HelpCircle,
    title: "Compare options",
    description: "Make decisions",
    prompt: "Explain options A vs B like I'm new to this: [describe your options]",
  },
]

export function TipsTab({ userProfile, updateProfile }: TipsTabProps) {
  const handleTryNow = (prompt: string) => {
    // This would navigate to chat tab with the prompt pre-filled
    console.log("[v0] Try prompt:", prompt)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">Quick Tips</h2>
        <p className="text-slate-600">2-minute tricks you can try right now</p>
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {TIPS.map((tip) => {
            const Icon = tip.icon
            return (
              <div
                key={tip.title}
                className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 transition-colors"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="flex-shrink-0 bg-blue-100 p-3 rounded-xl">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 mb-1">{tip.title}</h3>
                    <p className="text-sm text-slate-600">{tip.description}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700 italic">"{tip.prompt}"</p>
                </div>
                <Button
                  onClick={() => handleTryNow(tip.prompt)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl"
                >
                  Try This Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
