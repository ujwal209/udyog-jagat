"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export type ApplicationFilter = {
  jobId?: string
  status?: string
  search?: string
}

// --- FETCH APPLICATIONS ---
export async function getReferrerApplicationsAction(filters: ApplicationFilter = {}) {
  console.log("🔍 [SERVER] Fetching Applications...", filters)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // 1. Get IDs of jobs created by this referrer
    const { data: myJobs, error: jobError } = await supabaseAdmin
      .from("jobs")
      .select("id, title")
      .eq("created_by", user.id)

    if (jobError || !myJobs || myJobs.length === 0) {
      console.log("⚠️ [SERVER] No jobs found for user")
      return []
    }

    const myJobIds = myJobs.map(j => j.id)

    // 2. Build Query
    let query = supabaseAdmin
      .from("applications")
      .select(`
        id,
        status,
        applied_at,
        job:jobs!inner (id, title, location),
        candidate:candidates!inner (id, full_name, email, avatar_url, resume_url, phone)
      `)
      .in("job_id", myJobIds)
      .order("applied_at", { ascending: false })

    // 3. Apply Filters
    if (filters.jobId && filters.jobId !== "all") {
      query = query.eq("job_id", filters.jobId)
    }

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status)
    }

    // 4. Execute
    const { data, error } = await query

    if (error) {
      console.error("❌ [SERVER] Application Fetch Error:", error)
      return []
    }

    // 5. Client-side search filtering (Supabase generic search is limited on joins)
    let applications = data || []
    
    if (filters.search) {
      const term = filters.search.toLowerCase()
      applications = applications.filter((app: any) => 
        app.candidate.full_name.toLowerCase().includes(term) ||
        app.candidate.email.toLowerCase().includes(term)
      )
    }

    return { applications, jobs: myJobs }

  } catch (err: any) {
    console.error("❌ [SERVER] Critical Error:", err)
    return { applications: [], jobs: [] }
  }
}

// --- UPDATE STATUS ---
export async function updateApplicationStatusAction(applicationId: string, newStatus: string) {
  console.log("🚀 [SERVER] Updating Status:", applicationId, newStatus)

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // Verify ownership: Ensure the application belongs to a job created by this user
    // We do this by checking if the job associated with the application was created by user.id
    // But for speed, we can trust the update policy or do a double check. 
    // Here is a strict check:
    
    const { data: appData, error: fetchError } = await supabaseAdmin
      .from("applications")
      .select("job:jobs(created_by)")
      .eq("id", applicationId)
      .single()

    if (fetchError || !appData || (appData.job as any).created_by !== user.id) {
       return { success: false, error: "Permission denied" }
    }

    // Update
    const { error } = await supabaseAdmin
      .from("applications")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", applicationId)

    if (error) throw error

    revalidatePath("/dashboard/referrer/applications")
    return { success: true }

  } catch (err: any) {
    console.error("❌ [SERVER] Update Error:", err)
    return { success: false, error: err.message }
  }
}