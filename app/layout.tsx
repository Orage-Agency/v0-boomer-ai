import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { UserProvider } from "@/contexts/user-context"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "Boomer AI - Learn AI at Your Own Pace",
  description: "A friendly guide to understanding and using AI, designed for everyone.",
  generator: "v0.app",
  applicationName: "Boomer AI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Boomer AI",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  keywords: ["AI", "learning", "technology", "education", "assistant"],
  authors: [{ name: "Orage Agency", url: "https://orage.agency" }],
  creator: "Orage Agency",
  publisher: "Orage Agency",
  robots: "index, follow",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3B82F6",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/boomer-ai-logo.png" />
      </head>
      <body className={`font-sans ${inter.variable} antialiased`}>
        <UserProvider>
          <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            {children}
            <Analytics />
          </Suspense>
        </UserProvider>
      </body>
    </html>
  )
}
