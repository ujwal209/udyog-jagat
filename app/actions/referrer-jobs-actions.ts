"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- FETCH JOBS ---
export async function getReferrerJobsAction() {
  console.log("🔍 [SERVER] Fetching Referrer Jobs...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Fetch jobs created by this user
    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select(`
        *,
        applications (count)
      `)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [SERVER] Fetch Error:", error)
      return []
    }

    // Transform data to include applicant count safely
    return jobs.map((job) => ({
      ...job,
      applicant_count: job.applications?.[0]?.count || 0
    }))

  } catch (err) {
    console.error("❌ [SERVER] Critical Error:", err)
    return []
  }
}

// --- DELETE JOB ---
export async function deleteJobAction(jobId: string) {
  console.log("🗑️ [SERVER] Deleting Job:", jobId)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    const { error } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("id", jobId)
      .eq("created_by", user.id) // Security check

    if (error) throw error

    revalidatePath("/dashboard/referrer/jobs")
    return { success: true }
  } catch (err: any) {
    console.error("❌ [SERVER] Delete Error:", err)
    return { success: false, error: "Failed to delete job" }
  }
}

// --- TOGGLE STATUS (Active/Closed) ---
export async function toggleJobStatusAction(jobId: string, currentStatus: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: "Unauthorized" }

    const newStatus = currentStatus === "active" ? "closed" : "active"

    const { error } = await supabaseAdmin
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)
      .eq("created_by", user.id)

    if (error) throw error

    revalidatePath("/dashboard/referrer/jobs")
    return { success: true, status: newStatus }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function getJobByIdAction(jobId: string) {
  console.log("🔍 [SERVER] Fetching Job:", jobId)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .eq("created_by", user.id) // Security: Ensure ownership
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

// --- UPDATE JOB ---
export async function updateJobAction(jobId: string, formData: FormData) {
  console.log("🚀 [SERVER] Updating Job:", jobId)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Extract Data
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
      .eq("created_by", user.id) // Security check

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