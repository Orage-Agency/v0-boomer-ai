"use client"

import {
  Sparkles,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { useState } from "react"
import { TIP_CATEGORIES } from "@boomer-ai/shared"

interface TipsTabProps {
  onTryPrompt: (prompt: string) => void
}


export function TipsTab({ onTryPrompt }: TipsTabProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["cyber-security"])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId],
    )
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">AI Tips & Guides</h2>
          <p className="text-base text-slate-600">Choose a tip to try it in chat.</p>
        </div>
      </div>

      <div className="flex-grow px-4 py-3 overflow-y-auto pb-10">
        <div className="space-y-4">
          {TIP_CATEGORIES.map((category) => {
            const isExpanded = expandedSections.includes(category.id)
            return (
              <div key={category.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleSection(category.id)}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 transition-colors touch-manipulation active:scale-[0.99]"
                >
                  <div className="flex items-center gap-3">

                    <h3 className="font-bold text-slate-900 text-base">{category.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      {category.tips.length} tips
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-600" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 bg-white space-y-2">
                    {category.tips.map((tip) => (
                        <button
                          key={tip.title}
                          onClick={() => onTryPrompt(tip.prompt)}
                          className="w-full flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition-all text-left group touch-manipulation active:scale-[0.98]"
                        >
                          <span className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-slate-100 text-lg" aria-hidden="true">
                            {tip.emoji}
                          </span>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{tip.title}</h4>
                            <p className="text-sm text-slate-600">{tip.description}</p>
                          </div>
                        </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <button
            onClick={() =>
              onTryPrompt(
                "Generate 5 more helpful AI tips for seniors in the category of [choose: Cyber Security, Email Tips, Voice Commands, Communication, Daily Living, Learning, or Finance]. Make them practical and easy to understand.",
              )
            }
            className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl touch-manipulation active:scale-[0.98]"
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">Ask AI to Generate More Tips</span>
          </button>
        </div>
      </div>
    </div>
  )
}
