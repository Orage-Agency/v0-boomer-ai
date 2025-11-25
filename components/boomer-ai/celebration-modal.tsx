"use client"

import { useEffect, useState, useCallback } from "react"
import { Star, X } from "lucide-react"

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
}

export function CelebrationModal({ isOpen, onClose, message, starsEarned }: CelebrationModalProps) {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const generateConfetti = useCallback(() => {
    const colors = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"]
    const pieces: ConfettiPiece[] = []
    for (let i = 0; i < 50; i++) {
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
      const timer = setTimeout(() => {
        onClose()
      }, 3500)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, generateConfetti, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

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
        className={`relative z-10 bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl transform transition-all duration-500 ${
          isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 -translate-y-4"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>

        <div className="text-center">
          {/* Animated star burst */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-yellow-400/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Star className="w-16 h-16 text-yellow-500 fill-yellow-500 animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2 animate-bounce-subtle">{message}</h2>

          <div className="flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl mt-4">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-xl font-bold text-amber-700">+{starsEarned} Stars!</span>
          </div>

          <p className="text-slate-500 mt-4 text-sm">Keep up the great work!</p>
        </div>
      </div>
    </div>
  )
}
