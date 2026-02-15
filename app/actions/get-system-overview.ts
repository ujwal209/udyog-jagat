"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getSystemOverviewAction() {
  try {
    // 1. Fetch Admins (No phone in schema)
    const { data: admins, error: adminErr } = await supabaseAdmin
      .from("admins")
      .select("id, full_name, email, avatar_url, created_at, status, department")

    // 2. Fetch Candidates (Has phone in schema)
    const { data: candidates, error: candErr } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, email, phone, avatar_url, created_at, status")

    // 3. Fetch Job Posters (Referrers) (No phone in schema)
    const { data: referrers, error: refErr } = await supabaseAdmin
      .from("job_posters")
      .select("id, full_name, email, avatar_url, created_at, status")

    if (adminErr) console.error("Admin Fetch Error:", adminErr)
    if (candErr) console.error("Candidate Fetch Error:", candErr)
    if (refErr) console.error("Referrer Fetch Error:", refErr)

    // 4. Normalize and Combine Data
    const allUsers = [
      ...(admins?.map(u => ({ ...u, type: 'admin', phone: null, role: 'Administrator' })) || []),
      ...(candidates?.map(u => ({ ...u, type: 'candidate', role: 'Candidate' })) || []), // Phone is preserved here
      ...(referrers?.map(u => ({ ...u, type: 'referrer', phone: null, role: 'Referrer' })) || [])
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 5. Calculate Real-time Stats
    const stats = {
      total: allUsers.length,
      active: allUsers.filter(u => u.status === 'active').length,
      candidates: candidates?.length || 0,
      referrers: referrers?.length || 0,
      admins: admins?.length || 0
    }

    return { success: true, data: allUsers, stats }
  } catch (err: any) {
    console.error("System Overview Failed:", err)
    return { success: false, error: err.message }
  }
}