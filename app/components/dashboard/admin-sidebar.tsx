"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, UserPlus, KeyRound, Users, UserCircle, 
  LogOut, ShieldCheck, Briefcase, FileText,
  Shield, FileCheck, Loader2, BrainCircuit, Menu
} from "lucide-react"
import { signOutAction } from "@/app/actions/auth-actions"
import { getAdminProfile } from "@/app/actions/profile-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

// Menu Configuration
const menuItems = [
  { name: "Overview", icon: LayoutDashboard, href: "/dashboard/admin" },
  { name: "AI Assistant", icon: BrainCircuit, href: "/dashboard/admin/ai-assistant", badge: "New" },
  { name: "Post Job", icon: Briefcase, href: "/dashboard/admin/post-job" },
  { name: "Jobs List", icon: FileText, href: "/dashboard/admin/posted-jobs" }, 
  { name: "Applications", icon: FileCheck, href: "/dashboard/admin/applications" },
  { name: "Add User", icon: UserPlus, href: "/dashboard/admin/create-user" },
  { name: "Generate Code", icon: KeyRound, href: "/dashboard/admin/generate-code" },
  { name: "Access", icon: Shield, href: "/dashboard/admin/access-codes" },
  { name: "Users", icon: Users, href: "/dashboard/admin/my-users" },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* --- DESKTOP SIDEBAR (Fixed Left) --- */}
      <aside className="hidden lg:flex w-[280px] h-screen sticky top-0 z-30 shrink-0 flex-col bg-card dark:bg-[#060d1d] border-r border-border">
        <SidebarContent />
      </aside>

      {/* --- MOBILE SIDEBAR DRAWER (Visible < lg) --- */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="w-10 h-10 rounded-xl bg-white shadow-sm border-slate-200 text-slate-700">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-r-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

function SidebarContent() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadUser() {
      try {
        const data = await getAdminProfile()
        if (data) setUser(data)
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
      success: 'Goodbye Admin!',
      error: 'Failed to sign out'
    })
  }

  return (
    <div className="flex flex-col h-full bg-card dark:bg-[#060d1d] text-foreground font-sans overflow-y-auto scrollbar-thin scrollbar-thumb-muted">
      
      {/* --- HEADER --- */}
      <div className="shrink-0 flex flex-col justify-center px-6 h-24 border-b border-border">
        <div className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
          UDYOG JAGAT
        </div>
        <p className="text-[10px] font-semibold text-[#1C3FA4] uppercase tracking-widest mt-1">Admin Console</p>
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 flex flex-col px-4 py-8 gap-1.5 min-h-0">
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
                  ? "bg-blue-50/50 text-[#1C3FA4] shadow-sm ring-1 ring-blue-100" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-3.5">
                <item.icon className={`w-[18px] h-[18px] transition-colors ${
                  isActive ? "text-[#1C3FA4]" : "text-muted-foreground group-hover:text-foreground"
                }`} strokeWidth={2} />
                <span className={`text-sm ${isActive ? "font-semibold" : "font-medium"}`}>{item.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                    isActive 
                      ? "bg-blue-100/50 text-[#1C3FA4] border-blue-200" 
                      : "bg-secondary text-muted-foreground border-border"
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
      <div className="shrink-0 p-4 bg-card dark:bg-[#060d1d] border-t border-border space-y-4 mt-auto">
         <div className="bg-secondary/50 rounded-2xl p-2 flex items-center justify-between border border-border group hover:bg-card hover:shadow-md transition-all duration-300">
            <Link href="/dashboard/admin/profile" className="flex items-center gap-3 min-w-0 overflow-hidden flex-1 hover:opacity-80 transition-opacity rounded-xl p-1">
               <Avatar className="w-10 h-10 border border-border shadow-sm shrink-0 bg-background">
                 <AvatarImage src={user?.avatar_url} className="object-cover" />
                 <AvatarFallback className="bg-blue-50 text-[#1C3FA4] text-xs font-bold">
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : (user?.full_name?.[0] || "AD")}
                 </AvatarFallback>
               </Avatar>
               <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                  <span className="text-xs font-bold truncate group-hover:text-[#1C3FA4] transition-colors">
                    {loading ? "Loading..." : (user?.full_name || "Administrator")}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium truncate">
                    {user?.email || "Admin Profile"}
                  </span>
               </div>
            </Link>
            
            <form action={handleLogout} className="shrink-0 ml-1">
              <button className="p-2.5 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:shadow-sm transition-all" title="Sign Out">
                <LogOut className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </form>
         </div>
      </div>
    </div>
  )
}