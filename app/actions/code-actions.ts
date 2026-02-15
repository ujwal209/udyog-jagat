"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

/**
 * Extend code expiry by a custom number of days
 */
export async function extendCodeExpiryAction(codeId: string, days: number) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: "Unauthorized" }

    // 1. Fetch current code
    const { data: currentCode } = await supabaseAdmin
      .from("referral_codes")
      .select("expires_at")
      .eq("id", codeId)
      .single()

    if (!currentCode) return { success: false, error: "Code not found" }

    // 2. Calculate New Date
    // If expired, start from NOW. If active, add to current expiry.
    const now = new Date()
    const currentExpiry = new Date(currentCode.expires_at)
    
    const baseDate = currentExpiry < now ? now : currentExpiry
    const newExpiry = new Date(baseDate)
    newExpiry.setDate(newExpiry.getDate() + days)

    // 3. Update DB
    const { error } = await supabaseAdmin
      .from("referral_codes")
      .update({ expires_at: newExpiry.toISOString() })
      .eq("id", codeId)

    if (error) throw error

    revalidatePath("/dashboard/admin/access-codes")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function revokeCodeAction(codeId: string) {
  const { error } = await supabaseAdmin
    .from("referral_codes")
    .delete()
    .eq("id", codeId)

  if (error) return { success: false, error: error.message }
  
  revalidatePath("/dashboard/admin/access-codes")
  return { success: true }
}