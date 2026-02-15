"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export async function getPosterSidebarDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch the Poster's profile details
  const { data } = await supabaseAdmin
    .from("job_posters")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .single()

  return data
}