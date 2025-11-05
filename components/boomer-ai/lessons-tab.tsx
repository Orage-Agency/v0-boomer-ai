"use client"

import { useState } from "react"
import { Play, CheckCircle, ArrowRight, Brain, X, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface LessonsTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const VIDEO_LESSONS = [
  {
    id: "ask-ai-diy",
    title: "Ask AI and Do It Yourself",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/4b3e23ac-d014-420c-9189-f91877c98e5d.mp4",
    prompt: "How can I use AI to help me do things myself?",
  },
  {
    id: "interact-family",
    title: "Interact with Your Family",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/b397f50d-34b5-461e-bc14-a19abc3b66db.mp4",
    prompt: "Help me find activities to do with my granddaughter like playing volleyball",
  },
  {
    id: "easy-push-button",
    title: "Easy to Use - Push a Button and Make Things Happen",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/bf06e1a1-37a6-46f5-9ba6-ec12a739e098.mp4",
    prompt: "Show me how easy it is to use AI with simple buttons",
  },
  {
    id: "sports-stats",
    title: "Sports and Stats - Ask AI",
    duration: "4 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/33a0a5dc-ee0b-4eff-a9e7-a3e8bed599be.mp4",
    prompt: "Tell me about my favorite sports team's latest stats",
  },
  {
    id: "ai-new-boomers",
    title: "AI is New to Boomers",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/dace82a2-eb45-4c97-8337-4e2ceb2c211f.mp4",
    prompt: "Explain AI in a way that's easy for me to understand",
  },
  {
    id: "learn-ai-how-to",
    title: "Learn AI and How to Use It",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/424fdb71-3868-4075-8785-45d414ebf5ad.mp4",
    prompt: "Teach me the basics of using AI effectively",
  },
]

export function LessonsTab({ userProfile, updateProfile }: LessonsTabProps) {
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

      alert(`🎉 Great job! +10 stars! You now have ${newStars} stars and a ${newStreak}-day streak!`)
    }
    setSelectedLesson(null)
  }

  if (lesson) {
    return (
      <div className="flex flex-col h-full bg-white overflow-hidden">
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">{lesson.title}</h2>
          <button
            onClick={() => setSelectedLesson(null)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex-grow flex flex-col px-4 py-3 gap-3 overflow-hidden">
          <div className="bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
            <video controls className="w-full" preload="metadata" style={{ maxHeight: "200px" }}>
              <source src={lesson.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="flex-shrink-0 bg-blue-50 border-2 border-blue-200 rounded-xl p-3">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Try it in Chat</h3>
            <p className="text-xs text-slate-700 mb-2 italic">"{lesson.prompt}"</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm">
              Open in Chat <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <Button
            onClick={() => handleMarkComplete(lesson.id)}
            className="flex-shrink-0 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isCompleted(lesson.id) ? "Completed! ✓" : "Mark as Complete (+10 ⭐)"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Video Lessons</h2>
              <p className="text-xs text-slate-600">Earn stars as you learn!</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-100 px-2 py-1 rounded-lg">
              <Flame className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-bold text-orange-600">{userProfile.streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-lg">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-bold text-yellow-600">{userProfile.stars}</span>
            </div>
          </div>
        </div>

        {userProfile.stars < 50 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-center font-bold text-orange-600">
              🎯 Complete lessons to earn more stars! Goal: 50 ⭐
            </p>
          </div>
        )}
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        <div className="grid grid-cols-1 gap-2">
          {VIDEO_LESSONS.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl p-3 transition-colors text-left flex items-center gap-3"
            >
              <div className="flex-shrink-0">
                {isCompleted(lesson.id) ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <Play className="w-3 h-3 text-blue-600" />
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold text-slate-500">Video {index + 1}</span>
                  <span className="text-xs text-slate-500">• {lesson.duration}</span>
                  {isCompleted(lesson.id) && <span className="text-xs text-green-600">✓ Done</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-900 truncate">{lesson.title}</h3>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
