"use client"

interface AvatarSelectionProps {
  onSelect: (persona: string, userTitle: string, avatarSrc: string) => void
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
  return (
    <section className="flex flex-col items-center justify-center text-center p-8 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-sm">
        <h2 className="text-4xl font-bold text-slate-900 mb-3">Choose your companion</h2>
        <p className="text-lg text-slate-600 mb-10">Pick a friendly guide for your journey.</p>

        <div className="grid grid-cols-2 gap-6">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.name}
              onClick={() => onSelect(avatar.name, avatar.userTitle, avatar.image)}
              className="group p-4 text-center rounded-2xl bg-white border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all duration-200"
            >
              <img
                src={avatar.image || "/placeholder.svg"}
                alt={`${avatar.name} avatar`}
                className="w-32 h-32 object-cover rounded-full mx-auto shadow-md group-hover:shadow-xl transition-shadow"
              />
              <p className="mt-4 font-bold text-lg text-slate-900">{avatar.name}</p>
            </button>
          ))}
        </div>

        <p className="mt-10 text-sm text-slate-500">You can change this later.</p>
      </div>
    </section>
  )
}
