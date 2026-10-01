"use client"

import { useState } from "react"

interface LearningLevelProps {
  recommendedLevel: string
  onContinue: (level: string) => void
}

const LEVELS = [
  {
    name: "Beginner",
    description: "I am new to AI and want practical examples.",
  },
  {
    name: "Intermediate",
    description: "I know a few basics and want to do more.",
  },
  {
    name: "Advanced",
    description: "I use AI regularly and want to explore further.",
  },
]

function normalizeLevel(level: string): string {
  if (level === "Intermediate" || level === "Advanced") return level
  return "Beginner"
}

export function LearningLevel({ recommendedLevel, onContinue }: LearningLevelProps) {
  const [selectedLevel, setSelectedLevel] = useState(() => normalizeLevel(recommendedLevel))

  return (
    <section className="flex min-h-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <h2 className="mb-3 text-center text-3xl font-bold text-slate-900">How would you like to begin?</h2>
        <p className="mb-6 text-center text-lg text-slate-600">
          Choose a starting point. You can change it whenever you like.
        </p>

        <div className="space-y-3" role="group" aria-label="Choose a learning level">
          {LEVELS.map((level) => {
            const isSelected = selectedLevel === level.name
            return (
              <button
                key={level.name}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedLevel(level.name)}
                className={`w-full rounded-xl border px-5 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${
                  isSelected
                    ? "border-slate-800 bg-slate-50"
                    : "border-slate-300 bg-white hover:bg-slate-50"
                }`}
              >
                <span className="block text-lg font-semibold text-slate-900">{level.name}</span>
                <span className="mt-1 block text-base leading-6 text-slate-600">{level.description}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => onContinue(selectedLevel)}
          className="mt-6 min-h-14 w-full rounded-xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Continue
        </button>
      </div>
    </section>
  )
}
