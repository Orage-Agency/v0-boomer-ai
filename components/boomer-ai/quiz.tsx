"use client"

import { useState } from "react"

interface QuizProps {
  onComplete: (score: number) => void
}

const QUIZ_DATA = [
  {
    question: "How familiar are you with 'AI'?",
    answers: [
      { text: "Never heard of it.", value: 1 },
      { text: "Heard of it, don't know what it is.", value: 2 },
      { text: "I have a basic idea.", value: 3 },
      { text: "I understand it well.", value: 4 },
    ],
  },
  {
    question: "Have you used a voice assistant?",
    answers: [
      { text: "Never.", value: 1 },
      { text: "A few times.", value: 2 },
      { text: "Yes, regularly.", value: 3 },
      { text: "I use it daily.", value: 4 },
    ],
  },
  {
    question: "How comfortable are you with new tech?",
    answers: [
      { text: "Not comfortable at all.", value: 1 },
      { text: "A bit nervous, but willing.", value: 2 },
      { text: "Comfortable with guidance.", value: 3 },
      { text: "Excited to learn!", value: 4 },
    ],
  },
]

export function Quiz({ onComplete }: QuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)

  const handleAnswer = (value: number) => {
    const newScore = score + value

    if (currentQuestion < QUIZ_DATA.length - 1) {
      setScore(newScore)
      setCurrentQuestion(currentQuestion + 1)
    } else {
      onComplete(newScore)
    }
  }

  const question = QUIZ_DATA[currentQuestion]

  return (
    <section className="flex flex-col items-center justify-center p-8 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">{question.question}</h2>

        <div className="space-y-3">
          {question.answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(answer.value)}
              className="w-full bg-white hover:bg-blue-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-semibold text-lg py-5 px-6 rounded-xl transition-all duration-200 hover:shadow-md text-left"
            >
              {answer.text}
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Question {currentQuestion + 1} of {QUIZ_DATA.length}
        </p>
      </div>
    </section>
  )
}
