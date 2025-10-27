"use client"

import { useState } from "react"
import { Play, CheckCircle, ArrowRight, Brain, X, Headphones, Video, BookOpen, Flame } from "lucide-react"
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

const PODCASTS = Array.from({ length: 15 }, (_, i) => ({
  id: `podcast-${i + 1}`,
  title: `AI Basics ${i + 1}`,
  duration: `${5 + Math.floor(Math.random() * 10)} min`,
  description: "Learn AI concepts through audio",
}))

export function LessonsTab({ userProfile, updateProfile }: LessonsTabProps) {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"videos" | "podcasts" | "lessons">("videos")

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
              <h2 className="text-lg font-bold text-slate-900">Learning Hub</h2>
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

        <div className="flex gap-2">
          <button
            onClick={() => setActiveSection("videos")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === "videos" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Video className="w-3 h-3" />
            Videos
          </button>
          <button
            onClick={() => setActiveSection("podcasts")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === "podcasts" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Headphones className="w-3 h-3" />
            Podcasts
          </button>
          <button
            onClick={() => setActiveSection("lessons")}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeSection === "lessons" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            Lessons
          </button>
        </div>
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto">
        {activeSection === "videos" && (
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
        )}

        {activeSection === "podcasts" && (
          <div className="grid grid-cols-1 gap-2">
            {PODCASTS.map((podcast, index) => (
              <button
                key={podcast.id}
                className="bg-white border-2 border-slate-200 hover:border-purple-500 rounded-xl p-3 transition-colors text-left flex items-center gap-3"
              >
                <div className="flex-shrink-0 bg-purple-100 p-2 rounded-lg">
                  <Headphones className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-slate-500">Episode {index + 1}</span>
                    <span className="text-xs text-slate-500">• {podcast.duration}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 truncate">{podcast.title}</h3>
                  <p className="text-xs text-slate-600 truncate">{podcast.description}</p>
                </div>
                <Play className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}

        {activeSection === "lessons" && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Text lessons coming soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}
