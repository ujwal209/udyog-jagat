import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let avatarUrl = null
  let dashboardRoute = "/onboarding"

  if (user) {
    // Check candidates
    const { data: candidate } = await supabaseAdmin.from("candidates").select("avatar_url, first_login").eq("id", user.id).maybeSingle()
    if (candidate) {
      avatarUrl = candidate.avatar_url
      dashboardRoute = candidate.first_login ? "/onboarding" : "/dashboard/candidate"
    } else {
      // Check posters
      const { data: poster } = await supabaseAdmin.from("job_posters").select("avatar_url, first_login").eq("id", user.id).maybeSingle()
      if (poster) {
        avatarUrl = poster.avatar_url
        dashboardRoute = poster.first_login ? "/onboarding" : "/dashboard/poster"
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      <Navbar user={user} avatarUrl={avatarUrl} dashboardRoute={dashboardRoute} />
      <main className="flex-1">
        {children}
      </main>
      
      {/* --- FOOTER --- */}
      <footer className="border-t border-border/50 bg-card py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-6 grid gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-2">
            <div className="text-2xl font-black tracking-tighter text-foreground">
              UDYOG JAGAT
            </div>
            <p className="text-muted-foreground max-w-sm">
              The modern hiring infrastructure. Accelerating careers and scaling teams with AI-driven precision and speed.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Platform</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/features" className="hover:text-foreground transition-colors">Features</Link>
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
              <Link href="/about" className="hover:text-foreground transition-colors">About Us</Link>
              <Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>© {new Date().getFullYear()} Udyog Jagat Inc. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
