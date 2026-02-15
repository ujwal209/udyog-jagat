"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, Search, FileText, UserCircle, 
  LogOut, Menu, Bookmark, Zap, MessageSquare, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { signOutAction } from "@/app/actions/auth-actions"
import { getCandidateProfileAction } from "@/app/actions/candidate-profile-actions" 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/candidate" },
  { name: "Find Jobs", icon: Search, href: "/dashboard/candidate/jobs" }, 
  { name: "My Applications", icon: FileText, href: "/dashboard/candidate/applications" },
  { name: "Messages", icon: MessageSquare, href: "/dashboard/candidate/messages", badge: "New" }, // Added Messages
  { name: "Saved Jobs", icon: Bookmark, href: "/dashboard/candidate/saved" },
  { name: "My Profile", icon: UserCircle, href: "/dashboard/candidate/profile" },
]

export function CandidateSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [user, setUser] = React.useState<{ full_name: string, email: string, avatar_url: string } | null>(null)
  const [loading, setLoading] = React.useState(true)

  // --- FETCH REAL USER DATA ---
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

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans border-r border-slate-100">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 flex items-center gap-3 px-6 h-20 border-b border-slate-50">
        <div className="w-10 h-10 bg-[#1C3FA4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20 text-white shrink-0 transition-transform hover:scale-105">
           <Zap className="w-5 h-5 fill-current" />
        </div>
        <div className="flex flex-col justify-center">
           <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none font-display">UDYOG</h1>
           <p className="text-[10px] font-semibold text-[#1C3FA4] uppercase tracking-widest mt-1">Candidate</p>
        </div>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 flex flex-col px-4 py-8 gap-1.5 min-h-0 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-100">
        <div className="px-3 mb-4 shrink-0">
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Menu</p>
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center justify-between px-3.5 py-3 rounded-xl transition-all duration-300 select-none ${
                isActive 
                  ? "bg-blue-50/80 text-[#1C3FA4] shadow-sm ring-1 ring-blue-100" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? "text-[#1C3FA4]" : "text-slate-400 group-hover:text-slate-600"
                }`} strokeWidth={2} />
                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    isActive 
                      ? "bg-blue-100 text-[#1C3FA4] border-blue-200" 
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#1C3FA4]" />}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* --- USER FOOTER --- */}
      <div className="shrink-0 p-4 bg-white border-t border-slate-50">
         <div className="bg-slate-50/50 rounded-2xl p-3 flex items-center justify-between border border-slate-100 group hover:bg-white hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300">
            <div className="flex items-center gap-3 min-w-0">
               <Avatar className="w-10 h-10 border-2 border-white shadow-sm shrink-0 bg-white">
                 <AvatarImage src={user?.avatar_url} className="object-cover" />
                 <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-xs font-bold">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (user?.full_name?.[0] || "CN")}
                 </AvatarFallback>
               </Avatar>
               <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-slate-900 truncate group-hover:text-[#1C3FA4] transition-colors">
                    {loading ? "Loading..." : (user?.full_name || "Candidate")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                    {user?.email || "View Profile"}
                  </span>
               </div>
            </div>
            
            <form action={handleLogout}>
              <button className="p-2 rounded-xl text-slate-400 hover:bg-white hover:text-red-500 hover:shadow-sm transition-all" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
         </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-4 h-16 flex items-center justify-between transition-all">
         <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none shadow-2xl bg-white">
                <SheetHeader className="sr-only"><SheetTitle>Menu</SheetTitle></SheetHeader>
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 bg-[#1C3FA4] rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-900/10">
                  <Zap className="w-4 h-4 fill-current" />
               </div>
               <span className="text-lg font-bold text-slate-900 tracking-tight">UDYOG</span>
            </div>
         </div>
         
         <Avatar className="w-8 h-8 border border-slate-100 shadow-sm">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-[10px] font-bold text-[#1C3FA4] bg-blue-50">
               {user?.full_name?.[0] || "CN"}
            </AvatarFallback>
         </Avatar>
      </div>

      <aside className="hidden lg:flex w-[280px] h-screen sticky top-0 z-30 shrink-0 flex-col bg-white border-r border-slate-100">
        <SidebarContent />
      </aside>
    </>
  )
}