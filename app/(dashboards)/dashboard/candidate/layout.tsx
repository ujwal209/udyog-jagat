import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"
import { CandidateSidebar } from "@/components/candidate-sidebar"
import { Toaster } from "sonner" 

export default async function CandidateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 1. Check User Session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect("/login")

  // 2. Check Onboarding Status
  const { data: candidate, error } = await supabaseAdmin
    .from("candidates")
    .select("first_login")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Layout Layout Error:", error)
  }

  // 3. Force Redirect if First Login is TRUE
  if (candidate?.first_login === true) {
    redirect("/onboarding")
  }

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-[#1C3FA4]/10 selection:text-[#1C3FA4]">
      
      {/* Global Toaster for Candidate Dashboard 
        - Positioned top-right
        - Styled to match the modern white theme
      */}
      <Toaster 
        position="top-right"
        theme="light"
        closeButton
        richColors
        toastOptions={{
          className: "rounded-2xl border-slate-100 shadow-xl shadow-slate-200/20 font-medium",
          style: {
            background: 'white',
            color: '#0f172a',
            border: '1px solid #f1f5f9',
          },
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar Navigation */}
        <CandidateSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 bg-white relative">
          {children}
        </main>
      </div>
    </div>
  )
}