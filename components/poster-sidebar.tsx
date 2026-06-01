"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, FilePlus, FileText, 
  LogOut, Briefcase, User,
  Settings
} from "lucide-react"
import { signOutAction } from "@/app/actions/auth-actions"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { getPosterSidebarDetails } from "@/app/actions/poster-sidebar-actions"

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/poster" },
  { name: "Post New Job", icon: FilePlus, href: "/dashboard/poster/post-job" },
  { name: "My Listings", icon: FileText, href: "/dashboard/poster/my-jobs" },
  { name: "Applications", icon: Briefcase, href: "/dashboard/poster/applications" },
  { name: "My Profile", icon: User, href: "/dashboard/poster/profile" },
]

export function PosterSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Visible lg+) --- */}
      <div className="hidden lg:flex flex-col w-[260px] border-r border-border bg-card dark:bg-[#060d1d] h-screen sticky top-0 shrink-0 z-50">
        <SidebarContent />
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION (Visible < lg) --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border z-50 flex items-center justify-around px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-primary/10" : ""}`}>
                <item.icon className="w-5 h-5" />
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
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadProfile() {
      const data = await getPosterSidebarDetails()
      if (data) setUser(data)
      setLoading(false)
    }
    loadProfile()
  }, [])

  return (
    <>
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex flex-col">
          <div className="text-xl font-black tracking-tight text-foreground leading-none">
            UDYOG JAGAT
          </div>
        </Link>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Poster Console</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm ${
                isActive 
                  ? "bg-secondary text-foreground font-semibold" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              <item.icon className={`w-4 h-4 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
              {item.name}
            </Link>
          )
        })}
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-border space-y-4 bg-card dark:bg-[#060d1d]">
        <div className="bg-background rounded-md p-3 border border-border flex items-center gap-3">
          {loading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-24" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8 rounded-md border border-border">
                <AvatarImage src={user?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-primary text-primary-foreground rounded-md text-xs font-semibold">
                  {user?.full_name?.[0] || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.full_name || "Job Poster"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Link href="/dashboard/poster/profile">
                <Button size="icon" variant="ghost" className="h-6 w-6 rounded hover:bg-secondary text-muted-foreground hover:text-foreground">
                  <Settings className="w-3 h-3" />
                </Button>
              </Link>
            </>
          )}
        </div>

        <form action={signOutAction}>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent rounded-md transition-all text-sm font-medium">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}