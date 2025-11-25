"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Star, Book, Tablet, Lightbulb, RotateCcw } from "lucide-react"
import { CelebrationModal } from "./celebration-modal"
import type { UserProfile } from "@/app/page"

interface PlayTabProps {
  userProfile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
}

interface Position {
  x: number
  y: number
}

interface CollectibleItem {
  position: Position
  type: "book" | "tablet" | "bulb"
  id: number
}

const GRID_SIZE = 6
const INITIAL_PLAYER: Position = { x: 2, y: 2 }

export function PlayTab({ userProfile, updateProfile }: PlayTabProps) {
  const [playerPos, setPlayerPos] = useState<Position>(INITIAL_PLAYER)
  const [items, setItems] = useState<CollectibleItem[]>([])
  const [score, setScore] = useState(0)
  const [totalStarsEarned, setTotalStarsEarned] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationMessage, setCelebrationMessage] = useState("")
  const [celebrationStars, setCelebrationStars] = useState(0)

  const spawnItem = useCallback(() => {
    const types: ("book" | "tablet" | "bulb")[] = ["book", "tablet", "bulb"]
    let newPos: Position
    let attempts = 0

    do {
      newPos = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      }
      attempts++
    } while (
      (newPos.x === playerPos.x && newPos.y === playerPos.y) ||
      items.some((item) => item.position.x === newPos.x && item.position.y === newPos.y)
    )

    if (attempts < 50) {
      const newItem: CollectibleItem = {
        position: newPos,
        type: types[Math.floor(Math.random() * types.length)],
        id: Date.now(),
      }
      setItems((prev) => [...prev, newItem])
    }
  }, [playerPos, items])

  useEffect(() => {
    if (gameStarted && items.length < 3) {
      const timer = setTimeout(spawnItem, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameStarted, items.length, spawnItem])

  useEffect(() => {
    if (!gameStarted) return

    const collected = items.find((item) => item.position.x === playerPos.x && item.position.y === playerPos.y)

    if (collected) {
      setItems((prev) => prev.filter((item) => item.id !== collected.id))
      const newScore = score + 1
      setScore(newScore)
      setTotalStarsEarned((prev) => prev + 2)

      // Update global stars
      updateProfile({ stars: userProfile.stars + 2 })

      // Check for milestone celebrations
      if (newScore % 5 === 0) {
        setCelebrationMessage("Excellent Work!")
        setCelebrationStars(5)
        setShowCelebration(true)
        updateProfile({ stars: userProfile.stars + 5 })
      }
    }
  }, [playerPos, items, gameStarted, score, updateProfile, userProfile.stars])

  const movePlayer = (direction: "up" | "down" | "left" | "right") => {
    if (!gameStarted) return

    setPlayerPos((prev) => {
      let newX = prev.x
      let newY = prev.y

      switch (direction) {
        case "up":
          newY = Math.max(0, prev.y - 1)
          break
        case "down":
          newY = Math.min(GRID_SIZE - 1, prev.y + 1)
          break
        case "left":
          newX = Math.max(0, prev.x - 1)
          break
        case "right":
          newX = Math.min(GRID_SIZE - 1, prev.x + 1)
          break
      }

      return { x: newX, y: newY }
    })
  }

  const startGame = () => {
    setGameStarted(true)
    setScore(0)
    setTotalStarsEarned(0)
    setItems([])
    setPlayerPos(INITIAL_PLAYER)
    spawnItem()
  }

  const resetGame = () => {
    setGameStarted(false)
    setScore(0)
    setItems([])
    setPlayerPos(INITIAL_PLAYER)
  }

  const getItemIcon = (type: "book" | "tablet" | "bulb") => {
    switch (type) {
      case "book":
        return <Book className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
      case "tablet":
        return <Tablet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
      case "bulb":
        return <Lightbulb className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tech Collector</h1>
          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors touch-manipulation active:scale-95"
          >
            <RotateCcw className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-between bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-3 border border-yellow-200">
          <div className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-lg font-bold text-amber-700">Stars Earned: {totalStarsEarned}</span>
          </div>
          <div className="px-3 py-1 bg-white rounded-xl shadow-sm">
            <span className="text-sm font-semibold text-slate-600">Items: {score}</span>
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2">
        {!gameStarted ? (
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-3xl flex items-center justify-center shadow-lg">
              <span className="text-5xl">🤖</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to Play?</h2>
            <p className="text-slate-600 mb-6 max-w-xs">
              Move the robot to collect tech items and earn stars! Use the arrow buttons below.
            </p>
            <button
              onClick={startGame}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all touch-manipulation active:scale-95"
            >
              Start Game
            </button>
          </div>
        ) : (
          <div
            className="grid gap-1 sm:gap-1.5 p-2 sm:p-3 bg-slate-100 rounded-2xl shadow-inner"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: "min(100%, 320px)",
              aspectRatio: "1",
            }}
          >
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
              const x = index % GRID_SIZE
              const y = Math.floor(index / GRID_SIZE)
              const isPlayer = playerPos.x === x && playerPos.y === y
              const item = items.find((i) => i.position.x === x && i.position.y === y)

              return (
                <div
                  key={index}
                  className={`rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isPlayer
                      ? "bg-gradient-to-br from-blue-400 to-purple-500 shadow-lg scale-105"
                      : item
                        ? "bg-white shadow-md"
                        : "bg-white/60"
                  }`}
                  style={{ aspectRatio: "1" }}
                >
                  {isPlayer && <span className="text-xl sm:text-2xl">🤖</span>}
                  {item && !isPlayer && getItemIcon(item.type)}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Controls */}
      {gameStarted && (
        <div className="flex-shrink-0 px-4 pb-4">
          <div className="flex flex-col items-center gap-2">
            {/* Up Button */}
            <button
              onClick={() => movePlayer("up")}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl shadow-lg flex items-center justify-center touch-manipulation active:scale-90 active:shadow-inner transition-all"
            >
              <ArrowUp className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700" strokeWidth={2.5} />
            </button>

            {/* Left, Down, Right Row */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => movePlayer("left")}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl shadow-lg flex items-center justify-center touch-manipulation active:scale-90 active:shadow-inner transition-all"
              >
                <ArrowLeft className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => movePlayer("down")}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl shadow-lg flex items-center justify-center touch-manipulation active:scale-90 active:shadow-inner transition-all"
              >
                <ArrowDown className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => movePlayer("right")}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-b from-slate-100 to-slate-200 rounded-2xl shadow-lg flex items-center justify-center touch-manipulation active:scale-90 active:shadow-inner transition-all"
              >
                <ArrowRight className="w-8 h-8 sm:w-10 sm:h-10 text-slate-700" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        message={celebrationMessage}
        starsEarned={celebrationStars}
      />
    </div>
  )
}
