"use client"

import { Mail, Newspaper, UtensilsCrossed, Music, Pill, Calendar, Users, BookOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AIChatInterface } from "./ai-chat-interface"

interface LessonViewProps {
  lessonType: string
  userLevel: string
  onNavigate?: (view: string) => void
}

export function LessonView({ lessonType, userLevel, onNavigate }: LessonViewProps) {
  const level = userLevel.toLowerCase().replace(" ", "-")

  return (
    <>
      {lessonType === "lesson-what-is-ai" && <WhatIsAI level={level} onNavigate={onNavigate} />}
      {lessonType === "lesson-first-lesson" && <FirstLesson />}
      {lessonType === "lesson-everyday-uses" && <EverydayUses level={level} />}
      {lessonType === "lesson-meet-ai" && <MeetAI onNavigate={onNavigate} />}
      {lessonType === "audio-lessons" && <AudioLessons level={level} />}
      {lessonType === "lesson-more-ai" && <MoreAI level={level} />}
      {lessonType === "lesson-coming-soon" && <ComingSoon />}
      {lessonType === "ai-chat" && <AIChatInterface onBack={() => onNavigate?.("main-menu")} />}
    </>
  )
}

function WhatIsAI({ level, onNavigate }: { level: string; onNavigate?: (view: string) => void }) {
  const content = {
    "absolute-beginner": {
      title: "What is AI?",
      description:
        "AI stands for 'Artificial Intelligence.' Think of it as a very smart computer program that can help you with everyday tasks. Just like you might ask a friend for help, you can ask AI questions by typing or speaking. It's like having a helpful assistant right on your phone or computer who never gets tired and is always ready to help.",
    },
    beginner: {
      title: "What is AI?",
      description:
        "Artificial Intelligence (AI) is like a smart helper for your computer or phone. Think of it as a brain for technology. It can learn from information, understand your questions, and even make smart guesses to help you with things like finding information, organizing your photos, or getting directions. It's all about making technology more helpful and easier to use.",
    },
    intermediate: {
      title: "What is AI?",
      description:
        "The AI you'll be using is a 'Large Language Model' (LLM). Imagine a massive digital library containing billions of books, articles, and websites. The AI has been trained by reading all of this information, allowing it to understand patterns, context, and the nuances of human language. When you ask it a question, it uses its training to predict the most logical and helpful response.",
    },
    advanced: {
      title: "What is AI?",
      description:
        "Modern AI like ChatGPT is powered by a neural network architecture called a 'transformer' model. This model uses an 'attention' mechanism to weigh the importance of different words in your prompt, allowing it to grasp complex queries and maintain context. By mastering prompt engineering, you can guide the AI's output with incredible precision.",
    },
  }

  const currentContent = content[level as keyof typeof content] || content.beginner

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] justify-between px-6 py-8">
      <div className="flex-grow flex flex-col items-center justify-center text-center">
        <div className="bg-blue-100 p-6 rounded-full mb-6">
          <svg
            className="w-16 h-16 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.25 3.75H19.5M8.25 6.75H19.5M8.25 9.75H19.5M8.25 12.75H19.5m-11.25 4.5h11.25c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-bold mb-4 text-slate-900">{currentContent.title}</h2>
        <p className="text-lg leading-relaxed max-w-md text-slate-700">{currentContent.description}</p>
      </div>

      <div className="pt-6">
        <Button
          onClick={() => onNavigate?.("ai-chat")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-5 rounded-xl text-lg transition-colors duration-300"
        >
          Try AI Chat
        </Button>
      </div>
    </div>
  )
}

