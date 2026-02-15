"use server"

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase Admin Client with Service Role Key
// WARNING: Never expose SUPABASE_SERVICE_ROLE_KEY to the client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getReferralCodesAction() {
  try {
    const { data, error } = await supabaseAdmin
      .from("referral_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase Error:", error)
      return []
    }

    return data
  } catch (err) {
    console.error("Server Error:", err)
    return []
  }
}