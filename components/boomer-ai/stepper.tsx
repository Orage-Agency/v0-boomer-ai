interface StepperProps {
  currentStep: number
}

const STEPS = [
  { number: 1, label: "Guide" },
  { number: 2, label: "Age" },
  { number: 3, label: "Level" },
]

export function Stepper({ currentStep }: StepperProps) {
  return (
    <div className="min-w-0 flex-1">
      <p className="mb-2 text-sm font-medium text-slate-600" aria-live="polite">
        Step {currentStep} of {STEPS.length}
      </p>
      <ol
        className="flex items-center gap-2"
        role="progressbar"
        aria-label="Onboarding progress"
        aria-valuemin={1}
        aria-valuemax={STEPS.length}
        aria-valuenow={currentStep}
      >
        {STEPS.map((step) => (
          <li key={step.number} className="min-w-0 flex-1">
            <div
              className={`h-1.5 rounded-full transition-colors ${
                step.number <= currentStep ? "bg-slate-800" : "bg-slate-200"
              }`}
            />
            <span className="sr-only">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
