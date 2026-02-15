"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export type ApplicationStatus = 'applied' | 'interviewing' | 'selected' | 'rejected'

export async function getPosterApplicationsAction() {
  console.log("🔍 [APPLICATIONS] Fetching candidate data...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Fetch job IDs
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from("jobs")
      .select("id")
      .eq("created_by", user.id)

    if (jobsError || !jobs) {
      return { success: false, error: "Failed to verify jobs" }
    }

    const jobIds = jobs.map(j => j.id)

    if (jobIds.length === 0) {
      return { success: true, data: [] }
    }

    // 2. Fetch applications with RESUME_URL included
    const { data: applications, error: appError } = await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,
        applied_at, 
        job_id,
        jobs (title, location),
        candidate_id,
        candidates (full_name, email, avatar_url, phone, resume_url) 
      `) 
      .in("job_id", jobIds)
      .order("applied_at", { ascending: false })

    if (appError) {
      console.error("❌ [APPLICATIONS] DB Error:", appError.message)
      return { success: false, error: "Failed to load applications" }
    }

    return { success: true, data: applications }

  } catch (err: any) {
    return { success: false, error: "Internal server error" }
  }
}

export async function updateApplicationStatusAction(appId: string, newStatus: ApplicationStatus) {
  try {
    const { error } = await supabaseAdmin
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId)

    if (error) throw error

    revalidatePath("/dashboard/poster/applications")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: "Failed to update status" }
  }
}