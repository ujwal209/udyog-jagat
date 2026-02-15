"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const [isDark, setIsDark] = React.useState(false)

  // 1. On Mount: Check what the theme is right now
  React.useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark")
    setIsDark(isDarkMode)
  }, [])

  // 2. The Manual Toggle Function
  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
      setIsDark(false)
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
      setIsDark(true)
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B0E14] border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:scale-110 active:scale-95"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-500 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-[#1C3FA4] transition-all" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  )
}