"use client"

import Image from "next/image"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4 py-8">
      {/* Back to App Link */}
      <div className="w-full max-w-lg mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors text-lg"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </Link>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 md:p-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src="/boomer-ai-logo.png" alt="Boomer AI Logo" width={160} height={50} className="h-12 w-auto" />
        </div>

        {/* Headline */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-4">We are here to help.</h1>

        {/* Body Text */}
        <p className="text-lg text-gray-600 text-center mb-8 leading-relaxed">
          If you have any questions, issues, or feedback, please contact our team directly. We are dedicated to
          providing you with the best experience.
        </p>

        {/* Primary Contact Button */}
        <a
          href="mailto:team@orage.agency"
          className="flex items-center justify-center gap-3 w-full py-4 bg-[#0f172a] text-white text-lg font-semibold rounded-full hover:bg-[#1e293b] transition-colors mb-8"
        >
          <Mail className="w-5 h-5" />
          Contact Support
        </a>

        {/* Account & Data Section */}
        <div className="border-t border-gray-200 pt-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Account & Data</h2>
          <p className="text-base text-gray-600 leading-relaxed">
            To request account deletion or data removal, please email us at the address above with the subject line
            "Delete Account".
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6">
          <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-700 underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-base text-gray-500 hover:text-gray-700 underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  )
}
