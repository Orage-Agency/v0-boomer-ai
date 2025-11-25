"use client"

import { useEffect, useState, useCallback } from "react"
import { Star, Sparkles } from "lucide-react"

interface ConfettiPiece {
  id: number
  left: number
  delay: number
  duration: number
  color: string
}

interface CelebrationModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  starsEarned: number
  secretTip?: string
}

const SECRET_AI_TIPS = [
  "Did you know? AI can write poems, songs, and even short stories for you!",
  "Pro tip: Ask AI to explain things 'like I'm 5' for simpler answers!",
  "Secret: AI can help you plan your entire week's meals in seconds!",
  "Fun fact: You can ask AI to roleplay as a famous historical figure!",
  "Hidden gem: AI can translate your text into any language instantly!",
  "Power move: Ask AI to proofread and improve your emails!",
  "Magic trick: AI can create a personalized workout plan just for you!",
  "Cool feature: AI can help you brainstorm gift ideas for anyone!",
  "Insider tip: You can ask AI to summarize long articles for you!",
  "Game changer: AI can help you write heartfelt birthday messages!",
]

export function CelebrationModal({ isOpen, onClose, message, starsEarned, secretTip }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [currentTip] = useState(() => secretTip || SECRET_AI_TIPS[Math.floor(Math.random() * SECRET_AI_TIPS.length)])

  const generateConfetti = useCallback(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
      })
    }
    setConfetti(pieces)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      generateConfetti()
    } else {
      setIsVisible(false)
    }
  }, [isOpen, generateConfetti])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

      {/* Confetti */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute w-3 h-3 rounded-sm animate-confetti-fall"
            style={{
              left: `${piece.left}%`,
              backgroundColor: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
            }}
          />
        ))}
      </div>

      {/* Modal */}
      <div
        className={`relative z-10 bg-gradient-to-b from-white to-amber-50 rounded-3xl p-6 mx-4 max-w-sm w-full shadow-2xl transform transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 -translate-y-4"
        }`}
      >
        <div className="text-center">
          {/* Animated star burst */}
          <div className="relative w-28 h-28 mx-auto mb-4">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-yellow-400/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-20 h-20 text-yellow-500 fill-yellow-500 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">{message}</h2>

          <div className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-2xl mt-3 shadow-lg">
            <Star className="w-7 h-7 text-white fill-white" />
            <span className="text-2xl font-black text-white">+{starsEarned} Stars!</span>
          </div>

          <div className="mt-5 p-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl border-2 border-purple-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-700 uppercase tracking-wide">Secret AI Tip</span>
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-sm font-medium text-purple-900 leading-relaxed">{currentTip}</p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Collect Reward!
          </button>
        </div>
      </div>
    </div>
  )
}
