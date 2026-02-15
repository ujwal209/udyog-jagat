"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, UserPlus, KeyRound, Users, UserCircle, 
  LogOut, ShieldCheck, Menu, Bot, Briefcase, FileText,
  Shield, FileCheck, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { signOutAction } from "@/app/actions/auth-actions"
import { getAdminProfile } from "@/app/actions/profile-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Menu Configuration
const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
  { name: "AI Assistant", icon: Bot, href: "/dashboard/admin/ai-assistant", badge: "New" }, 
  { name: "Post Job", icon: Briefcase, href: "/dashboard/admin/post-job" },
  { name: "Jobs List", icon: FileText, href: "/dashboard/admin/posted-jobs" }, 
  { name: "Applications", icon: FileCheck, href: "/dashboard/admin/applications" }, // Added Applications
  { name: "Add User", icon: UserPlus, href: "/dashboard/admin/create-user" },
  { name: "Generate Code", icon: KeyRound, href: "/dashboard/admin/generate-code" },
  { name: "Access Registry", icon: Shield, href: "/dashboard/admin/access-codes" },
  { name: "Created Users", icon: Users, href: "/dashboard/admin/my-users" },
  { name: "Profile", icon: UserCircle, href: "/dashboard/admin/profile" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = React.useState(false)
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  // --- FETCH REAL ADMIN DATA ---
  React.useEffect(() => {
    async function fetchUser() {
      try {
        const data = await getAdminProfile()
        if (data) {
          setUser(data)
        }
      } catch (error) {
        console.error("Failed to fetch admin profile", error)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = async () => {
    await signOutAction()
  }

  // --- REUSABLE SIDEBAR CONTENT ---
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white text-slate-800 font-sans border-r border-slate-100">
      
      {/* 1. Header (Fixed Height) */}
      <div className="shrink-0 flex items-center gap-3 px-6 h-20 border-b border-slate-50">
        <div className="w-10 h-10 bg-[#1C3FA4] rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/10 text-white shrink-0">
           <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="flex flex-col justify-center">
           <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">UDYOG</h1>
           <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Admin Console</p>
        </div>
      </div>

      {/* 2. Navigation (Flexible Scroll with Thin Scrollbar) */}
      <nav className="flex-1 flex flex-col px-4 py-6 gap-1 min-h-0 overflow-y-auto scrollbar-thin">
        <style jsx global>{`
          .scrollbar-thin::-webkit-scrollbar {
            width: 3px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: transparent;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #f1f5f9;
            border-radius: 20px;
          }
          .scrollbar-thin:hover::-webkit-scrollbar-thumb {
            background-color: #e2e8f0;
          }
        `}</style>

        <div className="px-3 mb-3 shrink-0">
           <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">General</p>
        </div>
        
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`group relative flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 select-none ${
                isActive 
                  ? "bg-blue-50/50 text-[#1C3FA4]" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute left-0 w-1 h-5 bg-[#1C3FA4] rounded-r-full" />
              )}
              
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-5 h-5 transition-colors ${isActive ? "text-[#1C3FA4]" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
              </div>
              
              {item.badge && !isActive && (
                <span className="bg-blue-50 text-[#1C3FA4] text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* 3. User Footer (Fixed & Dynamic) */}
      <div className="shrink-0 p-4 bg-white border-t border-slate-50">
         <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 group transition-all hover:bg-white hover:shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
               <Avatar className="w-9 h-9 border border-white shadow-sm shrink-0">
                 <AvatarImage src={user?.avatar_url} className="object-cover" />
                 <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-xs font-bold">
                   {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (user?.full_name?.[0] || "AD")}
                 </AvatarFallback>
               </Avatar>
               <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-900 truncate">
                    {loading ? "Loading..." : (user?.full_name || "Administrator")}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium truncate">
                    {loading ? "..." : (user?.email || "admin@udyog.com")}
                  </span>
               </div>
            </div>
            
            <form action={handleLogout}>
              <button className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Sign Out">
                <LogOut className="w-4 h-4" />
              </button>
            </form>
         </div>
      </div>
    </div>
  )

  return (
    <>
      {/* --- MOBILE HEADER (Sticky Top) --- */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-slate-100 text-slate-600">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[280px] border-none shadow-2xl bg-white">
                <SheetHeader className="sr-only"><SheetTitle>Navigation Menu</SheetTitle></SheetHeader>
                <SidebarContent isMobile={true} />
              </SheetContent>
            </Sheet>
            
            <Link href="/dashboard/admin" className="flex items-center gap-2">
               <div className="w-8 h-8 bg-[#1C3FA4] rounded-lg flex items-center justify-center text-white shadow-sm">
                  <ShieldCheck className="w-4 h-4" />
               </div>
               <span className="text-lg font-bold text-slate-900 tracking-tight">UDYOG</span>
            </Link>
         </div>
         
         <Avatar className="w-8 h-8 border border-slate-100 shadow-sm">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-[10px] font-bold text-[#1C3FA4]">
              {user?.full_name?.[0] || "AD"}
            </AvatarFallback>
         </Avatar>
      </div>

      {/* --- DESKTOP SIDEBAR (Fixed Left) --- */}
      <aside className="hidden lg:flex w-[260px] h-screen sticky top-0 z-30 shrink-0 flex-col bg-white">
        <SidebarContent />
      </aside>
    </>
  )
}