"use client"

import { useState } from "react"
import { Baby, Sparkles, Zap, Cpu } from "lucide-react"

interface LearningLevelProps {
  recommendedLevel: string
  onContinue: (level: string) => void
}

const LEVELS = [
  {
    name: "Absolute Beginner",
    icon: Baby,
    description: "Brand new to technology. We'll start from the very beginning.",
    color: "text-pink-600",
  },
  {
    name: "Beginner",
    icon: Sparkles,
    description: "Start from the basics. No prior AI experience needed.",
    color: "text-green-600",
  },
  {
    name: "Intermediate",
    icon: Zap,
    description: "You've tried tech and want practical workflows.",
    color: "text-blue-600",
  },
  {
    name: "Advanced",
    icon: Cpu,
    description: "Dive deep into capabilities and customization.",
    color: "text-purple-600",
  },
]

export function LearningLevel({ recommendedLevel, onContinue }: LearningLevelProps) {
  const [selectedLevel, setSelectedLevel] = useState(recommendedLevel)

  return (
    <section className="flex flex-col items-center justify-center p-8 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-3 text-center">Choose Your Learning Level</h2>
        <p className="text-lg text-slate-600 mb-8 text-center">
          Based on your answers, we recommend the{" "}
          <span className="font-bold text-slate-900">{recommendedLevel.toLowerCase()}</span> level.
        </p>

        <div className="space-y-3">
          {LEVELS.map((level) => {
            const Icon = level.icon
            const isSelected = selectedLevel === level.name
            const isRecommended = recommendedLevel === level.name

            return (
              <button
                key={level.name}
                onClick={() => setSelectedLevel(level.name)}
                className={`w-full relative border-2 p-5 rounded-xl transition-all duration-200 text-left ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-6 h-6 mt-0.5 flex-shrink-0 ${level.color}`} />
                  <div className="flex-grow">
                    <h3 className="font-bold text-xl text-slate-900 mb-1">{level.name}</h3>
                    <p className="text-slate-600 text-base">{level.description}</p>
                  </div>
                </div>
                {isRecommended && (
                  <span className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full bg-yellow-400 text-yellow-900">
                    Recommended
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onContinue(selectedLevel)}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Continue
        </button>
      </div>
    </section>
  )
}
