"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { PROFILE_BACKGROUNDS } from "@boomer-ai/shared"

const AVATARS = [
  { name: "Otter", image: "/avatars/otter.webp" },
  { name: "Giraffe", image: "/avatars/giraffe.webp" },
  { name: "Eagle", image: "/avatars/eagle.webp" },
  { name: "Elephant", image: "/avatars/elephant.webp" },
  { name: "Dog", image: "/avatars/dog.webp" },
  { name: "Wolf", image: "/avatars/wolf.webp" },
] as const

const ASSISTANTS = [
  { name: "Assistant woman", image: "/assistants/assistant_woman.png" },
  { name: "Assistant man", image: "/assistants/assistant_man.png" },
] as const

export type ProfileAppearance = {
  persona: string
  userTitle: string
  avatarSrc: string
  assistantSrc: string
  avatarBackground: string
  assistantBackground: string
  userName: string
}

interface AvatarSelectionProps {
  onSelect: (appearance: ProfileAppearance) => void
}

export function AvatarSelection({ onSelect }: AvatarSelectionProps) {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [selectedAssistant, setSelectedAssistant] = useState<string>(ASSISTANTS[0].image)
  const [avatarBackground, setAvatarBackground] = useState<string>("peach")
  const [assistantBackground, setAssistantBackground] = useState<string>("sky")
  const [userName, setUserName] = useState("")

  const handleContinue = () => {
    const avatar = AVATARS.find((item) => item.name === selectedAvatar)
    if (!avatar || !userName.trim()) return
    onSelect({
      persona: avatar.name,
      userTitle: avatar.name,
      avatarSrc: avatar.image,
      assistantSrc: selectedAssistant,
      avatarBackground,
      assistantBackground,
      userName: userName.trim(),
    })
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-5 py-7 text-left">
      <div className="mx-auto max-w-xl">
        <h2 className="text-2xl font-bold text-slate-900">Personalize your profile</h2>
        <p className="mt-2 text-base leading-6 text-slate-600">Choose a picture for your profile and one for the assistant.</p>

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
          <legend className="text-lg font-semibold text-slate-900">Your avatar</legend>
          <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {AVATARS.map((avatar) => {
              const active = selectedAvatar === avatar.name
              return (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.name)}
                  aria-pressed={active}
                  className={`min-h-28 rounded-xl border-2 p-2 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${active ? "border-slate-900 bg-slate-50" : "border-slate-200 hover:border-slate-400"}`}
                >
                  <span className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full" style={{ background: backgroundCss(avatarBackground) }}>
                    <img src={avatar.image} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="mt-2 block text-sm font-semibold text-slate-900">{avatar.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <BackgroundPicker label="Avatar background" value={avatarBackground} onChange={setAvatarBackground} />

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
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full" style={{ background: backgroundCss(assistantBackground) }}>
                    <img src={assistant.image} alt="" className="h-full w-full object-cover" />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{assistant.name}</span>
                </button>
              )
            })}
          </div>
        </fieldset>

        <BackgroundPicker label="Assistant background" value={assistantBackground} onChange={setAssistantBackground} />

        <button
          type="button"
          onClick={handleContinue}
          disabled={!selectedAvatar || !userName.trim()}
          className="mt-8 min-h-12 w-full rounded-xl bg-slate-900 px-6 py-3 text-base font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Continue
        </button>
      </div>
    </section>
  )
}

function backgroundCss(id: string) {
  return PROFILE_BACKGROUNDS.find((background) => background.id === id)?.css ?? PROFILE_BACKGROUNDS[0].css
}

function BackgroundPicker({ label, value, onChange }: { label: string; value: string; onChange: (id: string) => void }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-sm font-semibold text-slate-800">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {PROFILE_BACKGROUNDS.map((background) => {
          const active = value === background.id
          return (
            <button
              key={background.id}
              type="button"
              onClick={() => onChange(background.id)}
              aria-label={`${label}: ${background.label}`}
              aria-pressed={active}
              className={`flex min-h-11 items-center gap-2 rounded-lg border px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 ${active ? "border-slate-900" : "border-slate-200 hover:border-slate-400"}`}
            >
              <span aria-hidden="true" className="h-7 w-7 rounded-md border border-black/10" style={{ background: background.css }} />
              <span className="text-xs font-medium text-slate-800">{background.label}</span>
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
