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
  Shield,
  Lock,
  Wifi,
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
  FileCheck,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Volume2,
  Eye,
  AlertTriangle,
  Key,
  Smartphone,
} from "lucide-react"
import type { UserProfile } from "@/app/page"
import { useState } from "react"

interface TipsTabProps {
  userProfile: UserProfile
  onTryPrompt: (prompt: string) => void
}

const TIPS_CATEGORIES = [
  {
    id: "cyber-security",
    title: "🔒 CYBER SECURITY",
    icon: Shield,
    tips: [
      {
        icon: Lock,
        title: "Strong Passwords",
        description: "Learn how to create passwords that hackers can't guess",
        prompt: "Teach me how to create a strong password that I can actually remember.",
      },
      {
        icon: AlertTriangle,
        title: "Spot Scam Emails",
        description: "Identify fake emails before they trick you",
        prompt: "How can I tell if an email is a scam? What are the warning signs?",
      },
      {
        icon: Eye,
        title: "Protect Your Privacy",
        description: "Keep your personal information safe online",
        prompt: "What information should I never share online and why?",
      },
      {
        icon: Wifi,
        title: "Safe Wi-Fi Use",
        description: "Stay secure when using public networks",
        prompt: "Is it safe to use public Wi-Fi? What precautions should I take?",
      },
      {
        icon: Key,
        title: "Two-Factor Security",
        description: "Add an extra layer of protection to your accounts",
        prompt: "Explain two-factor authentication in simple terms. How do I set it up?",
      },
      {
        icon: Shield,
        title: "Recognize Phone Scams",
        description: "Don't fall for fake callers pretending to be someone else",
        prompt: "Someone called claiming to be from my bank. How do I know if it's real?",
      },
      {
        icon: CreditCard,
        title: "Safe Online Shopping",
        description: "Shop online without worrying about fraud",
        prompt: "How can I shop online safely and protect my credit card information?",
      },
      {
        icon: Smartphone,
        title: "Secure Your Phone",
        description: "Keep your smartphone protected from hackers",
        prompt: "What settings should I change on my phone to make it more secure?",
      },
    ],
  },
  {
    id: "email-tips",
    title: "📧 EMAIL TIPS",
    icon: Mail,
    tips: [
      {
        icon: Mail,
        title: "Write Clear Emails",
        description: "Craft messages that get responses",
        prompt: "Help me write a professional email to request information about [topic].",
      },
      {
        icon: FileText,
        title: "Organize Your Inbox",
        description: "Keep your email tidy and find things fast",
        prompt: "What's the best way to organize my emails so I don't lose important ones?",
      },
      {
        icon: Search,
        title: "Find Old Emails",
        description: "Search for messages you need quickly",
        prompt: "How do I search for old emails in Gmail or my email app?",
      },
      {
        icon: AlertTriangle,
        title: "Avoid Email Mistakes",
        description: "Common errors to watch out for",
        prompt: "What are common email mistakes I should avoid?",
      },
      {
        icon: Calendar,
        title: "Schedule Emails",
        description: "Send emails at the perfect time",
        prompt: "Can I write an email now but send it later? How do I do that?",
      },
      {
        icon: FileCheck,
        title: "Handle Attachments",
        description: "Send and receive files easily",
        prompt: "How do I attach a photo or document to an email?",
      },
    ],
  },
  {
    id: "voice-commands",
    title: "🎤 VOICE COMMANDS",
    icon: Mic,
    tips: [
      {
        icon: Mic,
        title: "Talk to Your Phone",
        description: "Use voice instead of typing",
        prompt: "What voice commands can I use on my phone? Give me 5 useful examples.",
      },
      {
        icon: Volume2,
        title: "Voice Texting",
        description: "Send messages without typing a word",
        prompt: "How do I send a text message using just my voice?",
      },
      {
        icon: Search,
        title: "Voice Search",
        description: "Find anything by asking out loud",
        prompt: "How do I search the internet using my voice?",
      },
      {
        icon: Phone,
        title: "Make Calls by Voice",
        description: "Call anyone hands-free",
        prompt: "How do I call someone using voice commands on my phone?",
      },
      {
        icon: Calendar,
        title: "Set Reminders by Voice",
        description: "Never forget important things",
        prompt: "How do I set a reminder using just my voice?",
      },
      {
        icon: Music,
        title: "Play Music by Voice",
        description: "Enjoy your favorite songs hands-free",
        prompt: "How do I play music using voice commands?",
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
        icon: MessageSquare,
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
  const [expandedSections, setExpandedSections] = useState<string[]>(["cyber-security"])

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

      <div className="flex-grow px-4 py-3 overflow-y-auto pb-10">
        <div className="space-y-4">
          {TIPS_CATEGORIES.map((category) => {
            const isExpanded = expandedSections.includes(category.id)
            return (
              <div key={category.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-colors touch-manipulation active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg">
                      <category.icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">{category.title}</h3>
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
                          className="w-full flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left group touch-manipulation active:scale-[0.98]"
                        >
                          <div className="flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{tip.title}</h4>
                            <p className="text-sm text-slate-600">{tip.description}</p>
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
                "Generate 5 more helpful AI tips for seniors in the category of [choose: Cyber Security, Email Tips, Voice Commands, Communication, Daily Living, Learning, or Finance]. Make them practical and easy to understand.",
              )
            }
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl touch-manipulation active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Ask AI to Generate More Tips</span>
          </button>
        </div>
      </div>
    </div>
  )
}
