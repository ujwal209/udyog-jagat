"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getPosterDashboardData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Fetch Poster Details (for Org Info)
    const { data: poster } = await supabaseAdmin
      .from("job_posters")
      .select("full_name, vibhaaga, khanda, valaya, milan")
      .eq("id", user.id)
      .single()

    // 2. Fetch Job Stats
    const { data: jobs } = await supabaseAdmin
      .from("jobs")
      .select("id, status, title, created_at")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })

    const activeJobs = jobs?.filter(j => j.status === 'active').length || 0
    const totalJobs = jobs?.length || 0

    // 3. Fetch Application Stats (Linked to these jobs)
    const jobIds = jobs?.map(j => j.id) || []
    let totalApplicants = 0
    let pendingReview = 0

    if (jobIds.length > 0) {
      const { data: apps } = await supabaseAdmin
        .from("applications")
        .select("status")
        .in("job_id", jobIds)

      totalApplicants = apps?.length || 0
      pendingReview = apps?.filter(a => a.status === 'applied' || a.status === 'pending').length || 0
    }

    return {
      success: true,
      data: {
        poster,
        stats: { activeJobs, totalJobs, totalApplicants, pendingReview },
        recentJobs: jobs?.slice(0, 4) || [] // Top 4 recent jobs
      }
    }

  } catch (error: any) {
    console.error("Dashboard Fetch Error:", error)
    return { success: false, error: "Failed to load dashboard" }
  }
}