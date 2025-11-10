"use client"

import { useState } from "react"
import { Play, CheckCircle, ArrowRight, Brain, X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface LessonsTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  onNavigateToChat?: (prompt: string) => void
}

const VIDEO_LESSONS = [
  {
    id: "ask-ai-diy",
    title: "Ask AI and Do It Yourself",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/4b3e23ac-d014-420c-9189-f91877c98e5d.mp4",
    prompt: "How can I use AI to help me do things myself? Give me 3 practical examples I can try today!",
  },
  {
    id: "interact-family",
    title: "Interact with Your Family",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/b397f50d-34b5-461e-bc14-a19abc3b66db.mp4",
    prompt:
      "Help me find fun activities to do with my granddaughter, like playing volleyball or other games we can enjoy together!",
  },
  {
    id: "easy-push-button",
    title: "Easy to Use - Push a Button and Make Things Happen",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/bf06e1a1-37a6-46f5-9ba6-ec12a739e098.mp4",
    prompt: "Show me how easy it is to use AI - what are some simple things I can ask you to do right now?",
  },
  {
    id: "sports-stats",
    title: "Sports and Stats - Ask AI",
    duration: "4 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/33a0a5dc-ee0b-4eff-a9e7-a3e8bed599be.mp4",
    prompt: "Tell me about my favorite sports team's latest stats and what makes them special this season!",
  },
  {
    id: "ai-new-boomers",
    title: "AI is New to Boomers",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/dace82a2-eb45-4c97-8337-4e2ceb2c211f.mp4",
    prompt: "Explain AI to me in a way that's easy to understand - what is it and how can it help me in my daily life?",
  },
  {
    id: "learn-ai-how-to",
    title: "Learn AI and How to Use It",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/424fdb71-3868-4075-8785-45d414ebf5ad.mp4",
    prompt:
      "Teach me the basics of using AI effectively - what are the best ways to ask questions and get helpful answers?",
  },
]

export function LessonsTab({ userProfile, updateProfile, onNavigateToChat }: LessonsTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

  const lesson = VIDEO_LESSONS.find((l) => l.id === selectedLesson)
  const isCompleted = (lessonId: string) => userProfile.lessonsCompleted?.includes(lessonId) ?? false

  const handleMarkComplete = (lessonId: string) => {
    if (!isCompleted(lessonId)) {
      const newStars = userProfile.stars + 10
      const newStreak = userProfile.streak + 1

      updateProfile({
        lessonsCompleted: [...(userProfile.lessonsCompleted || []), lessonId],
        stars: newStars,
        streak: newStreak,
      })

      alert(`🎉 AWESOME JOB! You earned +10 stars! 

Total Stars: ${newStars} ⭐
Streak: ${newStreak} days 🔥

You're becoming an AI expert!`)
    }
    setSelectedLesson(null)
  }

  const handleTryInChat = (prompt: string) => {
    if (onNavigateToChat) {
      onNavigateToChat(prompt)
    }
  }

  if (lesson) {
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg font-bold text-slate-900">{lesson.title}</h2>
          <button onClick={() => setSelectedLesson(null)} className="p-2 hover:bg-white rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-grow flex flex-col px-4 py-3 gap-3 overflow-y-auto">
          <div className="bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
            <video controls className="w-full" preload="metadata" style={{ maxHeight: "250px" }}>
              <source src={lesson.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex-shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-4 shadow-md">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Try This in Chat!
            </h3>
            <p className="text-sm text-slate-700 mb-3 italic leading-relaxed">"{lesson.prompt}"</p>
            <Button
              onClick={() => handleTryInChat(lesson.prompt)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl text-base shadow-lg"
            >
              Ask AI Now! 💬
            </Button>
          </div>

          <Button
            onClick={() => handleMarkComplete(lesson.id)}
            disabled={isCompleted(lesson.id)}
            className={`flex-shrink-0 w-full font-bold py-4 rounded-xl text-base shadow-lg ${
              isCompleted(lesson.id)
                ? "bg-green-100 text-green-700 cursor-default"
                : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isCompleted(lesson.id) ? "Completed! ✓" : "Mark as Complete (+10 ⭐)"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-2 rounded-xl shadow-md">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Video Lessons</h2>
              <p className="text-sm text-slate-600">Real people, real help!</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-orange-100 px-3 py-1.5 rounded-lg shadow-sm">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-base font-bold text-orange-600">{userProfile.streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="text-base">⭐</span>
              <span className="text-base font-bold text-yellow-600">{userProfile.stars}</span>
            </div>
          </div>
        </div>

        {userProfile.stars < 100 && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-3 shadow-sm">
            <p className="text-sm text-center font-bold text-orange-700">
              🎯 You're Crushing It! Complete more lessons to earn stars! 🌟
            </p>
          </div>
        )}
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {VIDEO_LESSONS.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="bg-white border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg rounded-2xl p-4 transition-all text-left flex items-center gap-4 transform hover:scale-102"
            >
              <div className="flex-shrink-0">
                {isCompleted(lesson.id) ? (
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                    <CheckCircle className="w-7 h-7 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    Lesson {index + 1}
                  </span>
                  <span className="text-xs text-slate-500">• {lesson.duration}</span>
                  {isCompleted(lesson.id) && (
                    <span className="text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">
                      ✓ Done!
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">{lesson.title}</h3>
              </div>
              <ArrowRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
