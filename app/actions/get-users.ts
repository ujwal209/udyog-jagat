"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function getAllUsersAction() {
  try {
    // 1. Fetch Candidates
    const { data: candidates } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, email, avatar_url, status")
    
    // 2. Fetch Referrers
    const { data: referrers } = await supabaseAdmin
      .from("referrers")
      .select("id, full_name, email, avatar_url, status")

    // 3. Fetch Admins
    const { data: admins } = await supabaseAdmin
      .from("admins")
      .select("id, full_name, email, avatar_url")

    // 4. Fetch Job Posters
    const { data: posters } = await supabaseAdmin
      .from("job_posters")
      .select("id, full_name, email, avatar_url, status")

    // 5. Combine and Tag
    const allUsers = [
      ...(candidates || []).map(u => ({ ...u, type: 'Candidate' })),
      ...(referrers || []).map(u => ({ ...u, type: 'Referrer' })),
      ...(admins || []).map(u => ({ ...u, type: 'Admin' })),
      ...(posters || []).map(u => ({ ...u, type: 'Job Poster' }))
    ]

    return { success: true, data: allUsers }
  } catch (error: any) {
    console.error("Fetch Users Error:", error)
    return { success: false, error: "Failed to load users" }
  }
}

export async function softDeleteUserAction(userId: string, userType: string) {
  let table = ""
  if (userType === "Candidate") table = "candidates"
  else if (userType === "Referrer") table = "referrers"
  else if (userType === "Job Poster") table = "job_posters"
  else return { success: false, error: "Invalid user type for deletion" }

  try {
    const { error } = await supabaseAdmin
      .from(table)
      .update({ status: 'deleted' })
      .eq("id", userId)

    if (error) throw error
    revalidatePath("/dashboard/admin/my-users")
    return { success: true }
  } catch (error: any) {
    console.error("Soft Delete User Error:", error)
    return { success: false, error: error.message }
  }
}

export async function restoreUserAction(userId: string, userType: string) {
  let table = ""
  if (userType === "Candidate") table = "candidates"
  else if (userType === "Referrer") table = "referrers"
  else if (userType === "Job Poster") table = "job_posters"
  else return { success: false, error: "Invalid user type for restore" }

  try {
    const { error } = await supabaseAdmin
      .from(table)
      .update({ status: 'active' }) // Assuming 'active' is the default/active status
      .eq("id", userId)

    if (error) throw error
    revalidatePath("/dashboard/admin/my-users")
    return { success: true }
  } catch (error: any) {
    console.error("Restore User Error:", error)
    return { success: false, error: error.message }
  }
}