"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- FETCH JOBS WITH USER STATUS ---
export async function getJobsWithStatusAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Fetch Active Jobs
  const { data: jobs } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (!jobs) return []

  // 2. Fetch Applications
  const { data: apps } = await supabaseAdmin
    .from("applications")
    .select("job_id, id, status")
    .eq("candidate_id", user.id)

  // 3. Fetch Saved Jobs
  const { data: saved } = await supabaseAdmin
    .from("saved_jobs")
    .select("job_id")
    .eq("candidate_id", user.id)

  const savedSet = new Set(saved?.map(s => s.job_id))

  // 4. Merge
  return jobs.map((job) => {
    const app = apps?.find((a) => a.job_id === job.id)
    return {
      ...job,
      application_id: app ? app.id : null,
      is_saved: savedSet.has(job.id) // New Field
    }
  })
}

// --- WITHDRAW APPLICATION ---
export async function withdrawApplicationAction(applicationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { success: false, error: "Unauthorized" }

  const { error } = await supabaseAdmin
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("candidate_id", user.id) // Security check

  if (error) return { success: false, error: "Failed to withdraw" }
  
  revalidatePath("/dashboard/candidate/jobs")
  return { success: true }
}

// --- APPLY (Re-exporting/Using existing logic) ---
export async function applyToJobAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  const { data, error } = await supabaseAdmin
    .from("applications")
    .insert({ job_id: jobId, candidate_id: user.id })
    .select("id")
    .single()

  if (error) return { success: false, error: error.message }
  
  revalidatePath("/dashboard/candidate/jobs")
  return { success: true, applicationId: data.id }
}


// --- TOGGLE SAVE JOB ---
export async function toggleSaveJobAction(jobId: string, isCurrentlySaved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Unauthorized" }

  if (isCurrentlySaved) {
    // Unsave
    const { error } = await supabaseAdmin
      .from("saved_jobs")
      .delete()
      .eq("candidate_id", user.id)
      .eq("job_id", jobId)
    
    if (error) return { success: false, error: "Failed to remove" }
    return { success: true, saved: false }
  } else {
    // Save
    const { error } = await supabaseAdmin
      .from("saved_jobs")
      .insert({ candidate_id: user.id, job_id: jobId })

    if (error) return { success: false, error: "Failed to save" }
    return { success: true, saved: true }
  }
}