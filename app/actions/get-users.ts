"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getAllUsersAction() {
  try {
    // 1. Fetch Candidates
    const { data: candidates } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, email, avatar_url")
    
    // 2. Fetch Referrers
    const { data: referrers } = await supabaseAdmin
      .from("referrers")
      .select("id, full_name, email, avatar_url")

    // 3. Fetch Admins
    const { data: admins } = await supabaseAdmin
      .from("admins")
      .select("id, full_name, email, avatar_url")

    // 4. Combine and Tag
    const allUsers = [
      ...(candidates || []).map(u => ({ ...u, type: 'Candidate' })),
      ...(referrers || []).map(u => ({ ...u, type: 'Referrer' })),
      ...(admins || []).map(u => ({ ...u, type: 'Admin' }))
    ]

    return { success: true, data: allUsers }
  } catch (error: any) {
    console.error("Fetch Users Error:", error)
    return { success: false, error: "Failed to load users" }
  }
}