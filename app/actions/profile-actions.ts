"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

/**
 * 🔍 Fetch Admin Profile
 * Uses Admin Client to strictly bypass RLS
 */
export async function getAdminProfile() {
  console.log("🔍 [SERVER] Fetching Admin Profile...")
  
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("❌ [SERVER] Auth Error:", authError?.message || "No session")
    return null
  }

  // FORCE: Use Admin client to fetch data
  const { data: adminData, error: dbError } = await supabaseAdmin
    .from("admins")
    .select("*")
    .eq("id", user.id)
    .single()

  if (dbError) {
    console.error("❌ [SERVER] DB Fetch Error:", dbError.message)
    // Fallback: Return Auth data if DB record is missing
    return { 
      id: user.id,
      email: user.email, 
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
      role: 'admin'
    }
  }

  console.log("✅ [SERVER] Profile loaded for:", user.email)

  // FIX: Merge explicitly to ensure Auth Email takes priority over empty DB email
  return {
    ...adminData,       // Spread DB data first
    id: user.id,        // Ensure ID is correct
    email: user.email,  // 👈 FORCE AUTH EMAIL (Source of Truth)
    role: adminData.role || 'admin' // Fallback role
  }
}

// ... (Keep the rest of your update actions as they were)
export async function updateAdminAvatar(avatarUrl: string) {
  // ... existing code ...
  console.log("📸 [SERVER] Starting Avatar Update...")
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const { error, data } = await supabaseAdmin
    .from("admins")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id)
    .select()

  if (error) return { success: false, error: error.message }
  
  revalidatePath("/dashboard/admin/profile")
  return { success: true }
}

export async function updateAdminProfile(formData: FormData) {
  // ... existing code ...
  console.log("📝 [SERVER] Starting Profile Update...")
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const full_name = formData.get("full_name") as string
  const department = formData.get("department") as string

  if (!full_name) return { success: false, error: "Name required" }

  const { error, data } = await supabaseAdmin
    .from("admins")
    .update({ full_name, department })
    .eq("id", user.id)
    .select()

  if (error) return { success: false, error: error.message }

  revalidatePath("/dashboard/admin/profile")
  return { success: true }
}

export async function updateAdminPassword(formData: FormData) {
  // ... existing code ...
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) return { success: false, error: "Passwords do not match" }
  if (password.length < 6) return { success: false, error: "Password too short" }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: password }
  )

  if (error) return { success: false, error: error.message }

  return { success: true }
}