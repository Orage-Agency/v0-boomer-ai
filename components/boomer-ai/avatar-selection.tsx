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
    <section className="flex flex-col items-center justify-center text-center p-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose your companion</h2>
        <p className="text-base text-slate-600 mb-6">Pick a friendly guide for your journey.</p>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="text-lg py-6 text-center"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.name}
              onClick={() => setSelected(avatar.name)}
              className={`group p-3 text-center rounded-2xl bg-white border-2 transition-all duration-200 ${
                selected === avatar.name
                  ? avatar.name === "Angela"
                    ? "border-pink-500 shadow-lg"
                    : "border-blue-500 shadow-lg"
                  : "border-slate-200 hover:border-blue-500 hover:shadow-lg"
              }`}
            >
              <img
                src={avatar.image || "/placeholder.svg"}
                alt={`${avatar.name} avatar`}
                className="w-24 h-24 object-cover rounded-full mx-auto shadow-md group-hover:shadow-xl transition-shadow"
              />
              <p className="mt-3 font-bold text-base text-slate-900">{avatar.name}</p>
            </button>
          ))}
        </div>

        <button
          onClick={handleContinue}
          disabled={!selected || !userName.trim()}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-lg py-3 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
        >
          Continue
        </button>

        <p className="mt-6 text-sm text-slate-500">You can change this later.</p>
      </div>
    </section>
  )
}
