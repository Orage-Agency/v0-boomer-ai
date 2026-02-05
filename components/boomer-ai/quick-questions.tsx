"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"

interface QuickQuestionsProps {
  onQuestionSelect: (question: string) => void
}

const QUESTIONS = [
  "Easy recipes?",
  "Stay active?",
  "Joint exercises?",
  "Local events?",
  "Safe browsing?",
  "Manage meds?",
  "Memory games?",
  "Video calls?",
  "Health signs?",
  "New hobbies?",
  "Better sleep?",
  "Stay connected?",
  "Fun with kids?",
  "Budget help?",
  "Meditation?",
  "Good books?",
  "Healthcare docs?",
  "Avoid scams?",
  "Healthy diet?",
  "Volunteer?",
  "Low-impact sports?",
  "Medical info?",
  "Home safety?",
  "Stay independent?",
  "Depression signs?",
  "Support groups?",
  "Stay sharp?",
  "Social media?",
  "Join a club?",
  "Medicare help?",
]

// Generate random positions and animations for bubbles
const generateBubbleStyle = (index: number) => {
  const left = 10 + (index * 23) % 80 // Distribute across width
  const animationDelay = (index * 0.3) % 3
  const duration = 3 + (index % 3)
  
  return {
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${duration}s`,
  }
}

export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  return (
    <div className="relative bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-3xl p-3 shadow-xl shadow-cyan-500/30 flex flex-col border border-white/20 overflow-hidden h-full">
      {/* Background decoration */}
      <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-2 relative z-10">
        <MessageCircle className="w-5 h-5" strokeWidth={2} />
        <h3 className="text-sm font-black">Quick Questions</h3>
      </div>

      {/* Floating bubbles container */}
      <div className="flex-1 relative overflow-hidden">
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0) scale(1);
            }
            33% {
              transform: translateY(-8px) translateX(4px) scale(1.05);
            }
            66% {
              transform: translateY(-4px) translateX(-4px) scale(0.95);
            }
          }
          
          .bubble {
            animation: float 4s ease-in-out infinite;
          }
          
          .bubble:hover {
            animation-play-state: paused;
            transform: scale(1.1) !important;
          }
        `}</style>
        
        {QUESTIONS.map((question, index) => {
          const style = generateBubbleStyle(index)
          return (
            <button
              key={index}
              onClick={() => onQuestionSelect(question)}
              className="bubble absolute bg-white/20 backdrop-blur-sm text-white text-[10px] font-semibold px-3 py-1.5 rounded-full border border-white/30 shadow-lg hover:bg-white/30 hover:shadow-xl transition-all active:scale-90 touch-manipulation whitespace-nowrap"
              style={{
                ...style,
                top: `${10 + (index * 12) % 70}%`,
              }}
            >
              {question}
            </button>
          )
        })}
      </div>

      {/* Tap instruction */}
      <p className="text-[10px] text-white/80 font-medium text-center mt-1 relative z-10">
        Tap any bubble
      </p>
    </div>
  )
}
