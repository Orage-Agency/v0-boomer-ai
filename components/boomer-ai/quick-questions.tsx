"use client"

import { useState, useEffect, useRef } from "react"
import { MessageCircle } from "lucide-react"

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
  "What are the signs of common health issues in seniors?",
  "Can you suggest hobbies that are easy to start?",
  "What are some tips for improving sleep quality?",
  "How can I stay connected with friends and family?",
  "What are some fun activities to do with grandchildren?",
  "How do I create a budget for living on a fixed income?",
  "What are the benefits of meditation or mindfulness?",
  "Can you recommend some good books for seniors?",
  "What should I know about advance healthcare directives?",
  "How can I protect myself from scams targeting seniors?",
  "What are some easy ways to improve my diet?",
  "How can I find volunteer opportunities in my area?",
  "What are some low-impact sports I can try?",
  "How do I access online medical resources?",
  "What are some tips for home safety?",
  "How can I maintain my independence as I age?",
  "What are the signs of depression in seniors?",
  "Can you give me a list of local support groups?",
  "What are some ways to stay mentally sharp?",
  "How can I use social media safely?",
  "What are the benefits of joining a club or group?",
  "How do I navigate Medicare options?",
  "What are some healthy snacks I can make at home?",
  "How can I reduce stress in my daily life?",
  "What are some good exercises for balance?",
  "How do I file my taxes as a senior?",
  "What are the best ways to manage chronic pain?",
  "How can I find a reliable handyman for home repairs?",
  "What should I consider when downsizing my home?",
  "What are some tips for organizing important documents?",
  "How can I stay informed about local news and events?",
  "What are some good walking routes in my area?",
  "How can I improve my posture?",
  "What are some tips for using smartphones effectively?",
  "How can I find senior discounts?",
  "What are some creative ways to stay engaged?",
  "How do I plan for long-term care?",
  "What are some fun crafts I can do at home?",
  "How can I learn new technology skills?",
  "What are some tips for staying hydrated?",
  "How can I make new friends in my community?",
  "What are some relaxation techniques I can try?",
]

export function QuickQuestions({ onQuestionSelect }: QuickQuestionsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll effect
    const interval = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += 1
        
        // Reset to top when reaching bottom
        if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
          scrollRef.current.scrollTop = 0
        }
      }
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const handleQuestionClick = (question: string) => {
    onQuestionSelect(question)
  }

  return (
    <button
      className="relative bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-3xl p-3 shadow-xl shadow-cyan-500/30 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] flex flex-col border border-white/20 overflow-hidden h-full"
      onClick={() => {
        // Clicking the container selects the currently visible question
        const visibleIndex = Math.floor((scrollRef.current?.scrollTop || 0) / 40)
        handleQuestionClick(QUESTIONS[visibleIndex % QUESTIONS.length])
      }}
    >
      {/* Background decoration */}
      <div className="absolute -top-8 -right-8 w-20 h-20 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-6 h-6" strokeWidth={2} />
          <h3 className="text-base font-black">Quick Questions</h3>
        </div>
      </div>

      {/* Scrolling questions container */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-hidden relative mask-gradient"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-1">
          {QUESTIONS.map((question, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation()
                handleQuestionClick(question)
              }}
              className="w-full text-left px-3 py-2 text-xs text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium leading-tight active:scale-95"
            >
              {question}
            </button>
          ))}
        </div>
        
        {/* Fade gradients */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-cyan-500 via-cyan-500/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-blue-500 via-blue-500/50 to-transparent pointer-events-none" />
      </div>

      {/* Tap instruction */}
      <p className="text-[10px] text-white/70 font-medium text-center mt-1 relative z-10">
        Tap any question
      </p>
    </button>
  )
}
