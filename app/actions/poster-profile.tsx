"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function getPosterProfileAction() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const { data, error } = await supabaseAdmin
    .from("job_posters")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) return { success: false, error: error.message }
  
  return { success: true, data }
}

export async function updatePosterProfileAction(formData: FormData, avatarUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const fullName = formData.get("fullName") as string
  const vibhaaga = formData.get("vibhaaga") as string
  const khanda = formData.get("khanda") as string
  const valaya = formData.get("valaya") as string
  const milan = formData.get("milan") as string

  try {
    const updateData: any = {
      full_name: fullName,
      vibhaaga,
      khanda,
      valaya,
      milan,
      updated_at: new Date().toISOString()
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl
    }

    const { error } = await supabaseAdmin
      .from("job_posters")
      .update(updateData)
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/dashboard/poster/profile")
    revalidatePath("/dashboard/poster") // Update sidebar/header
    return { success: true }

  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updatePosterPasswordAction(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get("newPassword") as string
  const confirm = formData.get("confirmPassword") as string

  if (password !== confirm) {
    return { success: false, error: "Passwords do not match" }
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters" }
  }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { success: false, error: error.message }

  return { success: true }
}