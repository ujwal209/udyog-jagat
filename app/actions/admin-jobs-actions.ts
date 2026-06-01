"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

// 1. Get All Jobs for Admin
export async function getAllJobsAdminAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  // Verify Admin
  const { data: admin } = await supabaseAdmin.from("admins").select("id").eq("id", user.id).single()
  if (!admin) return { success: false, error: "Unauthorized" }

  const { data: jobs, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Admin Jobs Error:", error)
    return { success: false, error: error.message }
  }

  // Manually fetch and join job_posters since PostgREST can't find the foreign key relation
  const posterIds = Array.from(new Set(jobs?.map(j => j.created_by) || []))
  const { data: posters } = await supabaseAdmin
    .from("job_posters")
    .select("id, full_name, company_name, avatar_url, email, phone")
    .in("id", posterIds)

  const posterMap = new Map()
  posters?.forEach(p => posterMap.set(p.id, p))

  const enrichedJobs = jobs?.map(j => ({
    ...j,
    job_posters: posterMap.get(j.created_by) || null
  }))

  return { success: true, data: enrichedJobs }
}

// 2. Delete Job as Admin
export async function deleteJobAdminAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  // Verify Admin
  const { data: admin } = await supabaseAdmin.from("admins").select("id").eq("id", user.id).single()
  if (!admin) return { success: false, error: "Unauthorized" }

  const { error } = await supabaseAdmin
    .from("jobs")
    .update({ status: 'deleted' })
    .eq("id", jobId)

  if (error) {
    console.error("Admin Job Delete Error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/admin/posted-jobs")
  return { success: true }
}

// 3. Restore Job as Admin
export async function restoreJobAdminAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const { data: admin } = await supabaseAdmin.from("admins").select("id").eq("id", user.id).single()
  if (!admin) return { success: false, error: "Unauthorized" }

  const { error } = await supabaseAdmin
    .from("jobs")
    .update({ status: 'active' })
    .eq("id", jobId)

  if (error) {
    console.error("Admin Job Restore Error:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/dashboard/admin/posted-jobs")
  return { success: true }
}
