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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      
      {/* Global Toaster for Candidate Dashboard 
        - Positioned top-right
        - Styled to match the modern white theme
      */}
      <Toaster 
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          className: "rounded-2xl border-border shadow-xl font-medium",
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Sidebar Navigation */}
        <CandidateSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 bg-background relative pt-16 pb-20 lg:pt-0 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}