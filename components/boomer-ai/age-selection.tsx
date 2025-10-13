"use client"

interface AgeSelectionProps {
  onSelect: (age: string) => void
}

const AGE_RANGES = ["50-59", "60-69", "70-79", "80+"]

export function AgeSelection({ onSelect }: AgeSelectionProps) {
  return (
    <section className="flex flex-col items-center justify-center text-center p-8 min-h-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="w-full max-w-xs">
        <h2 className="text-4xl font-bold text-slate-900 mb-3">Your age range?</h2>
        <p className="text-lg text-slate-600 mb-10">This helps tailor tips and font sizes.</p>

        <div className="space-y-3">
          {AGE_RANGES.map((age) => (
            <button
              key={age}
              onClick={() => onSelect(age)}
              className="w-full bg-white hover:bg-blue-50 text-slate-900 border-2 border-slate-200 hover:border-blue-500 font-bold text-lg py-5 px-6 rounded-xl transition-all duration-200 hover:shadow-md"
              aria-label={`Age ${age}`}
            >
              {age}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
