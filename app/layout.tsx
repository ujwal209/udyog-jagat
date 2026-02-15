import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Udyog Jagat | Professional Job Portal",
  description: "Find your dream job or the perfect candidate on Udyog Jagat.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
          {children}
      </body>
    </html>
  )
}