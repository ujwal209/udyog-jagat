"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Search, FileText, UserCircle, 
  LogOut, Bookmark, Zap, MessageSquare, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOutAction } from "@/app/actions/auth-actions"
import { getCandidateProfileAction } from "@/app/actions/candidate-profile-actions" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/candidate" },
  { name: "Find Jobs", icon: Search, href: "/dashboard/candidate/jobs" }, 
  { name: "Applications", icon: FileText, href: "/dashboard/candidate/applications" },
  { name: "Messages", icon: MessageSquare, href: "/dashboard/candidate/messages", badge: "New" },
  { name: "Saved Jobs", icon: Bookmark, href: "/dashboard/candidate/saved" },
  { name: "Profile", icon: UserCircle, href: "/dashboard/candidate/profile" },
]

// Exclude Saved Jobs for mobile bottom nav to fit 5 items
const mobileNavItems = menuItems.filter(item => item.name !== "Saved Jobs")

export function CandidateSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[280px] h-screen sticky top-0 z-30 shrink-0 flex-col bg-card dark:bg-[#060d1d] border-r border-border">
        <SidebarContent />
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible < lg) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors relative ${isActive ? "bg-primary/10" : ""}`}>
                <item.icon className="w-5 h-5" />
                {item.badge && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className={`text-[9px] font-semibold tracking-wide ${isActive ? "text-primary" : ""}`}>
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </>
  )
}

function SidebarContent() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<{ full_name: string, email: string, avatar_url: string } | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadUser() {
      try {
        const data = await getCandidateProfileAction()
        if (data) {
          setUser({
            full_name: data.full_name || "Candidate",
            email: data.email || "",
            avatar_url: data.avatar_url || ""
          })
        }
      } catch (e) {
        console.error("Sidebar load error", e)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleLogout = async () => {
    toast.promise(signOutAction(), {
      loading: 'Signing out...',
      success: 'See you next time!',
      error: 'Failed to sign out'
    })
  }

  return (
    <div className="flex flex-col h-full bg-card dark:bg-[#060d1d] text-foreground font-sans">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 flex items-center gap-3 px-6 h-20 border-b border-border">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 text-primary-foreground shrink-0 transition-transform hover:scale-105">
           <Zap className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col justify-center">
           <h1 className="text-lg font-bold tracking-tight leading-none font-display">UDYOG</h1>
           <p className="text-[10px] font-semibold text-primary uppercase tracking-widest mt-1">Candidate</p>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 flex flex-col px-4 py-8 gap-1.5 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
        <div className="px-3 mb-4 shrink-0">
           <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Main Menu</p>
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-300 select-none ${
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                }`} strokeWidth={2} />
                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    isActive 
                      ? "bg-primary/20 text-primary border-primary/30" 
                      : "bg-secondary text-muted-foreground border-border"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* --- USER FOOTER --- */}
      <div className="shrink-0 p-4 bg-card dark:bg-[#060d1d] border-t border-border space-y-4">
         <div className="bg-secondary/50 rounded-2xl p-3 flex items-center justify-between border border-border group hover:bg-card hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 min-w-0">
               <Avatar className="w-10 h-10 border border-border shadow-sm shrink-0 bg-background">
                 <AvatarImage src={user?.avatar_url} className="object-cover" />
                 <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (user?.full_name?.[0] || "CN")}
                 </AvatarFallback>
               </Avatar>
               <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold truncate group-hover:text-primary transition-colors">
                    {loading ? "Loading..." : (user?.full_name || "Candidate")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                    {user?.email || "View Profile"}
                  </span>
               </div>
            </div>
            
            <form action={handleLogout}>
              <button className="p-2 rounded-xl text-muted-foreground hover:bg-background hover:text-red-500 hover:shadow-sm transition-all" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
         </div>
      </div>
    </div>
  )
}