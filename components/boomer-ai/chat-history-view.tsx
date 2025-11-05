"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, MessageSquare, Trash2, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/app/page"

interface Conversation {
  id: string
  title: string
  preview: string
  timestamp: string
  messageCount: number
}

interface ChatHistoryViewProps {
  userProfile: UserProfile
  onLoadConversation: (conversationId: string) => void
  onBack: () => void
}

export function ChatHistoryView({ userProfile, onLoadConversation, onBack }: ChatHistoryViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const deviceId = localStorage.getItem("boomer-device-id")
      if (!deviceId) {
        setLoading(false)
        return
      }

      const response = await fetch(`/api/conversations?deviceId=${deviceId}`)
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error("Failed to load conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteConversation = async (conversationId: string) => {
    if (!confirm("Are you sure you want to delete this conversation?")) return

    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId))
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    // Show relative time for recent conversations
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`

    // Show full date and time for older conversations
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-shrink-0 flex items-center gap-4 px-6 py-4 border-b border-slate-200">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Chat History</h1>
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Loading conversations...</p>
            </div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="bg-slate-100 p-6 rounded-full mb-4">
              <MessageSquare className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No conversations yet</h2>
            <p className="text-slate-600 mb-6">Start chatting to see your conversation history here!</p>
            <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white">
              Start Chatting
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => onLoadConversation(conversation.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{conversation.title}</h3>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">{conversation.preview}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(conversation.timestamp)}
                      </span>
                      <span>{conversation.messageCount} messages</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteConversation(conversation.id)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
