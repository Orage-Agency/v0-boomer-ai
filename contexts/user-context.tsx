"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import * as db from "@/lib/db-service"

interface UserContextState {
  // Auth state
  isLoggedIn: boolean
  isLoading: boolean
  email: string | null

  // Profile
  name: string | null
  profilePhotoUrl: string | null

  // Gamification
  stars: number
  level: string
  completedLessons: string[]
  unlockedBadges: string[]
  streak: number

  // Gallery
  gallery: db.GalleryImage[]
  galleryCount: number

  // Chat history
  chatHistory: db.ChatMessage[]

  // Actions
  login: (email: string, name: string) => Promise<void>
  logout: () => void
  updateStars: (newStars: number) => Promise<void>
  saveChat: (userPrompt: string, aiResponse: string) => Promise<void>
  saveImage: (imageUrl: string, prompt: string) => Promise<void>
  deleteImage: (imageId: string) => Promise<void>
  refreshData: () => Promise<void>
  updateProfile: (updates: { name?: string; profilePhotoUrl?: string }) => Promise<void>
}

const UserContext = createContext<UserContextState | null>(null)

function calculateLevel(stars: number): string {
  if (stars >= 1400) return "Expert"
  if (stars >= 600) return "Advanced"
  if (stars >= 200) return "Intermediate"
  return "Basic"
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null)
  const [stars, setStars] = useState(0)
  const [level, setLevel] = useState("Basic")
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([])
  const [streak, setStreak] = useState(0)
  const [gallery, setGallery] = useState<db.GalleryImage[]>([])
  const [chatHistory, setChatHistory] = useState<db.ChatMessage[]>([])

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      setIsLoading(true)

      const savedSession = localStorage.getItem("boomer_session")
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession)
          if (session.email) {
            await loadUserData(session.email, session.name)
          }
        } catch (error) {
          console.error("Failed to load session:", error)
        }
      }

      setIsLoading(false)
    }

    loadSession()
  }, [])

  const loadUserData = async (userEmail: string, userName?: string) => {
    setIsLoading(true)

    try {
      // Try to load existing data
      const data = await db.getAllUserData(userEmail)

      if (data) {
        setEmail(userEmail)
        setName(data.profile.name || userName || null)
        setProfilePhotoUrl(data.profile.profilePhotoUrl)
        setStars(data.gamification.currentStars)
        setLevel(data.gamification.level)
        setCompletedLessons(data.gamification.completedLessons)
        setUnlockedBadges(data.gamification.unlockedBadges)
        setStreak(data.gamification.streak)
        setGallery(data.gallery)
        setChatHistory(data.chatHistory)
        setIsLoggedIn(true)
      } else {
        // Create new user profile
        const newProfile: db.UserProfileData = {
          email: userEmail,
          name: userName || "User",
          profilePhotoUrl: null,
        }
        await db.saveUserProfile(newProfile)
        await db.saveGamification(userEmail, {
          currentStars: 0,
          completedLessons: [],
          unlockedBadges: [],
          streak: 0,
          level: "Basic",
        })

        setEmail(userEmail)
        setName(userName || "User")
        setProfilePhotoUrl(null)
        setStars(0)
        setLevel("Basic")
        setCompletedLessons([])
        setUnlockedBadges([])
        setStreak(0)
        setGallery([])
        setChatHistory([])
        setIsLoggedIn(true)
      }
    } catch (error) {
      console.error("Failed to load user data:", error)
    }

    setIsLoading(false)
  }

  const login = useCallback(async (userEmail: string, userName: string) => {
    localStorage.setItem("boomer_session", JSON.stringify({ email: userEmail, name: userName }))
    await loadUserData(userEmail, userName)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("boomer_session")
    setIsLoggedIn(false)
    setEmail(null)
    setName(null)
    setProfilePhotoUrl(null)
    setStars(0)
    setLevel("Basic")
    setCompletedLessons([])
    setUnlockedBadges([])
    setStreak(0)
    setGallery([])
    setChatHistory([])
  }, [])

  const updateStarsAction = useCallback(
    async (newStars: number) => {
      if (!email) return

      const newLevel = calculateLevel(newStars)
      setStars(newStars)
      setLevel(newLevel)

      await db.updateStars(email, newStars, newLevel)
    },
    [email],
  )

  const saveChatAction = useCallback(
    async (userPrompt: string, aiResponse: string) => {
      if (!email) return

      await db.saveChat(email, userPrompt, aiResponse)

      // Refresh chat history
      const history = await db.getChatHistory(email)
      setChatHistory(history)
    },
    [email],
  )

  const saveImageAction = useCallback(
    async (imageUrl: string, prompt: string) => {
      if (!email) return

      await db.saveImage(email, imageUrl, prompt)

      // Refresh gallery
      const images = await db.getGallery(email)
      setGallery(images)
    },
    [email],
  )

  const deleteImageAction = useCallback(
    async (imageId: string) => {
      if (!email) return

      await db.deleteImage(email, imageId)

      // Refresh gallery
      const images = await db.getGallery(email)
      setGallery(images)
    },
    [email],
  )

  const refreshData = useCallback(async () => {
    if (!email) return

    setIsLoading(true)
    await loadUserData(email, name || undefined)
    setIsLoading(false)
  }, [email, name])

  const updateProfileAction = useCallback(
    async (updates: { name?: string; profilePhotoUrl?: string }) => {
      if (!email) return

      if (updates.name) setName(updates.name)
      if (updates.profilePhotoUrl !== undefined) setProfilePhotoUrl(updates.profilePhotoUrl)

      await db.saveUserProfile({
        email,
        name: updates.name || name || "User",
        profilePhotoUrl: updates.profilePhotoUrl ?? profilePhotoUrl,
      })
    },
    [email, name, profilePhotoUrl],
  )

  const value: UserContextState = {
    isLoggedIn,
    isLoading,
    email,
    name,
    profilePhotoUrl,
    stars,
    level,
    completedLessons,
    unlockedBadges,
    streak,
    gallery,
    galleryCount: gallery.length,
    chatHistory,
    login,
    logout,
    updateStars: updateStarsAction,
    saveChat: saveChatAction,
    saveImage: saveImageAction,
    deleteImage: deleteImageAction,
    refreshData,
    updateProfile: updateProfileAction,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
