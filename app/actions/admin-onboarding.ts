"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function checkAdminOnboardingAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: admin } = await supabaseAdmin
    .from("admins")
    .select("first_login")
    .eq("id", user.id)
    .single()

  return admin?.first_login
}

export async function completeAdminOnboardingAction(formData: FormData, avatarUrl?: string) {
  console.log("🚀 [ADMIN-ONBOARDING] Starting submission...")
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error("❌ [ADMIN-ONBOARDING] No authenticated user found.")
    return { success: false, error: "Unauthorized access" }
  }

  // Extract Data
  const fullName = formData.get("fullName") as string
  const department = formData.get("department") as string
  
  // Organization Fields
  const vibhaaga = formData.get("vibhaaga") as string
  const khanda = formData.get("khanda") as string
  const valaya = formData.get("valaya") as string
  const milan = formData.get("milan") as string

  // Security
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  
  // Validation
  if (password && password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }
  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" }
  }

  try {
    // 1. Update Password (Auth Layer)
    if (password) {
      const { error: authError } = await supabase.auth.updateUser({ password })
      if (authError) throw new Error(`Auth Error: ${authError.message}`)
    }

    // 2. Update Admin Profile (Database Layer)
    const updateData: any = {
      full_name: fullName,
      department: department,
      vibhaaga: vibhaaga,
      khanda: khanda,
      valaya: valaya,
      milan: milan,
      first_login: false, // Mark as complete
      status: 'active'
    }
    
    if (avatarUrl) updateData.avatar_url = avatarUrl

    console.log(`📝 [ADMIN-ONBOARDING] Updating DB for user: ${user.id}`)

    const { error: dbError } = await supabaseAdmin
      .from("admins")
      .update(updateData)
      .eq("id", user.id)

    if (dbError) throw new Error(`DB Error: ${dbError.message}`)

    console.log("✅ [ADMIN-ONBOARDING] Success.")

  } catch (err: any) {
    console.error("🔥 [ADMIN-ONBOARDING] Critical Failure:", err.message)
    return { success: false, error: err.message }
  }

  // 3. Redirect
  revalidatePath("/dashboard/admin")
  redirect("/dashboard/admin")
}