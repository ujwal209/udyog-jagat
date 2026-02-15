"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

// --- 1. CREATE JOB ---
export async function createJobAction(formData: FormData) {
  console.log("🚀 [SERVER] Creating Job...")

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const title = formData.get("title") as string
    const department = formData.get("department") as string
    const location = formData.get("location") as string
    const type = formData.get("type") as string
    const salary_range = formData.get("salary_range") as string
    const description = formData.get("description") as string
    const hiring_manager = formData.get("hiring_manager") as string
    const company_logo_url = formData.get("company_logo_url") as string

    // Insert
    const { error } = await supabaseAdmin
      .from("jobs")
      .insert({
        title,
        department,
        location,
        type,
        salary_range,
        description,
        hiring_manager,
        company_logo_url,
        created_by: user.id, // Links job to the logged-in referrer
        status: "active",
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error("❌ [SERVER] Create Error:", error)
      return { success: false, error: "Failed to post job: " + error.message }
    }

    console.log("✅ [SERVER] Job Posted")
    
  } catch (err: any) {
    console.error("❌ [SERVER] Critical Error:", err)
    return { success: false, error: "Server error: " + err.message }
  }

  revalidatePath("/dashboard/referrer/jobs")
  redirect("/dashboard/referrer/jobs")
}

// --- 2. GET JOB BY ID (Fix for your Build Error) ---
export async function getJobByIdAction(jobId: string) {
  console.log("🔍 [SERVER] Fetching Job:", jobId)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch job ensuring it belongs to the current user
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("created_by", user.id) 
      .single()

    if (error) {
      console.error("❌ [SERVER] Fetch Error:", error)
      return null
    }

    return data
  } catch (err) {
    console.error("❌ [SERVER] Critical Fetch Error:", err)
    return null
  }
}

// --- 3. UPDATE JOB ---
export async function updateJobAction(jobId: string, formData: FormData) {
  console.log("🚀 [SERVER] Updating Job:", jobId)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const title = formData.get("title") as string
    const department = formData.get("department") as string
    const location = formData.get("location") as string
    const type = formData.get("type") as string
    const salary_range = formData.get("salary_range") as string
    const description = formData.get("description") as string
    const hiring_manager = formData.get("hiring_manager") as string
    const company_logo_url = formData.get("company_logo_url") as string

    // Update
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({
        title,
        department,
        location,
        type,
        salary_range,
        description,
        hiring_manager,
        company_logo_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId)
      .eq("created_by", user.id) // Ensure ownership

    if (error) {
      console.error("❌ [SERVER] Update Error:", error)
      return { success: false, error: "Update failed: " + error.message }
    }

    console.log("✅ [SERVER] Job Updated")
    revalidatePath("/dashboard/referrer/jobs")
    return { success: true }

  } catch (err: any) {
    console.error("❌ [SERVER] Critical Error:", err)
    return { success: false, error: "Server error: " + err.message }
  }
}