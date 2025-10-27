"use client"

import {
  Mail,
  Phone,
  FileText,
  Calendar,
  Search,
  MessageSquare,
  ShoppingCart,
  Camera,
  MapPin,
  Clock,
} from "lucide-react"
import type { UserProfile } from "@/app/page"

interface TipsTabProps {
  userProfile: UserProfile
  onTryPrompt: (prompt: string) => void
}

const TIPS_BY_LEVEL = {
  "Absolute Beginner": [
    {
      icon: Mail,
      title: "Write a simple email",
      problem: "Need help with a message to family or friends",
      prompt: "Help me write a simple email to [name] saying: [what you want to say]",
    },
    {
      icon: Phone,
      title: "Call the doctor",
      problem: "Need to schedule or confirm an appointment",
      prompt: "Give me a simple script to call my doctor's office to [schedule/confirm/cancel] an appointment",
    },
    {
      icon: Search,
      title: "Look something up",
      problem: "Want to learn about something new",
      prompt: "Help me understand [topic] in very simple words, like explaining to a friend",
    },
    {
      icon: Calendar,
      title: "Remember my appointments",
      problem: "Keep track of doctor visits and events",
      prompt: "Help me remember my appointment on [date] at [time] for [reason]",
    },
    {
      icon: MessageSquare,
      title: "Text my grandkids",
      problem: "Send a nice message to family",
      prompt: "Help me write a text message to my [grandchild/family member] about [topic]",
    },
    {
      icon: FileText,
      title: "Understand a letter",
      problem: "Got mail that's confusing",
      prompt: "Explain this letter to me in simple words: [paste the text]",
    },
    {
      icon: ShoppingCart,
      title: "Make a grocery list",
      problem: "Remember what to buy at the store",
      prompt: "Help me make a grocery list for [this week/dinner/occasion]",
    },
    {
      icon: Camera,
      title: "Take a nice photo",
      problem: "Want to capture a special moment",
      prompt: "Give me simple steps to take a good photo with my phone",
    },
    {
      icon: MapPin,
      title: "Get directions",
      problem: "Need to find a place",
      prompt: "Help me get directions from [my location] to [where I want to go]",
    },
    {
      icon: Clock,
      title: "Set a reminder",
      problem: "Don't want to forget something important",
      prompt: "Help me set a reminder to [task] at [time]",
    },
  ],
  Beginner: [
    {
      icon: Mail,
      title: "Fix my email",
      problem: "Make my message sound better",
      prompt: "Rewrite this email to be clear and polite: [paste your email]",
    },
    {
      icon: Phone,
      title: "Call about a bill",
      problem: "Question about a charge",
      prompt: "Give me a script to call [company] about a charge on my bill for [amount]",
    },
    {
      icon: FileText,
      title: "Understand my bill",
      problem: "Medical or utility bill is confusing",
      prompt: "Explain this bill to me in plain English: [paste the bill details]",
    },
    {
      icon: Calendar,
      title: "Plan my week",
      problem: "Too many things to remember",
      prompt: "Help me organize my week with these appointments: [list your schedule]",
    },
    {
      icon: MessageSquare,
      title: "Reply to a message",
      problem: "Someone sent me something, not sure how to respond",
      prompt: "Help me write a friendly reply to this message: [paste the message]",
    },
    {
      icon: Search,
      title: "Find a local service",
      problem: "Need a plumber, doctor, or other service nearby",
      prompt: "Help me find a good [service type] near [your city/zip code]",
    },
    {
      icon: ShoppingCart,
      title: "Compare prices",
      problem: "Want to get the best deal",
      prompt: "Help me compare [product A] and [product B] - which is better for me?",
    },
    {
      icon: FileText,
      title: "Write a thank you note",
      problem: "Want to thank someone properly",
      prompt: "Help me write a thank you note to [name] for [reason]",
    },
    {
      icon: MapPin,
      title: "Plan a trip",
      problem: "Want to visit family or go somewhere",
      prompt: "Help me plan a trip to [destination] - what should I know?",
    },
    {
      icon: Clock,
      title: "Organize my day",
      problem: "Have a lot to do, need help prioritizing",
      prompt: "Help me organize these tasks for today: [list your tasks]",
    },
  ],
  Intermediate: [
    {
      icon: Mail,
      title: "Write a business email",
      problem: "Need to contact a company professionally",
      prompt: "Write a professional email to [company/person] about [topic]",
    },
    {
      icon: MessageSquare,
      title: "Post on Facebook",
      problem: "Share news with friends and family",
      prompt: "Help me write a Facebook post about [topic] that my friends will enjoy",
    },
    {
      icon: FileText,
      title: "Fill out a form",
      problem: "Application or form is complicated",
      prompt: "Help me understand and fill out this form: [describe the form]",
    },
    {
      icon: Calendar,
      title: "Plan a family event",
      problem: "Organizing a birthday or holiday gathering",
      prompt: "Help me plan a [event type] for [number] people on [date]",
    },
    {
      icon: Search,
      title: "Research a health topic",
      problem: "Want to understand a medical condition",
      prompt: "Explain [health topic] to me in simple terms - what should I know?",
    },
    {
      icon: ShoppingCart,
      title: "Make a budget",
      problem: "Track monthly expenses",
      prompt: "Help me create a simple monthly budget for [category] with $[amount]",
    },
    {
      icon: Phone,
      title: "Negotiate a bill",
      problem: "Bill is too high, want to ask for a discount",
      prompt: "Give me a script to call [company] and ask for a lower rate on my [service]",
    },
    {
      icon: FileText,
      title: "Summarize an article",
      problem: "Article is too long, want the main points",
      prompt: "Summarize this article in simple bullet points: [paste article]",
    },
    {
      icon: MapPin,
      title: "Find local activities",
      problem: "Looking for things to do in my area",
      prompt: "What are fun activities for seniors in [your city]?",
    },
    {
      icon: Clock,
      title: "Create a routine",
      problem: "Want to be more organized daily",
      prompt: "Help me create a daily routine that includes [your goals/activities]",
    },
  ],
  Advanced: [
    {
      icon: MessageSquare,
      title: "Social media strategy",
      problem: "Want to share regularly with family/community",
      prompt: "Help me plan what to post on Facebook for the next month about [topics]",
    },
    {
      icon: FileText,
      title: "Write a formal letter",
      problem: "Need to write to government or organization",
      prompt: "Help me write a formal letter to [recipient] about [issue]",
    },
    {
      icon: Search,
      title: "Research thoroughly",
      problem: "Need detailed information on a topic",
      prompt: "Research [topic] and give me a detailed summary with sources",
    },
    {
      icon: Mail,
      title: "Email campaign",
      problem: "Want to send updates to multiple people",
      prompt: "Help me write an email to send to [group] about [topic]",
    },
    {
      icon: Calendar,
      title: "Coordinate multiple events",
      problem: "Managing several appointments and activities",
      prompt: "Help me coordinate these events and avoid conflicts: [list events]",
    },
    {
      icon: ShoppingCart,
      title: "Financial planning",
      problem: "Want to plan for a big purchase or expense",
      prompt: "Help me plan financially for [goal] over [timeframe]",
    },
    {
      icon: Phone,
      title: "Advocate for yourself",
      problem: "Need to speak up about an issue",
      prompt: "Give me a script to call [organization] about [problem] and request [solution]",
    },
    {
      icon: FileText,
      title: "Organize documents",
      problem: "Have many papers to sort through",
      prompt: "Help me create a system to organize [type of documents]",
    },
    {
      icon: MapPin,
      title: "Travel planning",
      problem: "Planning a longer trip or vacation",
      prompt: "Help me plan a [duration] trip to [destination] with [considerations]",
    },
    {
      icon: Clock,
      title: "Long-term planning",
      problem: "Want to plan ahead for the future",
      prompt: "Help me create a plan for [goal] over the next [timeframe]",
    },
  ],
}

export function TipsTab({ userProfile, onTryPrompt }: TipsTabProps) {
  const tips = TIPS_BY_LEVEL[userProfile.level as keyof typeof TIPS_BY_LEVEL] || TIPS_BY_LEVEL["Beginner"]

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Everyday Uses</h2>
        <p className="text-sm text-slate-600">Tap to try in chat</p>
      </div>

      <div className="flex-grow px-4 py-3 overflow-hidden">
        <div className="grid grid-cols-1 gap-2 h-full overflow-y-auto">
          {tips.map((tip) => {
            const Icon = tip.icon
            return (
              <button
                key={tip.title}
                onClick={() => onTryPrompt(tip.prompt)}
                className="flex items-center gap-3 p-3 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
              >
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{tip.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{tip.problem}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
