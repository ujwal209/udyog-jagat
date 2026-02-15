"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin" // Use Admin for DB updates
import { revalidatePath } from "next/cache"

// --- STEP 1: CHANGE PASSWORD ---
export async function updatePasswordAction(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get("password") as string
  const confirm = formData.get("confirmPassword") as string

  if (password !== confirm) return { success: false, error: "Passwords do not match" }
  if (password.length < 6) return { success: false, error: "Password too weak (min 6 chars)" }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { success: false, error: error.message }
  
  return { success: true }
}

// --- STEP 2: COMPLETE PROFILE & UNLOCK ---
export async function completeOnboardingAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const updates = {
    full_name: formData.get("full_name"), // <--- Added
    phone: formData.get("phone"),
    address: formData.get("address"),
    age: parseInt(formData.get("age") as string),
    resume_url: formData.get("resume_url"),
    avatar_url: formData.get("avatar_url"),
    first_login: false,
    status: 'active'
  }

  const { error } = await supabaseAdmin
    .from("candidates")
    .update(updates)
    .eq("id", user.id)

  if (error) {
    console.error("Onboarding Error:", error)
    return { success: false, error: "Failed to save profile." }
  }

  revalidatePath("/dashboard/candidate")
  return { success: true }
}