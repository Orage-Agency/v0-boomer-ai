"use client"

import React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { MessageCircle, X } from "lucide-react"

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void
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

// Bubble colors for variety
const BUBBLE_COLORS = [
  "bg-white/25",
  "bg-sky-300/30",
  "bg-cyan-300/30",
  "bg-blue-300/30",
  "bg-teal-300/30",
  "bg-indigo-300/25",
]

// Seeded random for consistent positions
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [poppedIndex, setPoppedIndex] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate bubble positions - 2 columns for mobile readability
  const bubbles = QUESTIONS.map((q, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = 2 + col * 48 + seededRandom(i * 7) * 6
    const y = row * 76 // Fixed pixel spacing per row for consistent layout
    const delay = seededRandom(i * 3) * 4
    const duration = 3.5 + seededRandom(i * 5) * 3
    const colorIndex = i % BUBBLE_COLORS.length

    return { question: q, x, y, delay, duration, colorIndex }
  })

  const handleBubbleTap = useCallback(
    (index: number, question: string) => {
      setPoppedIndex(index)
      // Small delay for pop animation then navigate
      setTimeout(() => {
        setIsOpen(false)
        setPoppedIndex(null)
        onQuestionSelect(question)
      }, 400)
    },
    [onQuestionSelect],
  )

  return (
    <>
      {/* Tile button on home screen */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-3xl p-3 shadow-xl shadow-cyan-500/30 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col items-center justify-center border border-white/20 relative overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <MessageCircle className="w-9 h-9 mb-1 relative z-10" strokeWidth={2} />
        <h3 className="text-lg font-black relative z-10">Ask Me</h3>
        <p className="text-sm text-white/80 font-medium relative z-10">Anything</p>
      </button>

      {/* Full screen bubble overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700" />

          {/* Decorative background circles */}
          <div className="absolute top-20 left-10 w-40 h-40 bg-cyan-400/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 right-10 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between px-5 pt-14 pb-3">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-9 h-9 text-white" />
              <div>
                <h2 className="text-2xl font-black text-white">Quick Questions</h2>
                <p className="text-sm text-white/70 font-medium">Tap a bubble to ask</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false)
                setPoppedIndex(null)
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/15 text-white active:scale-90 touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable bubble area */}
          <div
            ref={containerRef}
            className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden px-2 pb-10"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Tall container to hold all bubbles - 2 cols, 76px per row */}
            <div className="relative w-full" style={{ height: `${Math.ceil(QUESTIONS.length / 2) * 76 + 60}px` }}>
              <style jsx>{`
                @keyframes bubbleFloat {
                  0%, 100% {
                    transform: translateY(0px) translateX(0px);
                  }
                  25% {
                    transform: translateY(-6px) translateX(3px);
                  }
                  50% {
                    transform: translateY(-2px) translateX(-4px);
                  }
                  75% {
                    transform: translateY(-8px) translateX(2px);
                  }
                }
                @keyframes bubblePop {
                  0% {
                    transform: scale(1);
                    opacity: 1;
                  }
                  50% {
                    transform: scale(1.4);
                    opacity: 0.6;
                  }
                  100% {
                    transform: scale(0);
                    opacity: 0;
                  }
                }
                .bubble-float {
                  animation: bubbleFloat var(--duration) ease-in-out infinite;
                  animation-delay: var(--delay);
                }
                .bubble-pop {
                  animation: bubblePop 0.4s ease-out forwards !important;
                }
              `}</style>

              {bubbles.map((bubble, index) => (
                <button
                  key={index}
                  onClick={() => handleBubbleTap(index, bubble.question)}
                  className={`bubble-float absolute ${BUBBLE_COLORS[bubble.colorIndex]} backdrop-blur-sm text-white text-[15px] leading-snug font-semibold px-4 py-3 rounded-2xl border border-white/30 shadow-lg touch-manipulation transition-shadow hover:shadow-xl max-w-[46%] text-center ${
                    poppedIndex === index ? "bubble-pop" : ""
                  }`}
                  style={
                    {
                      left: `${bubble.x}%`,
                      top: `${bubble.y}px`,
                      "--delay": `${bubble.delay}s`,
                      "--duration": `${bubble.duration}s`,
                    } as React.CSSProperties
                  }
                >
                  {bubble.question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
