"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// --- APPLY TO A JOB ---
export async function applyToJobAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  // Check if already applied
  const { data: existing } = await supabaseAdmin
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("candidate_id", user.id)
    .single()

  if (existing) {
    return { success: false, error: "You have already applied to this job." }
  }

  const { error } = await supabaseAdmin
    .from("applications")
    .insert({
      job_id: jobId,
      candidate_id: user.id,
      status: 'applied'
    })

  if (error) {
    console.error("Apply Error:", error)
    return { success: false, error: "Failed to submit application." }
  }

  revalidatePath("/dashboard/candidate/applications")
  revalidatePath("/dashboard/candidate/jobs")
  return { success: true }
}

// --- GET MY APPLICATIONS ---
export async function getMyApplicationsAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Fetch applications and join with Job details
  const { data, error } = await supabaseAdmin
    .from("applications")
    .select(`
      *,
      job:jobs (
        id,
        title,
        department,
        location,
        company_logo_url,
        type,
        salary_range
      )
    `)
    .eq("candidate_id", user.id)
    .order("applied_at", { ascending: false })

  if (error) {
    console.error("Fetch Apps Error:", error)
    return []
  }

  return data
}