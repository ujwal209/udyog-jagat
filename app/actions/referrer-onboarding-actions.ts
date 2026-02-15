"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

// --- 1. SUBMIT ONBOARDING FORM ---
export async function completeReferrerOnboardingAction(formData: FormData) {
  console.log("🚀 [SERVER] Action Started")

  try {
    const supabase = await createClient()
    
    // Check Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error("❌ [SERVER] Auth Error:", authError)
      return { success: false, error: "Unauthorized: Please login again." }
    }
    console.log("✅ [SERVER] User Found:", user.id)

    // Extract Data
    const full_name = formData.get("full_name") as string
    const phone = formData.get("phone") as string
    const company_name = formData.get("company_name") as string
    const linkedin_url = formData.get("linkedin_url") as string
    const avatar_url = formData.get("avatar_url") as string
    const new_password = formData.get("new_password") as string

    // Update Password (Optional)
    if (new_password && new_password.length >= 6) {
      console.log("🔄 [SERVER] Updating Password...")
      const { error: pwdError } = await supabaseAdmin.auth.admin.updateUserById(
        user.id,
        { password: new_password }
      )
      if (pwdError) {
        console.error("❌ [SERVER] Password Update Failed:", pwdError)
        return { success: false, error: "Password update failed: " + pwdError.message }
      }
    }

    // Update Profile
    console.log("🔄 [SERVER] Updating Referrer Profile...")
    const updatePayload = {
      full_name,
      phone,
      company_name,
      linkedin_url,
      avatar_url,
      first_login: false // Critical: This disables the onboarding redirect
    }
    
    const { error: dbError } = await supabaseAdmin
      .from("referrers")
      .update(updatePayload)
      .eq("id", user.id)

    if (dbError) {
      console.error("❌ [SERVER] Database Error:", dbError)
      return { success: false, error: "Database error: " + dbError.message }
    }

    console.log("✅ [SERVER] Success!")
    return { success: true }

  } catch (err: any) {
    console.error("❌ [SERVER] Critical Crash:", err)
    return { success: false, error: "Server Error: " + (err.message || "Unknown") }
  }
}

// --- 2. GET REFERRER STATUS (Missing Export Fixed) ---
export async function getReferrerStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data } = await supabaseAdmin
    .from("referrers")
    .select("first_login, full_name, avatar_url") // <--- ADD avatar_url HERE
    .eq("id", user.id)
    .single()
    
  return data
}