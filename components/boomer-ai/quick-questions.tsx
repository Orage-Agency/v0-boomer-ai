"use client"

import React from "react"
import { useState, useCallback, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void
  isTab?: boolean
}

const QUESTIONS = [
  "What are some easy recipes for beginners?",
  "How can I stay active at home?",
  "What are the best exercises for joint health?",
  "Can you help me find local community events?",
  "What are some tips for safe internet browsing?",
  "How can I manage my medications effectively?",
  "What are some brain games to improve memory?",
  "How do I set up video calls with family?",
  "What are the signs of common health issues?",
  "Can you suggest hobbies that are easy to start?",
  "What are some tips for improving sleep quality?",
  "How can I stay connected with friends and family?",
  "What are some fun activities with grandchildren?",
  "How do I create a budget on a fixed income?",
  "What are the benefits of meditation?",
  "Can you recommend some good books for seniors?",
  "What should I know about healthcare directives?",
  "How can I protect myself from scams?",
  "What are some easy ways to improve my diet?",
  "How can I find volunteer opportunities?",
  "What are some low-impact sports I can try?",
  "How do I access online medical resources?",
  "What are some tips for home safety?",
  "How can I maintain my independence as I age?",
  "What are the signs of depression in seniors?",
  "Can you give me local support groups?",
  "What are some ways to stay mentally sharp?",
  "How can I use social media safely?",
  "What are the benefits of joining a club?",
  "How do I navigate Medicare options?",
  "What are some healthy snacks to make at home?",
  "How can I reduce stress in my daily life?",
  "What are some good exercises for balance?",
  "How do I file my taxes as a senior?",
  "What are the best ways to manage chronic pain?",
  "How can I find a reliable handyman?",
  "What should I consider when downsizing?",
  "Tips for organizing important documents?",
  "How can I stay informed about local news?",
  "What are some good walking routes nearby?",
  "How can I improve my posture?",
  "Tips for using smartphones effectively?",
  "How can I find senior discounts?",
  "What are creative ways to stay engaged?",
  "How do I plan for long-term care?",
  "What are some fun crafts to do at home?",
  "How can I learn new technology skills?",
  "What are some tips for staying hydrated?",
  "How can I make new friends in my community?",
  "How can I make my home more accessible?",
]

const BUBBLE_COLORS = [
  "bg-white/25",
  "bg-sky-300/30",
  "bg-cyan-300/30",
  "bg-blue-300/30",
  "bg-teal-300/30",
  "bg-indigo-300/25",
]

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

// Tile button for home screen grid
export function QuickQuestionsTile({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-3xl p-3 shadow-xl shadow-cyan-500/30 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden"
    >
      <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <MessageCircle className="w-9 h-9 mb-1 relative z-10" strokeWidth={2} />
      <h3 className="text-lg font-black relative z-10">50 Questions?</h3>
    </button>
  )
}

// Full tab view with floating rotating bubbles - no scroll, fixed viewport
export function QuickQuestionsTab({ onQuestionSelect }: QuickQuestionsProps) {
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null)
  const [visibleSet, setVisibleSet] = useState(0)
  const BUBBLES_PER_VIEW = 6

  // Rotate questions every 7.5 seconds (50% slower than 5s)
  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleSet((prev) => {
        const maxSets = Math.ceil(QUESTIONS.length / BUBBLES_PER_VIEW)
        return (prev + 1) % maxSets
      })
    }, 7500)
    return () => clearInterval(interval)
  }, [])

  const startIndex = visibleSet * BUBBLES_PER_VIEW
  const currentQuestions = QUESTIONS.slice(startIndex, startIndex + BUBBLES_PER_VIEW)

  // 3 rows x 2 columns, well-spaced to avoid overlap and clear of dots
  const positions = [
    { x: 2, y: 0 },
    { x: 50, y: 0 },
    { x: 6, y: 30 },
    { x: 52, y: 30 },
    { x: 2, y: 60 },
    { x: 50, y: 60 },
  ]

  const handleBubbleTap = useCallback(
    (index: number, question: string) => {
      setPoppedIndex(index)
      setTimeout(() => {
        setPoppedIndex(null)
        onQuestionSelect(question)
      }, 400)
    },
    [onQuestionSelect],
  )

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header - fixed height */}
      <div className="flex-shrink-0 flex items-center gap-3 px-5 pt-4 pb-3">
        <MessageCircle className="w-8 h-8 text-white" />
        <div>
          <h2 className="text-2xl font-black text-white">Quick Questions</h2>
          <p className="text-base text-white/70 font-medium">Tap a bubble to ask</p>
        </div>
      </div>

      {/* Bubble area - fills remaining space minus dots, NO scroll */}
      <style jsx>{`
        @keyframes bubbleFloat {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-6px) translateX(3px); }
          50% { transform: translateY(-2px) translateX(-4px); }
          75% { transform: translateY(-8px) translateX(2px); }
        }
        @keyframes bubblePop {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.5; }
          100% { transform: scale(0); opacity: 0; }
        }
        @keyframes bubbleIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .bubble-float {
          animation: bubbleFloat var(--duration) ease-in-out infinite;
          animation-delay: var(--delay);
        }
        .bubble-pop {
          animation: bubblePop 0.4s ease-out forwards !important;
        }
        .bubble-enter {
          animation: bubbleIn 0.5s ease-out forwards;
          animation-delay: var(--enter-delay);
          opacity: 0;
        }
      `}</style>

      <div className="flex-1 relative overflow-hidden px-4 pb-2">
        {currentQuestions.map((question, index) => {
          const pos = positions[index]
          if (!pos) return null
          const globalIndex = startIndex + index
          const colorIndex = globalIndex % BUBBLE_COLORS.length
          const duration = 4 + seededRandom(globalIndex * 5) * 3
          const delay = seededRandom(globalIndex * 3) * 2

          return (
            <button
              key={`${visibleSet}-${index}`}
              onClick={() => handleBubbleTap(index, question)}
              className={`bubble-float bubble-enter absolute ${BUBBLE_COLORS[colorIndex]} backdrop-blur-sm text-white text-lg leading-snug font-semibold px-4 py-3 rounded-2xl border border-white/30 shadow-lg touch-manipulation active:scale-90 w-[44%] text-center ${
                poppedIndex === index ? "bubble-pop" : ""
              }`}
              style={
                {
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  maxHeight: "27%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "--delay": `${delay}s`,
                  "--duration": `${duration}s`,
                  "--enter-delay": `${index * 0.08}s`,
                } as React.CSSProperties
              }
            >
              {question}
            </button>
          )
        })}
      </div>

      {/* Page dots - separate section, never overlapped */}
      <div className="flex-shrink-0 flex items-center justify-center gap-2.5 py-3">
        {Array.from({ length: Math.ceil(QUESTIONS.length / BUBBLES_PER_VIEW) }).map((_, i) => (
          <button
            key={i}
            onClick={() => setVisibleSet(i)}
            className={`w-3 h-3 rounded-full transition-all touch-manipulation ${
              i === visibleSet ? "bg-white scale-125" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Legacy export for backward compat
export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  return <QuickQuestionsTile onOpen={() => {}} />
}
