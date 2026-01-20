"use client"
import Link from "next/link"
import { Phone } from "lucide-react"

export default function WorkWithUsPage() {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="https://storage.googleapis.com/msgsndr/651kIrlKk834C2FEl66i/media/69270a5b63b30fdd4c7b60de.png"
              alt="Boomer AI"
              className="h-10 w-auto"
            />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-white/80 text-lg">
            <Link href="#why" className="hover:text-white transition-colors">
              Why
            </Link>
            <Link href="#who" className="hover:text-white transition-colors">
              Who
            </Link>
            <Link href="#download" className="hover:text-white transition-colors">
              Download
            </Link>
            <Link href="#contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Empower Adults 50+ With AI & Technology — Let's Do This Together
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
          A generation shouldn't get left behind. With guidance, clarity, and support, they can thrive — not struggle.
        </p>

        <div className="max-w-2xl mx-auto mb-10 space-y-3 text-lg md:text-xl text-white/90">
          <p className="flex items-center justify-center gap-3">
            <span className="text-2xl">•</span>
            <span>Confidence instead of confusion</span>
          </p>
          <p className="flex items-center justify-center gap-3">
            <span className="text-2xl">•</span>
            <span>Independence instead of dependence</span>
          </p>
          <p className="flex items-center justify-center gap-3">
            <span className="text-2xl">•</span>
            <span>Real skills for real life</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <a
            href="#contact"
            className="w-full sm:w-auto px-10 py-5 bg-white text-[#0f172a] font-bold text-lg rounded-full shadow-2xl hover:bg-gray-100 transition-all"
          >
            Partner With Us — Start a Conversation
          </a>
          <a
            href="https://apps.apple.com/app/boomer-ai"
            className="w-full sm:w-auto px-10 py-5 bg-white/10 text-white font-bold text-lg rounded-full border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            📱 Download for Apple
          </a>
        </div>

        <p className="text-lg md:text-xl text-white/80 italic">
          We handle the teaching. You offer the opportunity. Together, we change lives.
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        <section id="why" className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            They Don't Need to Be Tech-Natives. They Just Need a Bridge.
          </h2>

          <div className="space-y-4 text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            <p>
              AI and technology have become the gateway to communication, healthcare, scheduling, independence, and
              daily life.
            </p>
            <p>If the world is going to keep evolving… so must their access to it.</p>
          </div>

          <blockquote className="border-l-4 border-[#0f172a] pl-6 py-4 bg-gray-50 rounded-r-lg">
            <p className="text-xl md:text-2xl font-semibold text-gray-900 italic">
              "This is dignity. This is independence. This matters."
            </p>
          </blockquote>
        </section>

        <section id="who" className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Who We Serve</h2>
          <ul className="space-y-4 text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Adults 50+ learning at their pace, not Silicon Valley's</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>People entering a transitional season</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Seniors wanting stability and confidence</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Anyone overwhelmed by rapid digital change</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Communities wanting to stay included, not left behind</span>
            </li>
          </ul>

          <p className="text-xl md:text-2xl font-semibold text-gray-900 border-t border-gray-200 pt-6">
            Your members. Your residents. Your students. Your community. We're here to help them.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What We Teach</h2>
          <ul className="space-y-4 text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            <li className="flex items-start gap-3">
              <span className="text-2xl">→</span>
              <span>
                <strong>Email, texting, clarity</strong> = Better communication
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">→</span>
              <span>
                <strong>Reminders, appointments</strong> = Daily confidence
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">→</span>
              <span>
                <strong>Healthcare navigation</strong> = Peace of mind
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">→</span>
              <span>
                <strong>Scam prevention</strong> = Safety
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">→</span>
              <span>
                <strong>Hobbies to income</strong> = Purpose and empowerment
              </span>
            </li>
          </ul>

          <p className="text-xl md:text-2xl font-semibold text-gray-900 border-t border-gray-200 pt-6">
            This isn't tech training. It's life training — powered by AI.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">What You Gain When You Work With Us</h2>
          <ul className="space-y-4 text-lg md:text-xl text-gray-700 leading-relaxed mb-8">
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A ready-to-run program with no extra staff required</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A meaningful benefit for members, residents, or students</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>Modern credibility for your organization</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A supportive learning culture instead of overwhelm</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">•</span>
              <span>A safe, judgment-free path for older adults to grow</span>
            </li>
          </ul>

          <p className="text-xl md:text-2xl font-semibold text-gray-900 border-t border-gray-200 pt-6 mb-8">
            There is no one like us. We are the bridge — not another barrier.
          </p>

          <div className="text-center">
            <a
              href="#contact"
              className="inline-block px-10 py-5 bg-[#0f172a] text-white font-bold text-lg rounded-full shadow-xl hover:bg-[#1e293b] transition-all"
            >
              👉 Let's Talk About Bringing Boomer AI to Your Community
            </a>
          </div>
        </section>

        <section id="download" className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Download Boomer AI</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://apps.apple.com/app/boomer-ai"
              className="w-full sm:w-auto px-10 py-5 bg-[#0f172a] text-white font-bold text-lg rounded-full shadow-xl hover:bg-[#1e293b] transition-all flex items-center justify-center gap-2"
            >
              📱 Download for Apple
            </a>
            <button
              disabled
              className="w-full sm:w-auto px-10 py-5 bg-gray-100 text-gray-400 font-bold text-lg rounded-full cursor-not-allowed flex items-center justify-center gap-2"
            >
              📱 Google Play — Coming Soon
            </button>
          </div>
        </section>

        <section id="contact" className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Let's explore this together.</h2>

          <div className="flex items-center justify-center gap-3 mb-3">
            <Phone className="w-6 h-6 text-[#0f172a]" />
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Dave Amis</h3>
          </div>

          <a
            href="tel:405-627-4309"
            className="text-3xl md:text-4xl font-bold text-[#0f172a] hover:text-[#1e293b] transition-colors block mb-4"
          >
            405-627-4309
          </a>

          <p className="text-lg md:text-xl text-gray-700 mb-6">
            📩 Your community. Our curriculum. Shared transformation.
          </p>

          <p className="text-lg text-gray-600 italic">Ask questions. Explore options. No commitment needed.</p>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-lg text-white/90 font-semibold mb-2">Boomer AI — Teaching AI & Technology to Boomers</p>
          <p className="text-sm text-white/60">URL Path: /workwithus</p>
        </div>
      </footer>
    </div>
  )
}
