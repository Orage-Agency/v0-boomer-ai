"use client"

import { useState } from "react"
import { Play, CheckCircle, ArrowRight, X } from "lucide-react"
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
      updateProfile({
        lessonsCompleted: [...(userProfile.lessonsCompleted || []), lessonId],
      })
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
        <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-white">
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

          <div className="flex-shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Try This in Chat!
            </h3>
            <p className="text-sm text-slate-700 mb-3 italic leading-relaxed">&ldquo;{lesson.prompt}&rdquo;</p>
            <Button
              onClick={() => handleTryInChat(lesson.prompt)}
              className="w-full bg-slate-900 hover:bg-slate-700 text-white font-semibold py-3 rounded-xl text-base"
            >
              Ask AI Now! 💬
            </Button>
          </div>

          <Button
            onClick={() => handleMarkComplete(lesson.id)}
            disabled={isCompleted(lesson.id)}
            className={`flex-shrink-0 w-full border font-semibold py-4 rounded-xl text-base ${
              isCompleted(lesson.id)
                ? "bg-slate-50 border-slate-300 text-slate-700 cursor-default"
                : "bg-white border-slate-400 text-slate-900 hover:bg-slate-50"
            }`}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {isCompleted(lesson.id) ? "Lesson completed" : "Mark lesson complete"}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-4 border-b border-slate-200 bg-white">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Video Lessons</h2>
            <p className="mt-1 text-base text-slate-600">Short, practical guides you can follow at your own pace.</p>
          </div>
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        <div className="grid grid-cols-1 gap-3">
          {VIDEO_LESSONS.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 transition-colors text-left flex items-center gap-4"
            >
              <div className="flex-shrink-0">
                {isCompleted(lesson.id) ? (
                  <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-slate-700" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-slate-700" />
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
                      <span className="text-xs text-slate-700 font-semibold bg-slate-100 px-2 py-0.5 rounded-full">
                      Completed
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
