"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getCandidateDashboardData() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log("Dashboard Error: No User Found")
      return null
    }

    // 1. Fetch Candidate Profile
    const { data: candidate, error: profileError } = await supabaseAdmin
      .from("candidates")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !candidate) {
      console.error("Dashboard Error: Candidate Profile Not Found", profileError)
      return null
    }

    // 2. Fetch Applications with Job Details
    // FIX: Changed 'created_at' to 'applied_at'
    const { data: applications, error: appError } = await supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,
        applied_at, 
        job:jobs (
          id,
          title,
          department,
          location,
          company_logo_url
        )
      `)
      .eq("candidate_id", user.id)
      .order("applied_at", { ascending: false }) // FIX: Sort by applied_at

    if (appError) {
      console.error("Dashboard Error: Could not fetch applications", appError)
    }

    const totalApps = applications?.length || 0
    
    // Calculate Stats
    const activeApps = applications?.filter(a => 
      ['applied', 'screening', 'interview'].includes(a.status)
    ).length || 0

    const interviewCount = applications?.filter(a => 
      a.status === 'interview'
    ).length || 0

    return {
      candidate,
      stats: {
        totalApplications: totalApps,
        activeApplications: activeApps,
        interviews: interviewCount,
        profileViews: 14 
      },
      recentApplications: applications?.slice(0, 5).map(app => ({
        ...app,
        created_at: app.applied_at // Map applied_at back to created_at for the UI to read smoothly
      })) || []
    }
  } catch (err) {
    console.error("Dashboard Fatal Error:", err)
    return null
  }
}