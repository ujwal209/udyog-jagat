"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getReferrerDashboardData() {
  console.log("📊 [SERVER] Fetching Referrer Dashboard Data...")
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // 1. Fetch Referrer Profile
    const { data: referrer } = await supabaseAdmin
      .from("referrers")
      .select("*")
      .eq("id", user.id)
      .single()

    // 2. Fetch ALL Job IDs for this referrer (to get total candidates)
    const { data: allUserJobs } = await supabaseAdmin
      .from("jobs")
      .select("id, status")
      .eq("created_by", user.id)

    const jobIds = allUserJobs?.map(j => j.id) || []
    const activeJobsCount = allUserJobs?.filter(j => j.status === 'active').length || 0

    // 3. Get Total Candidate Count across all jobs
    const { count: totalCandidates } = jobIds.length > 0 
      ? await supabaseAdmin
          .from("applications")
          .select("id", { count: 'exact', head: true })
          .in("job_id", jobIds)
      : { count: 0 }

    // 4. Fetch Recent Jobs (including company logo)
    const { data: recentJobs } = await supabaseAdmin
      .from("jobs")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // 5. Fetch Recent Applications (Proper Joining)
    // We join candidates for avatar and jobs for the company logo/title
    const { data: recentApplications, error: appError } = jobIds.length > 0
      ? await supabaseAdmin
          .from("applications")
          .select(`
            id,
            status,
            applied_at,
            candidate:candidates!inner (
              full_name, 
              avatar_url
            ),
            job:jobs!inner (
              title,
              company_logo_url
            )
          `)
          .in("job_id", jobIds)
          .order("applied_at", { ascending: false })
          .limit(5)
      : { data: [], error: null }

    if (appError) console.error("❌ [SERVER] Application Fetch Error:", appError)

    return {
      referrer,
      stats: {
        activeJobs: activeJobsCount,
        totalCandidates: totalCandidates || 0,
        interviewsScheduled: 0 
      },
      recentJobs: recentJobs || [],
      recentApplications: recentApplications || []
    }

  } catch (err) {
    console.error("❌ [SERVER] Critical Dashboard Error:", err)
    return null
  }
}