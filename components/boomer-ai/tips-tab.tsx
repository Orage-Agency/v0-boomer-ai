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
  Heart,
  Pill,
  Activity,
  Utensils,
  Moon,
  Smile,
  Droplet,
  Users,
  Mail,
  Mic,
  BookOpen,
  Globe,
  CheckSquare,
  Home,
  Car,
  GraduationCap,
  Music,
  Newspaper,
  Plane,
  DollarSign,
  CreditCard,
  Shield,
  FileCheck,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState } from "react"

interface TipsTabProps {
  userProfile: UserProfile
  onTryPrompt: (prompt: string) => void
}

const TIPS_CATEGORIES = [
  {
    id: "health",
    title: "🧠 HEALTH & WELLNESS",
    icon: Heart,
    tips: [
      {
        icon: Pill,
        title: "Medication Reminders",
        description: "Reminds them to take pills at the right time",
        prompt: "Remind me to take my blood pressure pill every morning at 8 a.m.",
      },
      {
        icon: FileText,
        title: "Understanding Prescriptions",
        description: "Explains what each medication is for and possible side effects",
        prompt: "Can you tell me what Metformin is used for and what I should watch out for?",
      },
      {
        icon: Activity,
        title: "Daily Health Check-In",
        description: "Tracks how they feel each day and summarizes their wellness",
        prompt: "Ask me how I'm feeling every morning and keep a little note of it.",
      },
      {
        icon: FileCheck,
        title: "Doctor Visit Preparation",
        description: "Helps write down questions before appointments",
        prompt: "Help me make a list of questions to ask my heart doctor.",
      },
      {
        icon: Utensils,
        title: "Healthy Recipe Finder",
        description: "Suggests low-salt, diabetic-friendly, or easy meals",
        prompt: "Give me a simple dinner that's low in sodium and takes under 20 minutes.",
      },
      {
        icon: Activity,
        title: "Exercise Coach",
        description: "Suggests light workouts or chair exercises",
        prompt: "Show me gentle exercises I can do with my bad knee.",
      },
      {
        icon: Moon,
        title: "Sleep Helper",
        description: "Tracks bedtime habits and gives tips for better sleep",
        prompt: "Why am I waking up at 3 a.m.? Can you help me sleep through the night?",
      },
      {
        icon: Smile,
        title: "Mood Support",
        description: "Offers positive affirmations and conversation when they feel lonely",
        prompt: "I'm feeling down today. Can you cheer me up with something encouraging?",
      },
      {
        icon: Heart,
        title: "Symptom Checker",
        description: "Helps describe symptoms and when to call a doctor",
        prompt: "I've had a cough for two weeks. Should I call my doctor or wait it out?",
      },
      {
        icon: Droplet,
        title: "Hydration Tracker",
        description: "Reminds them to drink water throughout the day",
        prompt: "Remind me to drink a glass of water every two hours.",
      },
    ],
  },
  {
    id: "communication",
    title: "💬 COMMUNICATION & CONNECTION",
    icon: MessageSquare,
    tips: [
      {
        icon: Mail,
        title: "Message Writer",
        description: "Writes texts or emails to family in a warm tone",
        prompt: "Write a nice text to my granddaughter to wish her good luck at college.",
      },
      {
        icon: Mic,
        title: "Voice-to-Text Notes",
        description: "Converts spoken words into written reminders",
        prompt: "Take a note: call the pharmacy tomorrow.",
      },
      {
        icon: BookOpen,
        title: "Memory Journal",
        description: "Records life stories or memories by voice",
        prompt: "Let's record my story about when I met your grandpa.",
      },
      {
        icon: Globe,
        title: "Translation Assistant",
        description: "Translates text or speech when traveling",
        prompt: "How do I say 'Where's the restroom?' in Spanish?",
      },
      {
        icon: Users,
        title: "Virtual Friend Chat",
        description: "Keeps company and chats about hobbies",
        prompt: "Let's talk about gardening today.",
      },
    ],
  },
  {
    id: "daily-living",
    title: "🏠 DAILY LIVING & ORGANIZATION",
    icon: Home,
    tips: [
      {
        icon: CheckSquare,
        title: "To-Do List Manager",
        description: "Keeps track of errands and chores",
        prompt: "Add 'pick up groceries' to my to-do list for tomorrow.",
      },
      {
        icon: ShoppingCart,
        title: "Shopping Assistant",
        description: "Finds deals and helps compare products",
        prompt: "Find the best deal for hearing aid batteries near me.",
      },
      {
        icon: Calendar,
        title: "Calendar Organizer",
        description: "Keeps track of birthdays, appointments, and bills",
        prompt: "Remind me of my dentist appointment next Thursday at 10.",
      },
      {
        icon: Home,
        title: "Smart Home Control",
        description: "Adjusts lights, thermostat, or locks using AI voice",
        prompt: "Turn off the living room lights and lower the thermostat to 70.",
      },
      {
        icon: Car,
        title: "Transportation Planner",
        description: "Finds easy routes or rides",
        prompt: "Find me a ride to the senior center at 9 a.m.",
      },
    ],
  },
  {
    id: "learning",
    title: "💡 LEARNING & ENTERTAINMENT",
    icon: GraduationCap,
    tips: [
      {
        icon: GraduationCap,
        title: "Learning Buddy",
        description: "Teaches new skills or hobbies in plain English",
        prompt: "Teach me the basics of using an iPhone camera.",
      },
      {
        icon: Lightbulb,
        title: "Trivia & Games",
        description: "Plays word games or trivia to stay mentally sharp",
        prompt: "Let's play a memory game with famous songs from the 1970s.",
      },
      {
        icon: Newspaper,
        title: "Reading Companion",
        description: "Reads news or books aloud",
        prompt: "Read me today's top stories about Oklahoma.",
      },
      {
        icon: Music,
        title: "Music & Mood DJ",
        description: "Plays songs to fit the mood",
        prompt: "Play relaxing music for my afternoon nap.",
      },
      {
        icon: Plane,
        title: "AI Travel Guide",
        description: "Plans safe senior-friendly trips",
        prompt: "Plan a 3-day road trip around Oklahoma City with easy stops.",
      },
    ],
  },
  {
    id: "finance",
    title: "💵 FINANCE & SECURITY",
    icon: DollarSign,
    tips: [
      {
        icon: Clock,
        title: "Bill Reminder",
        description: "Reminds them when bills are due",
        prompt: "Remind me to pay my electric bill on the 15th.",
      },
      {
        icon: CreditCard,
        title: "Budget Helper",
        description: "Tracks spending and suggests savings",
        prompt: "Help me see where I'm spending the most this month.",
      },
      {
        icon: Shield,
        title: "Scam Alert Coach",
        description: "Checks suspicious emails or phone calls",
        prompt: "Someone emailed me about a prize. Is this a scam?",
      },
      {
        icon: FileText,
        title: "Document Finder",
        description: "Locates or summarizes PDFs and letters",
        prompt: "Find my Medicare statement and tell me what it says in simple terms.",
      },
      {
        icon: FileCheck,
        title: "Legacy & Will Organizer",
        description: "Helps prepare important documents and notes",
        prompt: "Help me organize my will and list where my important papers are.",
      },
    ],
  },
  {
    id: "ai-basics",
    title: "✨ AI BASICS",
    icon: Sparkles,
    tips: [
      {
        icon: MessageSquare,
        title: "Write Better Emails",
        description: "Craft clear, professional messages for any situation",
        prompt: "Help me write a professional email about [topic] to [person]. Make it clear and polite.",
      },
      {
        icon: Search,
        title: "Research Anything",
        description: "Get instant answers to your questions in simple terms",
        prompt: "Explain [topic] to me in simple, easy-to-understand terms with examples.",
      },
      {
        icon: FileText,
        title: "Summarize Long Text",
        description: "Extract key points from articles, emails, or documents",
        prompt: "Summarize this text in 3-5 bullet points, highlighting the most important information: [paste text]",
      },
      {
        icon: Calendar,
        title: "Plan Your Day",
        description: "Organize tasks, appointments, and priorities efficiently",
        prompt: "Help me organize my day with these tasks: [list tasks]. Prioritize them and suggest a schedule.",
      },
      {
        icon: Lightbulb,
        title: "Get Creative Ideas",
        description: "Brainstorm solutions, gifts, activities, or projects",
        prompt: "Give me 5 creative and practical ideas for [topic]. Make them easy to understand and do.",
      },
      {
        icon: Phone,
        title: "Practice Conversations",
        description: "Prepare scripts for calls, meetings, or difficult talks",
        prompt:
          "Help me prepare a friendly but clear script to call [person/company] about [topic]. Include what to say if they ask questions.",
      },
      {
        icon: ShoppingCart,
        title: "Compare Options",
        description: "Make smarter decisions by weighing pros and cons",
        prompt:
          "Compare [option A] vs [option B] for me. List the pros and cons of each and help me decide which is better for [my situation].",
      },
      {
        icon: MapPin,
        title: "Plan Trips",
        description: "Get travel tips, directions, and local recommendations",
        prompt:
          "Help me plan a trip to [destination]. What should I know? Include tips on getting around, what to see, and what to avoid.",
      },
      {
        icon: Camera,
        title: "Identify & Learn",
        description: "Understand objects, plants, or things you encounter",
        prompt: "What is this? [describe what you see in detail]. Tell me about it in simple terms.",
      },
      {
        icon: Clock,
        title: "Create Reminders",
        description: "Set up helpful reminders for tasks and appointments",
        prompt: "Help me create a reminder to [task] at [time]. Make it clear and include what I need to do.",
      },
    ],
  },
]

export function TipsTab({ userProfile, onTryPrompt }: TipsTabProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["health"])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">AI Tips & Guides</h2>
            <p className="text-sm text-slate-600">Tap any tip to try it in chat</p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold text-yellow-600">{userProfile.stars}</span>
          </div>
        </div>
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        <div className="space-y-4">
          {TIPS_CATEGORIES.map((category) => {
            const isExpanded = expandedSections.includes(category.id)
            return (
              <div key={category.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{category.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {category.tips.length} tips
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white space-y-2">
                    {category.tips.map((tip) => {
                      const Icon = tip.icon
                      return (
                        <button
                          key={tip.title}
                          onClick={() => onTryPrompt(tip.prompt)}
                          className="w-full flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left group"
                        >
                          <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{tip.title}</h4>
                            <p className="text-xs text-slate-600">{tip.description}</p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          <button
            onClick={() =>
              onTryPrompt(
                "Generate 5 more helpful AI tips for seniors in the category of [choose: Health, Communication, Daily Living, Learning, or Finance]. Make them practical and easy to understand.",
              )
            }
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Ask AI to Generate More Tips</span>
          </button>
        </div>
      </div>
    </div>
  )
}
