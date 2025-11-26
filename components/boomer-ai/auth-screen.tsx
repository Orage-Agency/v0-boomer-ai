"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react"
import { createUser, loginUser } from "@/lib/auth-service"

interface AuthScreenProps {
  onLogin: (email: string, name: string) => void
}

export function AuthScreen({ onLogin }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email || !password) {
      setError("Please fill in all fields")
      triggerShake()
      return
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address")
      triggerShake()
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      triggerShake()
      return
    }

    if (isSignUp && !name) {
      setError("Please enter your name")
      triggerShake()
      return
    }

    setIsLoading(true)

    try {
      const result = isSignUp ? await createUser(email, password, name) : await loginUser(email, password)

      if (result.success && result.user) {
        onLogin(result.user.email, result.user.name)
      } else {
        setError(result.error || "Authentication failed")
        triggerShake()
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
      triggerShake()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-sm bg-white rounded-3xl p-8 shadow-2xl ${shake ? "animate-shake" : ""}`}>
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/69270a5b63b30fdd4c7b60de.png"
            alt="Boomer AI"
            className="h-12 w-auto"
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name field (sign up only) */}
          {isSignUp && (
            <div className="mb-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full h-14 px-4 bg-gray-50 border-0 rounded-xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] transition-all"
              />
            </div>
          )}

          {/* Email field */}
          <div className="mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-14 px-4 bg-gray-50 border-0 rounded-xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] transition-all"
            />
          </div>

          {/* Password field */}
          <div className="mb-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 px-4 pr-12 bg-gray-50 border-0 rounded-xl text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0f172a] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember me toggle */}
          <div className="mb-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-10 h-6 rounded-full transition-colors ${rememberMe ? "bg-[#0f172a]" : "bg-gray-200"}`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  rememberMe ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm text-slate-600">Keep me logged in</span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 bg-[#0f172a] text-white font-bold text-lg rounded-full shadow-lg hover:bg-[#1e293b] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle sign up / sign in */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            className="text-sm text-slate-600 hover:text-[#0f172a] transition-colors"
          >
            {isSignUp ? (
              <>
                Already have an account? <span className="font-bold">Sign In</span>
              </>
            ) : (
              <>
                Don't have an account? <span className="font-bold">Sign up</span>
              </>
            )}
          </button>
        </div>

        {/* Terms & Privacy */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our{" "}
          <a href="#terms" className="underline hover:text-slate-600">
            Terms
          </a>{" "}
          &{" "}
          <a href="#privacy" className="underline hover:text-slate-600">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Shake animation style */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
