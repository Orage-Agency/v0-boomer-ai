interface StepperProps {
  currentStep: number
}

const STEPS = [
  { number: 1, label: "Choose" },
  { number: 2, label: "Age" },
  { number: 3, label: "Quiz" },
  { number: 4, label: "Level" },
]

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="px-6 pt-6 pb-4 bg-white/90 backdrop-blur-sm border-b border-slate-200/50">
      <ol className="flex items-center justify-center gap-6">
        {STEPS.map((step) => (
          <li key={step.number} className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full transition-colors ${
                step.number <= currentStep ? "bg-blue-600" : "bg-slate-300"
              }`}
            />
            <span
              className={`font-medium transition-colors ${
                step.number <= currentStep ? "text-slate-900" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}
