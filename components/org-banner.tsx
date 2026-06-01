"use client"

import * as React from "react"
import Link from "next/link"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OrgBannerProps {
  user: any // Poster, Candidate, or Referrer object
  role: "poster" | "candidate" | "referrer"
}

export function OrgBanner({ user, role }: OrgBannerProps) {
  const [isVisible, setIsVisible] = React.useState(true)

  // Check if any of the organizational fields are missing
  const hasMissingFields = !user?.vibhaaga || !user?.skpm || !user?.khanda || !user?.valaya || !user?.milan

  if (!hasMissingFields || !isVisible) {
    return null
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 md:p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-in fade-in slide-in-from-top-4 duration-500 relative overflow-hidden">
      
      {/* Decorative Blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Close Button - Absolutely positioned on mobile, relatively positioned on desktop */}
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 md:relative md:top-0 md:right-0 text-muted-foreground hover:bg-primary/10 hover:text-foreground shrink-0 rounded-lg"
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start md:items-center gap-4 relative z-10 pr-6 md:pr-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="text-sm md:text-base font-bold text-foreground">Complete your Organizational Details</h4>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            You haven't filled out your Vibhaaga, SKPM, Khanda, Valaya, or Milan. This is optional but highly recommended.
          </p>
        </div>
      </div>

      <div className="w-full md:w-auto relative z-10 mt-2 md:mt-0">
        <Link href={`/dashboard/${role}/profile`} className="block w-full">
          <Button size="sm" className="w-full md:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-lg shadow-sm">
            Update Profile
          </Button>
        </Link>
      </div>
    </div>
  )
}
