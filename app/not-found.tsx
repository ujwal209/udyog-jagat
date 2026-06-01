"use client"

import Link from "next/link"
import { Search, ArrowLeft, Home, Compass } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-3xl w-full mx-auto text-center relative z-10 space-y-8 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Large 404 text */}
        <div className="relative inline-block">
           <h1 className="text-[120px] md:text-[180px] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50 leading-none">
             404
           </h1>
           <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        </div>

        <div className="space-y-4">
           <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
             Looks like you've wandered off the map.
           </h2>
           <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto font-medium">
             The page you're looking for doesn't exist or has been moved to a different sector of the ecosystem.
           </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
           <Link href="/">
             <button className="h-14 px-8 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] w-full sm:w-auto">
               <Home className="w-5 h-5" />
               Return Home
             </button>
           </Link>
           <button onClick={() => window.history.back()} className="h-14 px-8 rounded-full bg-secondary hover:bg-secondary/80 text-foreground font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] w-full sm:w-auto">
             <ArrowLeft className="w-5 h-5" />
             Go Back
           </button>
        </div>

        <div className="pt-16 border-t border-border/50 flex flex-col sm:flex-row justify-center gap-8 mt-16 max-w-2xl mx-auto">
           <Link href="/auth/login" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                 <Compass className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm">Dashboard Login</span>
           </Link>
           <Link href="/auth/signup" className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                 <Search className="w-5 h-5" />
              </div>
              <span className="font-semibold text-sm">Find Opportunities</span>
           </Link>
        </div>
        
      </div>
    </div>
  )
}
