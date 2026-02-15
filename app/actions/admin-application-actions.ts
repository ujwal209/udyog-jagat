"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function getAdminApplications() {
  console.log("🔍 [SERVER] Starting Application Fetch...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.error("❌ [SERVER] No User Logged In")
      return { success: false, error: "Unauthorized" }
    }

    console.log(`👤 [SERVER] User ID: ${user.id}`)

    // 1. Fetch Jobs created by this admin
    const { data: jobs, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, title")
      .eq("created_by", user.id)

    if (jobError) {
      console.error("❌ [SERVER] Job Fetch Error:", jobError.message)
      return { success: false, error: jobError.message }
    }

    const jobIds = jobs?.map(j => j.id) || []
    console.log(`📋 [SERVER] Found ${jobIds.length} jobs posted by this admin.`)

    if (jobIds.length === 0) {
      console.warn("⚠️ [SERVER] No jobs found. Returning empty list.")
      return { success: true, data: [] }
    }

    // 2. Fetch Applications for those jobs
    // We explicitly join candidates and jobs to get the details
    const { data: applications, error: appError } = await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        candidate_id,
        job_id,
        candidates (
          id,
          full_name,
          email,
          avatar_url
        ),
        jobs (
          id,
          title,
          location
        )
      `)
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false })

    if (appError) {
      console.error("❌ [SERVER] Application DB Error:", appError.message)
      return { success: false, error: "Failed to fetch applications" }
    }

    // 3. Map data to ensure flat structure for UI
    // Sometimes Supabase returns arrays for joins, we flatten them here
    const formattedApps = applications?.map((app: any) => ({
      id: app.id,
      status: app.status,
      applied_at: app.applied_at,
      candidate: Array.isArray(app.candidates) ? app.candidates[0] : app.candidates,
      job: Array.isArray(app.jobs) ? app.jobs[0] : app.jobs
    }))

    console.log(`✅ [SERVER] Successfully fetched ${formattedApps?.length || 0} applications.`)
    return { success: true, data: formattedApps }

  } catch (err: any) {
    console.error("❌ [SERVER] Critical Error:", err.message)
    return { success: false, error: err.message }
  }
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
  try {
    const { error } = await supabaseAdmin
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId)

    if (error) throw error

    revalidatePath("/dashboard/admin/applications")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}