"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"

interface AvatarSelectionProps {
  onSelect: (persona: string, userTitle: string, avatarSrc: string, userName: string) => void
}

const AVATARS = [
  {
    name: "Angela",
    userTitle: "Ms. Amis",
    image: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68cc6833d74f6bc1c662a144.jpeg",
  },
  {
    name: "Dave",
    userTitle: "Dave",
    image: "https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/68cc69bd09fa3e4671b9618e.jpeg",
  },
]

export function AvatarSelection({ onSelect }: AvatarSelectionProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [userName, setUserName] = useState("")

  const handleContinue = () => {
    if (!selected || !userName.trim()) return
    const avatar = AVATARS.find((a) => a.name === selected)
    if (avatar) {
      onSelect(avatar.name, avatar.userTitle, avatar.image, userName.trim())
    }
  }

  return (
    <section className="flex flex-col items-center justify-center text-center p-4 h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <img src="/boomer-ai-logo.png" alt="Boomer AI" className="h-48 w-auto object-contain mx-auto mb-4" />

        <div className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
          <p className="text-xl font-bold text-blue-900 leading-tight">Come On In, the AI Waters Are Just Fine! 🌊</p>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">Choose Your Friendly Guide</h2>
        <p className="text-base text-slate-600 mb-4">Pick a companion for your AI adventure!</p>

        <div className="mb-4">
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="text-lg py-6 text-center font-medium"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.name}
              onClick={() => setSelected(avatar.name)}
              className={`group p-2 text-center rounded-2xl bg-white border-2 transition-all duration-200 ${
                selected === avatar.name
                  ? avatar.name === "Angela"
                    ? "border-pink-500 shadow-lg scale-105"
                    : "border-blue-500 shadow-lg scale-105"
                  : "border-slate-200 hover:border-blue-500 hover:shadow-lg hover:scale-105"
              }`}
            >
              <img
                src={avatar.image || "/placeholder.svg"}
                alt={`${avatar.name} avatar`}
                className="w-20 h-20 object-cover rounded-full mx-auto shadow-md group-hover:shadow-xl transition-shadow"
              />
              <p className="mt-2 font-bold text-base text-slate-900">{avatar.name}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || !userName.trim()}
          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
        >
          Let's Get Started! 🚀
        </button>

        <p className="mt-3 text-sm text-slate-500">You can change this anytime.</p>
      </div>
    </section>
  )
}
