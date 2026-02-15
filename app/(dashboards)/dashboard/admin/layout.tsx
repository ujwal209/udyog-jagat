import { AdminSidebar } from "@/app/components/dashboard/admin-sidebar"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // 1. Get Current Auth User
  const { data: { user } } = await supabase.auth.getUser()
  
  // If not logged in at all, kick to login
  if (!user) {
    redirect("/login") 
  }

  // 2. Fetch Admin record and verify Role
  // We use supabaseAdmin to bypass RLS for the security check
  const { data: admin, error } = await supabaseAdmin
    .from("admins")
    .select("first_login, role")
    .eq("id", user.id)
    .single()

  // 3. STRICT ACCESS CONTROL:
  // If the record doesn't exist OR the role is not 'admin', kick them out.
  // This prevents posters or candidates from accessing this layout.
  if (error || !admin || admin.role !== 'admin') {
    console.error(`🚫 [SECURITY] Unauthorized access attempt by ${user.email}`);
    redirect("/login?error=unauthorized") 
  }

  // 4. ONBOARDING REDIRECT:
  // If they are an admin but haven't finished setup, force onboarding.
  if (admin.first_login) {
    redirect("/onboarding/admin")
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-white">
      {/* Sidebar - Desktop fixed / Mobile sticky */}
      <AdminSidebar />
      
      <main className="flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out">
        {/* Responsive Content Container */}
        <div className="flex-1 w-full p-4 md:p-8 lg:p-10 animate-in fade-in zoom-in-95 duration-500 mt-16 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}