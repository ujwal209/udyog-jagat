import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"
import { ReferrerSidebar } from "@/components/referrer-sidebar"
import { Toaster } from "sonner"

export default async function ReferrerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // 1. Fetch Referrer Profile (Bypass RLS with admin client)
  const { data: referrer, error } = await supabaseAdmin
    .from("referrers")
    .select("first_login")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Referrer Layout Error:", error)
    // Optionally redirect to error page
  }

  // 2. Strict Onboarding Check
  // If first_login is true (default), force them to onboarding
  if (referrer?.first_login === true) {
    redirect("/onboarding/referrer")
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#1C3FA4]/10 selection:text-[#1C3FA4]">
      <Toaster 
        position="top-right"
        theme="light"
        closeButton
        richColors
        toastOptions={{
          className: "rounded-2xl border-slate-100 shadow-xl shadow-slate-200/20 font-medium",
          style: { background: 'white', color: '#0f172a', border: '1px solid #f1f5f9' },
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        <ReferrerSidebar />
        <main className="flex-1 w-full min-w-0 bg-white relative">
          {children}
        </main>
      </div>
    </div>
  )
}