"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, FilePlus, FileText, 
  LogOut, ShieldCheck, Briefcase, User,
  Settings, Menu, X
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
  const [isOpen, setIsOpen] = React.useState(false) // Mobile Menu State
  const pathname = usePathname()
  
  // Close mobile menu when route changes
  React.useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Visible lg+) --- */}
      <div className="hidden lg:flex flex-col w-[280px] border-r border-slate-100 bg-white h-screen sticky top-0 shrink-0 z-50">
        <SidebarContent />
      </div>

      {/* --- MOBILE HEADER (Visible < lg) --- */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-100 z-50 flex items-center justify-between px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1C3FA4] rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">UDYOG</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6 text-slate-700" />
        </Button>
      </div>

      {/* --- MOBILE DRAWER OVERLAY --- */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer */}
          <div className="relative w-[280px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4">
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full bg-slate-50 text-slate-500">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SidebarContent isMobile />
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Shared Content Component to ensure consistency 
 * between Desktop Sidebar and Mobile Drawer
 */
function SidebarContent({ isMobile = false }: { isMobile?: boolean }) {
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
      <div className={`h-24 flex items-center px-8 ${!isMobile ? "border-b border-slate-50" : ""}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1C3FA4] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">UDYOG</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Poster Console</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto no-scrollbar">
        <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-200 font-medium text-sm ${
                isActive 
                  ? "bg-blue-50 text-[#1C3FA4]" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#1C3FA4]" : "text-slate-400 group-hover:text-slate-600"}`} />
                {item.name}
              </div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1C3FA4]" />}
            </Link>
          )
        })}
      </div>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-50 space-y-4 bg-white">
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
          {loading ? (
            <>
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2 w-24" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-10 w-10 rounded-xl border border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage src={user?.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-[#1C3FA4] text-white rounded-xl font-bold">
                  {user?.full_name?.[0] || "P"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || "Job Poster"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate">
                  {user?.email}
                </p>
              </div>
              <Link href="/dashboard/poster/profile">
                <Button size="icon" variant="ghost" className="h-7 w-7 rounded-lg hover:bg-white hover:shadow-sm text-slate-400">
                  <Settings className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>

        <form action={signOutAction}>
          <button className="flex items-center justify-center gap-2 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 hover:border-rose-100 border border-transparent rounded-xl transition-all text-xs font-bold uppercase tracking-wide">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  )
}