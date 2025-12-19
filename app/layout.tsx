import type React from "react"
import type { Metadata } from "next"
import { Prompt } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "./auth-context"

const prompt = Prompt({
  weight: ['400', '500', '600'],
  subsets: ['latin', 'thai'],
  display: 'swap',
  variable: '--font-prompt',
})



export const metadata: Metadata = {
  title: "ระบบแจ้งซ่อม",
  description: "ระบบจัดการและติดตามคำขอแจ้งซ่อมบำรุง",
  icons: {
    icon: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${prompt.className} antialiased font-extralight`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