function FirstLesson() {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] px-6 py-6">
      <div className="flex-grow flex flex-col space-y-4">
        <h3 className="text-2xl font-bold text-slate-900">Begin Your First Lesson</h3>
        <p className="text-base text-slate-700">
          Watch this short video, then open your AI chat and try any of the prompts below!
        </p>

        <div className="flex-grow flex items-center justify-center">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow-md bg-slate-100">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/c0m6yaGlZh4"
              title="AI Introduction Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2 text-sm">Try these prompts:</p>
          <ul className="space-y-1 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>"Tell me a joke about computers."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>"Write a short, happy poem about sunshine."</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">•</span>
              <span>"What's a fun fact about the ocean?"</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function EverydayUses({ level }: { level: string }) {
  const usesData = {
    "absolute-beginner": [
      {
        title: "Never forget a pill.",
        example: '"Ask AI to remind me to take my heart medication at 8 AM."',
        icon: Pill,
      },
      {
        title: "Organize your day.",
        example: '"Ask AI to schedule my doctor\'s appointment for next Tuesday."',
        icon: Calendar,
      },
      {
        title: "Connect with loved ones.",
        example: '"Ask AI to call my daughter, Sarah."',
        icon: Users,
      },
      {
        title: "Find new hobbies.",
        example: '"Ask AI to find a good book about gardening."',
        icon: BookOpen,
      },
      {
        title: "Get quick answers.",
        example: '"Ask AI what the weather will be like tomorrow."',
        icon: Search,
      },
    ],
    beginner: [
      {
        title: "Never forget a pill.",
        example: '"Ask AI to remind me to take my heart medication at 8 AM."',
        icon: Pill,
      },
      {
        title: "Organize your day.",
        example: '"Ask AI to schedule my doctor\'s appointment for next Tuesday."',
        icon: Calendar,
      },
      {
        title: "Connect with loved ones.",
        example: '"Ask AI to call my daughter, Sarah."',
        icon: Users,
      },
      {
        title: "Find new hobbies.",
        example: '"Ask AI to find a good book about gardening."',
        icon: BookOpen,
      },
      {
        title: "Get quick answers.",
        example: '"Ask AI what the weather will be like tomorrow."',
        icon: Search,
      },
    ],
    intermediate: [
      {
        title: "Write Professional Emails",
        example: '"Draft an email to my doctor\'s office requesting an appointment change."',
        icon: Mail,
      },
      {
        title: "Plan Trips",
        example: '"What are the top 5 things to do in Paris for seniors?"',
        icon: Newspaper,
      },
      {
        title: "Get Recipe Suggestions",
        example: '"I have chicken, rice, and broccoli. What can I make for dinner?"',
        icon: UtensilsCrossed,
      },
      {
        title: "Brainstorm Gift Ideas",
        example: '"What\'s a good birthday gift for a 10-year-old who likes space?"',
        icon: Music,
      },
      {
        title: "Summarize Articles",
        example: '"Summarize this article for me in three bullet points." (Then paste the text)',
        icon: Newspaper,
      },
    ],
    advanced: [
      {
        title: "Complex Research",
        example: '"Compare the pros and cons of different retirement investment strategies."',
        icon: Newspaper,
      },
      {
        title: "Creative Writing",
        example: '"Write a short story about a retired teacher who discovers a hidden talent."',
        icon: Mail,
      },
      {
        title: "Advanced Meal Planning",
        example: '"Create a week-long meal plan for a diabetic diet with shopping list."',
        icon: UtensilsCrossed,
      },
      {
        title: "Learn Complex Topics",
        example: '"Explain how blockchain technology works in simple terms with examples."',
        icon: Music,
      },
      {
        title: "Custom Workflows",
        example: '"Create a template for tracking my monthly expenses with categories."',
        icon: Newspaper,
      },
    ],
  }

  const uses = usesData[level as keyof typeof usesData] || usesData.beginner

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-grow overflow-y-auto px-6 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Here's how AI can help you:</h2>
        <div className="space-y-5">
          {uses.map((use, index) => {
            const Icon = use.icon
            return (
              <div key={index} className="flex items-start gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{use.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 italic">{use.example}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function MeetAI({ onNavigate }: { onNavigate?: (view: string) => void }) {
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-grow overflow-y-auto px-6 py-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">What is AI?</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Artificial Intelligence (AI) is like teaching a computer to think and learn, similar to how people do. It
              helps machines understand things, solve problems, and even make decisions.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Key Concepts</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              Think of AI as a helpful assistant. It can understand what you say, recognize pictures, help you find
              information, and even translate languages. It learns from information to get better at these tasks over
              time.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Examples of AI</h2>
            <p className="text-base text-slate-600 leading-relaxed">
              You might already use AI every day! Things like voice assistants on your phone (like Siri), movie
              suggestions on Netflix, or even navigation apps that find the best route use AI to help you.
            </p>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4">
        <Button
          onClick={() => onNavigate?.("ai-chat")}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 px-5 rounded-xl text-lg transition-colors duration-300"
        >
          Try AI Chat
        </Button>
      </div>
    </div>
  )
}

function AudioLessons({ level }: { level: string }) {
  const lessons = {
    "absolute-beginner": [
      {
        title: "1. Welcome to AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d34002e4f8ae059caeda48.mpeg",
      },
      {
        title: "2. How to Talk to AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3426be4f8ae0371af1bef.mpeg",
      },
      {
        title: "3. Your First Question",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3433dc65175078cfb5c86.mpeg",
      },
      {
        title: "4. Simple Everyday Help",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3445d037a13ef59e5aa54.mpeg",
      },
      {
        title: "5. You Can Do This!",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d346ccc50899cf6dfa7ff2.mpeg",
      },
    ],
    beginner: [
      {
        title: "1. What is AI?",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d34002e4f8ae059caeda48.mpeg",
      },
      {
        title: "2. Your First AI Chat",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3426be4f8ae0371af1bef.mpeg",
      },
      {
        title: "3. Asking Good Questions",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3433dc65175078cfb5c86.mpeg",
      },
      {
        title: "4. Using AI for Daily Reminders",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d3445d037a13ef59e5aa54.mpeg",
      },
      {
        title: "5. Summarizing an Article",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d346ccc50899cf6dfa7ff2.mpeg",
      },
    ],
    intermediate: [
      {
        title: "1. Writing Emails with AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d348b3c651753ee1fc0efa.mpeg",
      },
      {
        title: "2. Planning a Trip",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d34f0eef40ca5a84cbf8fd.mpeg",
      },
      {
        title: "3. Getting Recipe Ideas",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d351beef40ca422bcc8be9.mpeg",
      },
      {
        title: "4. Brainstorming Hobbies",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d35526037a1344e0e822e3.mpeg",
      },
      {
        title: "5. Understanding AI Image Generation",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d360b5ef40ca324dcee02c.mpeg",
      },
    ],
    advanced: [
      {
        title: "1. Custom Instructions for Your AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d35807037a1357e7e8b012.mpeg",
      },
      {
        title: "2. AI for Complex Research",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d35ad8ef40ca72fdce2322.mpeg",
      },
      {
        title: "3. Creative Writing with AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d36123c508997699fe8576.mpeg",
      },
      {
        title: "4. How AI Learns",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d35d94037a138250e97f2b.mpeg",
      },
      {
        title: "5. The Future of AI",
        src: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68d35eca037a13b556e9a84c.mpeg",
      },
    ],
  }

  const currentLessons = lessons[level as keyof typeof lessons] || lessons.beginner

  return (
    <section className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-3xl font-bold text-slate-900">Audio Lessons</h3>
      <p className="text-lg text-slate-700">Listen and learn at your own pace. Select a lesson below.</p>

      <h4 className="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-3 capitalize">
        {level.replace("-", " ")} Lessons
      </h4>

      <div className="space-y-5">
        {currentLessons.map((lesson) => (
          <div key={lesson.title} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="font-bold text-lg mb-3 text-slate-900">{lesson.title}</p>
            <audio controls className="w-full" src={lesson.src}>
              Your browser does not support the audio element.
            </audio>
          </div>
        ))}
      </div>
    </section>
  )
}

function MoreAI({ level }: { level: string }) {
  const content = {
    "absolute-beginner": {
      title: "Getting Started Tips",
      tips: [
        {
          title: "Don't Be Afraid to Ask",
          text: "There are no silly questions! AI is here to help you learn. If you don't understand something, just ask it to explain in a simpler way.",
        },
        {
          title: "Speak or Type - Your Choice",
          text: "You can talk to AI by pressing the microphone button, or you can type. Choose whatever feels easier for you.",
        },
        {
          title: "Take Your Time",
          text: "AI will wait for you. There's no rush. Take as long as you need to read the answers or think about what to ask next.",
        },
        {
          title: "Ask for Help Anytime",
          text: 'If something isn\'t working, you can always ask "How do I use this?" or "Can you help me?" AI is patient and will guide you.',
        },
      ],
    },
    beginner: {
      title: "Beginner Tips & Tricks",
      tips: [
        {
          title: "Be Polite, but Direct",
          text: 'You can say "please" and "thank you," but it\'s most important to be clear. Instead of "I was wondering if you could find...", try "Tell me about the history of the Eiffel Tower."',
        },
        { title: "One Question at a Time", text: "Ask a single question in each message to avoid confusing the AI." },
        { title: "Use Simple Sentences", text: "You don't need complex language. Simple, clear sentences work best." },
        {
          title: "If You Don't Get a Good Answer, Rephrase",
          text: 'Try asking your question in a different way. "What\'s on TV tonight?" could become "What are the most popular shows on tonight at 8 PM?"',
        },
      ],
    },
    intermediate: {
      title: "Intermediate Tips & Tricks",
      tips: [
        {
          title: "Provide Context",
          text: 'Give the AI background information. Instead of "Give me a recipe," try "Give me a simple chicken recipe that takes less than 30 minutes and uses common pantry ingredients."',
        },
        {
          title: "Assign a Persona",
          text: 'Tell the AI who to be. "Explain climate change to me as if I were a curious 12-year-old." This changes the tone and complexity of the answer.',
        },
        {
          title: "Ask for Different Formats",
          text: 'You can tell it how you want the information. "List the pros and cons of electric cars in a table format." Or, "Give me 5 ideas for a garden party as a bulleted list."',
        },
        {
          title: "Refine and Iterate",
          text: 'Use follow-up questions to hone in on the perfect answer. After it gives you a recipe, you could ask, "Can you make that recipe lower in sodium?"',
        },
      ],
    },
    advanced: {
      title: "Advanced Tips & Tricks",
      tips: [
        {
          title: "Use Custom Instructions",
          text: 'In platforms like ChatGPT, you can set custom instructions to give the AI permanent context about you and how you want it to respond. For example: "I am a retired history teacher. Always provide historical context in your answers."',
        },
        {
          title: "Chain Prompting",
          text: 'Use the output from one prompt as the input for your next one. First, ask it to "Brainstorm 10 names for my new boat." Then, "Take name #3 from that list and write a short, funny story about its maiden voyage."',
        },
        {
          title: "Set Constraints",
          text: "Be very specific about what you want and don't want. \"Write a 100-word summary of 'Moby Dick.' Do not mention the name Ahab. The tone should be mysterious.\"",
        },
        {
          title: '"Think Step-by-Step"',
          text: 'For complex problems, especially math or logic, adding the phrase "Think step-by-step" to the end of your prompt can encourage the AI to show its work, leading to more accurate results.',
        },
      ],
    },
  }

  const currentContent = content[level as keyof typeof content] || content.beginner

  return (
    <section className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-3xl font-bold text-slate-900">{currentContent.title}</h3>
      <div className="space-y-5">
        {currentContent.tips.map((tip, index) => (
          <div key={index} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
            <p className="font-bold text-lg text-slate-900 mb-2">{tip.title}</p>
            <p className="text-slate-700 leading-relaxed">{tip.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ComingSoon() {
  const features = [
    "Taxes & Retirement",
    "Healthcare & Wellness",
    "Create Images",
    "Learn with Family",
    "Rediscover Music",
    "AI Boomer Accelerator",
  ]

  return (
    <section className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h3 className="text-3xl font-bold text-slate-900 mb-4">Coming Soon</h3>
      <p className="text-lg text-slate-700 mb-8">Here's a sneak peek:</p>
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature) => (
          <div key={feature} className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200">
            <p className="font-bold text-slate-900 mb-2">{feature}</p>
            <p className="text-xs font-bold text-blue-600">COMING SOON</p>
          </div>
        ))}
      </div>
    </section>
  )
}
