import type { Metadata, Viewport } from "next"
import { Fraunces, Source_Sans_3, Source_Code_Pro } from "next/font/google"
import "./globals.css"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ecosystem Dashboard",
  description: "Personal creative ecosystem tracker — 9 projects, one nervous system",
}

export const viewport: Viewport = {
  themeColor: "#1f1a16",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${sourceSans.variable} ${sourceCode.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
