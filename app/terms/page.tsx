import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="h-screen w-screen bg-[#0f172a] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl relative max-h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <div className="p-6 md:p-10 pb-0 flex-shrink-0">
          {/* Back Button */}
          <Link
            href="/"
            className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          {/* Logo */}
          <div className="flex justify-center mt-8 mb-6">
            <Image src="/boomer-ai-logo.png" alt="Boomer AI" width={120} height={40} className="object-contain" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-center text-gray-500 mb-6">Effective Date: November 26, 2025</p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 md:px-10 pb-6 md:pb-10">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance</h2>
              <p className="text-gray-700 leading-relaxed">By using Boomer AI, you agree to these terms.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Usage</h2>
              <p className="text-gray-700 leading-relaxed">
                You may use this app for personal, non-commercial purposes. You agree not to misuse the AI to generate
                harmful or illegal content.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. AI Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                This app uses Artificial Intelligence. Responses are generated automatically and may not always be 100%
                accurate. Please verify important information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend accounts that violate these terms.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Contact</h2>
              <p className="text-gray-900 font-bold">team@orage.agency</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
