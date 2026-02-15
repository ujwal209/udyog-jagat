"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function getPosterJobsAction() {
  console.log("🔍 [MY-JOBS] Fetching listings...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Fetch jobs including the logo url and applicant count
    const { data: jobs, error } = await supabaseAdmin
      .from("jobs")
      .select(`
        *,
        applications (count)
      `)
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("❌ [MY-JOBS] DB Error:", error.message)
      return { success: false, error: "Failed to load jobs" }
    }

    // Format data
    const formattedJobs = jobs.map((job: any) => ({
      ...job,
      applicant_count: job.applications?.[0]?.count || 0
    }))

    console.log(`✅ [MY-JOBS] Found ${formattedJobs.length} listings.`)
    return { success: true, data: formattedJobs }

  } catch (err: any) {
    console.error("🔥 [MY-JOBS] Critical Error:", err.message)
    return { success: false, error: "Internal server error" }
  }
}

export async function toggleJobStatusAction(jobId: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'closed' : 'active'
  console.log(`🔄 [MY-JOBS] Toggling Job ${jobId} to ${newStatus}`)

  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({ status: newStatus })
      .eq("id", jobId)

    if (error) throw error

    revalidatePath("/dashboard/poster/my-jobs")
    return { success: true, newStatus }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteJobAction(jobId: string) {
  console.log(`🗑️ [MY-JOBS] Deleting Job ${jobId}`)
  
  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .delete()
      .eq("id", jobId)

    if (error) throw error

    revalidatePath("/dashboard/poster/my-jobs")
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}