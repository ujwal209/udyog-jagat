"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"

export async function completePosterOnboarding(formData: FormData, avatarUrl: string) {
  console.log("🚀 [Poster Onboarding] Starting...")
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  try {
    // 1. Update Password (Auth System)
    console.log("🔐 Updating Password...")
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: password }
    )

    if (authError) throw authError

    // 2. Update Profile (Database)
    console.log("🗄️ Updating Database Profile...")
    const { error: dbError } = await supabaseAdmin
      .from("job_posters")
      .update({
        first_login: false, // CRITICAL: Mark as onboarded
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", user.id)

    if (dbError) throw dbError

    console.log("✅ Onboarding Complete")
    return { success: true }

  } catch (error: any) {
    console.error("❌ Onboarding Failed:", error.message)
    return { success: false, error: error.message }
  }
}