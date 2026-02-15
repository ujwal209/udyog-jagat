"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin" 
import { revalidatePath } from "next/cache"

export async function getCandidateDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: candidate, error } = await supabaseAdmin
    .from("candidates")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Admin Fetch Error:", error)
    return null
  }

  const stats = {
    totalApplications: 0,
    interviews: 0,
    profileViews: 0,
    activeApplications: 0
  }

  const recentApplications: any[] = [] 

  return { candidate, stats, recentApplications }
}

export async function getJobsAction() {
  const { data: jobs, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Fetch Jobs Error:", error)
    return []
  }

  return jobs || []
}

// --- UPDATED: Now checks for application status ---
export async function getJobDetailsAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 1. Fetch the main job
  const { data: job, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single()

  if (error || !job) return null

  // 2. Fetch related jobs
  const { data: related } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("department", job.department)
    .neq("id", jobId)
    .eq("status", "active")
    .limit(3)

  // 3. Check if current user has applied
  let hasApplied = false
  if (user) {
    const { data: application } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("candidate_id", user.id)
      .maybeSingle()
    
    if (application) {
      hasApplied = true
    }
  }

  return { job, related: related || [], hasApplied }
}

export async function applyForJobAction(jobId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Verify Profile
    const { data: candidate } = await supabaseAdmin
      .from("candidates")
      .select("id")
      .eq("id", user.id)
      .single()

    if (!candidate) return { success: false, error: "Profile not found" }

    // 2. Double-check duplicate
    const { data: existing } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq("candidate_id", user.id)
      .maybeSingle()

    if (existing) return { success: false, error: "Already applied" }

    // 3. Insert Application
    const { error } = await supabaseAdmin
      .from("applications")
      .insert({
        job_id: jobId,
        candidate_id: user.id,
        status: "pending",
        applied_at: new Date().toISOString()
      })

    if (error) throw error

    // 4. Revalidate cache so the page updates immediately
    revalidatePath(`/dashboard/candidate/jobs/${jobId}`)
    
    return { success: true }

  } catch (error: any) {
    console.error("Apply Error:", error.message)
    return { success: false, error: "Failed to submit application." }
  }
}