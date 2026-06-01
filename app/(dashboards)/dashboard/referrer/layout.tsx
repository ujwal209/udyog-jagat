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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/10 selection:text-primary">
      <Toaster 
        position="top-right"
        closeButton
        richColors
        toastOptions={{
          className: "rounded-2xl border-border shadow-xl font-medium",
        }}
      />

      <div className="flex flex-col lg:flex-row min-h-screen">
        <ReferrerSidebar />
        <main className="flex-1 w-full min-w-0 bg-background relative pb-20 lg:pb-0">
          {children}
        </main>
      </div>
    </div>
  )
}