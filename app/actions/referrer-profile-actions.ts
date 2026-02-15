"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- FETCH PROFILE ---
export async function getReferrerProfileAction() {
  console.log("🔍 [SERVER] Fetching Referrer Profile...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error("❌ [SERVER] User not authenticated")
      return null
    }

    const { data, error } = await supabaseAdmin
      .from("referrers")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("❌ [SERVER] Database Fetch Error:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("❌ [SERVER] Critical Fetch Error:", err)
    return null
  }
}

// --- UPDATE PROFILE ---
export async function updateReferrerProfileAction(formData: FormData) {
  console.log("🚀 [SERVER] Update Action Started")

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    // Extract Data
    const full_name = formData.get("full_name") as string
    const phone = formData.get("phone") as string
    const company_name = formData.get("company_name") as string
    const linkedin_url = formData.get("linkedin_url") as string
    const avatar_url = formData.get("avatar_url") as string

    console.log("🔄 [SERVER] Updating fields for user:", user.id)

    const { error } = await supabaseAdmin
      .from("referrers")
      .update({
        full_name,
        phone,
        company_name,
        linkedin_url,
        avatar_url,
        // updated_at: new Date().toISOString() // Uncomment if you added this column
      })
      .eq("id", user.id)

    if (error) {
      console.error("❌ [SERVER] Update Error:", error)
      return { success: false, error: "Failed to update profile. " + error.message }
    }

    console.log("✅ [SERVER] Profile Updated Successfully")
    revalidatePath("/dashboard/referrer/profile")
    return { success: true }

  } catch (err: any) {
    console.error("❌ [SERVER] Critical Update Error:", err)
    return { success: false, error: "Server error: " + err.message }
  }
}