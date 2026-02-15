import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { PosterSidebar } from "@/components/poster-sidebar"

export default async function PosterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // 1. Get User
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // 2. Get Poster Profile
  const { data: poster } = await supabase
    .from("job_posters")
    .select("first_login")
    .eq("id", user.id)
    .single()

  if (!poster) redirect("/login?error=Profile not found")

  // 3. CRITICAL: Redirect to external onboarding route if first login
  if (poster.first_login) {
    redirect("/onboarding/poster")
  }

  // 4. Render Dashboard (Only reached if onboarded)
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <PosterSidebar />
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}