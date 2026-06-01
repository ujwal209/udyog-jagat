"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin" 
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

  const { data: isCandidate } = await supabaseAdmin.from("candidates").select("id").eq("id", user.id).maybeSingle()
  const { data: isPoster } = await supabaseAdmin.from("job_posters").select("id").eq("id", user.id).maybeSingle()

  if (isCandidate) {
    const updates = {
      full_name: formData.get("full_name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      age: formData.get("age") ? parseInt(formData.get("age") as string) : null,
      resume_url: formData.get("resume_url"),
      avatar_url: formData.get("avatar_url"),
      // Detailed Seeker Fields
      headline: formData.get("headline"),
      experience_years: formData.get("experience_years") ? parseInt(formData.get("experience_years") as string) : null,
      skills: formData.get("skills"),
      portfolio_url: formData.get("portfolio_url"),
      linkedin_url: formData.get("linkedin_url"),
      first_login: false,
      status: 'active'
    }

    const { error } = await supabaseAdmin.from("candidates").update(updates).eq("id", user.id)
    if (error) {
      console.error("Onboarding Error:", error)
      return { success: false, error: "Failed to save profile." }
    }
    revalidatePath("/dashboard")
    return { success: true, redirect: "/dashboard/candidate" } 
  } else if (isPoster) {
    const updates = {
      full_name: formData.get("full_name"),
      vibhaaga: formData.get("vibhaaga"), 
      khanda: formData.get("khanda"),
      avatar_url: formData.get("avatar_url") || formData.get("company_logo"), // Fallback to company logo
      // Detailed Employer Fields
      company_name: formData.get("company_name"),
      company_website: formData.get("company_website"),
      company_logo: formData.get("company_logo"),
      designation: formData.get("designation"),
      company_size: formData.get("company_size"),
      industry: formData.get("industry"),
      phone: formData.get("phone"),
      first_login: false,
      status: 'active'
    }

    const { error } = await supabaseAdmin.from("job_posters").update(updates).eq("id", user.id)
    if (error) {
      console.error("Onboarding Error:", error)
      return { success: false, error: "Failed to save profile." }
    }
    revalidatePath("/dashboard")
    return { success: true, redirect: "/dashboard/poster" }
  }

  return { success: false, error: "User profile record not found." }
}