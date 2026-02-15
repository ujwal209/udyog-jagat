"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- FETCH SAVED JOBS + STATUS ---
export async function getSavedJobsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Fetch Saved Jobs with details
  const { data: savedJobs, error } = await supabaseAdmin
    .from("saved_jobs")
    .select(`
      id,
      created_at,
      job:jobs (
        id,
        title,
        department,
        type,
        location,
        salary_range,
        company_logo_url,
        created_at
      )
    `)
    .eq("candidate_id", user.id)
    .order("created_at", { ascending: false })

  if (error || !savedJobs) {
    console.error("Fetch Saved Error:", error)
    return []
  }

  // 2. Fetch User's Applications for these jobs to check status
  const jobIds = savedJobs.map((s) => s.job.id)
  
  const { data: applications } = await supabaseAdmin
    .from("applications")
    .select("job_id, status")
    .eq("candidate_id", user.id)
    .in("job_id", jobIds)

  // 3. Merge Status into Result
  return savedJobs.map((item) => {
    const app = applications?.find((a) => a.job_id === item.job.id)
    return {
      ...item,
      application_status: app ? app.status : null // e.g., 'applied', 'interview', etc.
    }
  })
}

// --- REMOVE SAVED JOB ---
export async function removeSavedJobAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const { error } = await supabaseAdmin
    .from("saved_jobs")
    .delete()
    .eq("candidate_id", user.id)
    .eq("job_id", jobId)

  if (error) {
    return { success: false, error: "Failed to remove job" }
  }

  revalidatePath("/dashboard/candidate/saved")
  return { success: true }
}