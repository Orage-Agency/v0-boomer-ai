import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
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

          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-center text-gray-500 mb-6">Effective Date: November 26, 2025</p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 md:px-10 pb-6 md:pb-10">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Boomer AI ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
                you have a positive experience on our website and in using our apps.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Account Information:</strong> When you sign up, we collect your email address to create your
                  account and save your progress.
                </li>
                <li>
                  <strong>Usage Data:</strong> We collect data on how you interact with the app, such as the lessons you
                  complete and the features you use (e.g., Stars earned).
                </li>
                <li>
                  <strong>User Content:</strong> We process the text and audio inputs you provide to generate AI
                  responses and images.
                </li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-2">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide, maintain, and improve the App.</li>
                <li>Personalize your experience (e.g., remembering your name and stars).</li>
                <li>Generate AI content based on your requests.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
              <p className="text-gray-700 leading-relaxed">
                We utilize third-party AI providers (such as OpenAI) to process your requests. These providers are not
                permitted to use your personal data for their own training purposes outside of providing the service to
                us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention & Deletion</h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your data only as long as your account is active. You have the right to request the deletion
                of your account and all associated data at any time. To do so, please go to the Settings page in the app
                or contact us at the email below.
              </p>
            </section>

            <section className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-900 font-bold mt-2">team@orage.agency</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
