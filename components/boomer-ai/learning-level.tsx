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

  const handleDoubleClick = (level: string) => {
    setSelectedLevel(level)
    onContinue(level)
  }

  return (
    <section className="flex flex-col items-center justify-center p-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">Choose Your Learning Level</h2>
        <p className="text-base text-slate-600 mb-6 text-center">
          We recommend <span className="font-bold text-slate-900">{recommendedLevel}</span>
        </p>

        <div className="grid grid-cols-2 gap-3">
          {LEVELS.map((level) => {
            const Icon = level.icon
            const isSelected = selectedLevel === level.name
            const isRecommended = recommendedLevel === level.name

            return (
              <button
                key={level.name}
                onClick={() => setSelectedLevel(level.name)}
                onDoubleClick={() => handleDoubleClick(level.name)}
                className={`relative border-2 p-4 rounded-xl transition-all duration-200 text-center ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${level.color}`} />
                <h3 className="font-bold text-base text-slate-900 mb-1">{level.name}</h3>
                <p className="text-slate-600 text-xs leading-tight">{level.description}</p>
                {isRecommended && (
                  <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900">
                    ⭐
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <button
          onClick={() => onContinue(selectedLevel)}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Continue
        </button>

        <p className="mt-4 text-xs text-slate-500 text-center">Double-click any level to select and continue</p>
      </div>
    </section>
  )
}
