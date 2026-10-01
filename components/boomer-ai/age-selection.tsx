"use client"

interface AgeSelectionProps {
  onSelect: (age: string) => void
  onSkip: () => void
}

const AGE_RANGES = ["50-59", "60-69", "70-79", "80+"]

export function AgeSelection({ onSelect, onSkip }: AgeSelectionProps) {
  return (
    <section className="flex flex-col items-center justify-center text-center p-8 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-xs">
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Would you like to share your age range?</h2>
        <p className="text-lg text-slate-600 mb-8">This is optional. You can change it later.</p>

        <div className="space-y-3">
          {AGE_RANGES.map((age) => (
            <button
              key={age}
              onClick={() => onSelect(age)}
              className="w-full min-h-14 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 hover:border-slate-500 font-semibold text-lg py-4 px-6 rounded-xl transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              aria-label={`Age ${age}`}
            >
              {age}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="mt-5 min-h-12 w-full rounded-lg px-4 py-3 text-base font-semibold text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
        >
          Prefer not to say
        </button>
      </div>
    </section>
  )
}
