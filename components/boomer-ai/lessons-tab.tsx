"use client"

import { useState } from "react"
import { Play, CheckCircle, ArrowRight, Brain, Headphones } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface LessonsTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

const VIDEO_LESSONS = [
  {
    id: "intro",
    title: "Introduction to AI",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/4b3e23ac-d014-420c-9189-f91877c98e5d.mp4",
    prompt: "Explain what AI is in simple terms",
  },
  {
    id: "getting-started",
    title: "Getting Started",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/b397f50d-34b5-461e-bc14-a19abc3b66db.mp4",
    prompt: "How do I start using AI?",
  },
  {
    id: "first-prompt",
    title: "Your First Prompt",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/bf06e1a1-37a6-46f5-9ba6-ec12a739e098.mp4",
    prompt: "Help me write my first AI prompt",
  },
  {
    id: "everyday-uses",
    title: "Everyday AI Uses",
    duration: "4 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/33a0a5dc-ee0b-4eff-a9e7-a3e8bed599be.mp4",
    prompt: "What are 5 ways I can use AI every day?",
  },
  {
    id: "advanced-tips",
    title: "Advanced Tips",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/dace82a2-eb45-4c97-8337-4e2ceb2c211f.mp4",
    prompt: "Give me advanced tips for using AI",
  },
  {
    id: "ai-safety",
    title: "AI Safety",
    duration: "3 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/c276a675-587e-4ceb-9450-af896cf79fc4.mp4",
    prompt: "How do I stay safe when using AI?",
  },
  {
    id: "practice",
    title: "Practice & Review",
    duration: "2 min",
    url: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/424fdb71-3868-4075-8785-45d414ebf5ad.mp4",
    prompt: "Let's practice what I learned about AI",
  },
]

export function LessonsTab({ userProfile, updateProfile }: LessonsTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [showAudioLessons, setShowAudioLessons] = useState(false)

  const lesson = VIDEO_LESSONS.find((l) => l.id === selectedLesson)
  const isCompleted = (lessonId: string) => userProfile.lessonsCompleted?.includes(lessonId) ?? false

  const handleMarkComplete = (lessonId: string) => {
    if (!isCompleted(lessonId)) {
      updateProfile({
        lessonsCompleted: [...(userProfile.lessonsCompleted || []), lessonId],
        stars: userProfile.stars + 5,
      })
    }
    setSelectedLesson(null)
  }

  if (showAudioLessons) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
          <button
            onClick={() => setShowAudioLessons(false)}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-2"
          >
            ← Back to Lessons
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <Headphones className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Audio Lessons</h2>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto px-6 py-4">
          <p className="text-slate-600 mb-6">Listen and learn at your own pace.</p>
          {/* Audio lessons would go here */}
        </div>
      </div>
    )
  }

  if (lesson) {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
          <button
            onClick={() => setSelectedLesson(null)}
            className="text-blue-600 hover:text-blue-700 font-semibold mb-2"
          >
            ← Back to Lessons
          </button>
          <h2 className="text-xl font-bold text-slate-900">{lesson.title}</h2>
        </div>

        <div className="flex-grow overflow-y-auto px-6 py-4">
          <div className="bg-slate-100 rounded-2xl overflow-hidden mb-6">
            <video controls className="w-full" preload="metadata">
              <source src={lesson.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-slate-900 mb-2">Try it in Chat</h3>
              <p className="text-slate-700 mb-3 italic">"{lesson.prompt}"</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                Open in Chat <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            <Button
              onClick={() => handleMarkComplete(lesson.id)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Mark as Complete
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-100 p-3 rounded-full">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Lessons</h2>
        </div>
        <p className="text-slate-600">Learn AI step by step</p>
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-4">
        <div className="space-y-3 mb-6">
          {VIDEO_LESSONS.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-colors text-left"
            >
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  {isCompleted(lesson.id) ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">Lesson {index + 1}</span>
                    <span className="text-xs text-slate-500">• {lesson.duration}</span>
                  </div>
                  <h3 className="font-bold text-slate-900">{lesson.title}</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAudioLessons(true)}
          className="w-full bg-slate-100 border-2 border-slate-200 hover:border-blue-500 rounded-xl p-4 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Headphones className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-grow text-left">
              <h3 className="font-bold text-slate-900">Audio Lessons</h3>
              <p className="text-sm text-slate-600">Listen on the go</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </button>
      </div>
    </div>
  )
}
