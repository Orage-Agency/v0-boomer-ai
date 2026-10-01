"use client"

import { useState } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"

const ASSISTANTS = [
  { name: "Assistant woman", image: "/assistants/assistant_woman.png" },
  { name: "Assistant man", image: "/assistants/assistant_man.png" },
] as const

export type ProfileAppearance = {
  persona: null
  userTitle: null
  avatarSrc: null
  assistantSrc: string
  avatarBackground: string
  assistantBackground: string
  userName: string
}

interface AvatarSelectionProps {
  onSelect: (appearance: ProfileAppearance) => void
}

export function AvatarSelection({ onSelect }: AvatarSelectionProps) {
  const [selectedAssistant, setSelectedAssistant] = useState<string>(ASSISTANTS[0].image)
  const [userName, setUserName] = useState("")

  const handleContinue = () => {
    if (!userName.trim()) return
    onSelect({
      persona: null,
      userTitle: null,
      avatarSrc: null,
      assistantSrc: selectedAssistant,
      avatarBackground: "white",
      assistantBackground: "white",
      userName: userName.trim(),
    })
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-7 text-left">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold text-slate-900">Personalize your profile</h2>
        <p className="mt-2 text-base leading-6 text-slate-600">Choose your name and an assistant picture.</p>

        <label className="mt-6 block text-base font-semibold text-slate-900" htmlFor="profile-name">Your name</label>
        <Input
          id="profile-name"
          type="text"
          autoComplete="given-name"
          placeholder="Enter your name"
          value={userName}
          onChange={(event) => setUserName(event.target.value)}
          className="mt-2 min-h-12 text-base"
        />

        <fieldset className="mt-7">
          <legend className="text-lg font-semibold text-slate-900">Assistant picture</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {ASSISTANTS.map((assistant) => {
              const active = selectedAssistant === assistant.image
              return (
                <button
                  key={assistant.image}
                  type="button"
                  onClick={() => setSelectedAssistant(assistant.image)}
                  aria-pressed={active}
                  className={`flex min-h-24 items-center gap-3 rounded-xl border-2 p-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                    <Image src={assistant.image} alt="" width={64} height={64} className="h-full w-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{assistant.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!userName.trim()}
          className="mt-8 min-h-12 w-full rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Continue
        </button>
      </div>
    </section>
  )
}
