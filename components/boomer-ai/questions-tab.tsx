"use client"

import { ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { useState } from "react"

interface QuestionsTabProps {
  onAskQuestion: (question: string) => void
}

const QUESTION_CATEGORIES = [
  {
    title: "🍳 Cooking & Food",
    icon: "🍳",
    questions: [
      "What are some easy recipes for beginners?",
      "What are some healthy snacks I can make at home?",
      "What are some easy ways to improve my diet?",
    ],
  },
  {
    title: "💊 Health & Wellness",
    icon: "💊",
    questions: [
      "How can I stay active at home?",
      "What are the best exercises for joint health?",
      "How can I manage my medications effectively?",
      "What are some tips for improving sleep quality?",
      "What are the signs of common health issues in seniors?",
      "What are the best ways to manage chronic pain?",
      "What are some good exercises for balance?",
      "What are some low-impact sports I can try?",
    ],
  },
  {
    title: "🧠 Memory & Mind",
    icon: "🧠",
    questions: [
      "What are some brain games to improve memory?",
      "What are some ways to stay mentally sharp?",
      "What are the signs of depression in seniors?",
      "What are the benefits of meditation or mindfulness?",
      "How can I reduce stress in my daily life?",
    ],
  },
  {
    title: "💬 Communication & Connection",
    icon: "💬",
    questions: [
      "How do I set up video calls with family?",
      "How can I stay connected with friends and family?",
      "What are some fun activities to do with grandchildren?",
      "How can I use social media safely?",
      "How can I improve my social skills?",
      "What are the best ways to cope with loneliness?",
    ],
  },
  {
    title: "🏠 Daily Living & Safety",
    icon: "🏠",
    questions: [
      "What are some tips for home safety?",
      "How can I maintain my independence as I age?",
      "How can I find a reliable handyman for home repairs?",
      "What should I consider when downsizing my home?",
      "What are some tips for organizing important documents?",
      "How can I make my home more accessible?",
    ],
  },
  {
    title: "💻 Technology Help",
    icon: "💻",
    questions: [
      "What are some tips for safe internet browsing?",
      "How do I access online medical resources?",
      "How can I protect myself from scams targeting seniors?",
    ],
  },
  {
    title: "💰 Finance & Planning",
    icon: "💰",
    questions: [
      "How do I create a budget for living on a fixed income?",
      "What should I know about advance healthcare directives?",
      "How do I navigate Medicare options?",
      "How do I file my taxes as a senior?",
      "What are some financial planning tips for retirement?",
    ],
  },
  {
    title: "🌟 Community & Activities",
    icon: "🌟",
    questions: [
      "Can you help me find local community events?",
      "Can you suggest hobbies that are easy to start?",
      "Can you recommend some good books for seniors?",
      "How can I find volunteer opportunities in my area?",
      "Can you give me a list of local support groups?",
      "What are the benefits of joining a club or group?",
      "How can I stay informed about local news and events?",
      "What are some ways to enjoy nature?",
      "How can I get involved in advocacy for seniors?",
    ],
  },
  {
    title: "🎨 Personal & Creative",
    icon: "🎨",
    questions: [
      "What are some creative ways to document my life story?",
      "What are the benefits of lifelong learning?",
      "How can I find pet care services in my area?",
      "How can I stay safe while traveling?",
      "What should I know about elder abuse?",
    ],
  },
]

export function QuestionsTab({ onAskQuestion }: QuestionsTabProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set([0]))

  const toggleCategory = (index: number) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedCategories(newExpanded)
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Common Questions</h1>
          <p className="text-slate-600 text-lg">Click any question to ask BOOMER AI and get helpful answers</p>
        </div>

        <div className="space-y-4">
          {QUESTION_CATEGORIES.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-200">
              <button
                onClick={() => toggleCategory(categoryIndex)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-xl font-bold text-slate-900">{category.title}</h2>
                  <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    {category.questions.length} questions
                  </span>
                </div>
                {expandedCategories.has(categoryIndex) ? (
                  <ChevronUp className="w-6 h-6 text-slate-400" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                )}
              </button>

              {expandedCategories.has(categoryIndex) && (
                <div className="border-t border-slate-200 bg-slate-50">
                  <div className="p-4 space-y-2">
                    {category.questions.map((question, questionIndex) => (
                      <button
                        key={questionIndex}
                        onClick={() => onAskQuestion(question)}
                        className="w-full text-left p-4 bg-white rounded-xl hover:bg-blue-50 hover:border-blue-300 border-2 border-slate-200 transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                          <span className="text-slate-900 font-medium leading-relaxed">{question}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl border-2 border-blue-200">
          <h3 className="text-lg font-bold text-slate-900 mb-2">💡 Can't find your question?</h3>
          <p className="text-slate-700">
            No problem! Just type your question in the chat and BOOMER AI will help you find the answer. You can ask
            anything!
          </p>
        </div>
      </div>
    </div>
  )
}
