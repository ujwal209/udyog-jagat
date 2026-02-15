"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- FETCH PROFILE ---
export async function getCandidateProfileAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Fetch Profile Error:", error)
    return null
  }

  return data
}

// --- UPDATE PROFILE ---
export async function updateCandidateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const updates = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    age: parseInt(formData.get("age") as string),
    address: formData.get("address"),
    // Only update these if new URLs are provided (handled by client logic)
    ...(formData.get("avatar_url") && { avatar_url: formData.get("avatar_url") }),
    ...(formData.get("resume_url") && { resume_url: formData.get("resume_url") }),
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabaseAdmin
    .from("candidates")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    console.error("Update Profile Error:", error)
    return { success: false, error: "Failed to update profile" }
  }

  revalidatePath("/dashboard/candidate/profile")
  return { success: true }
}