"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function getJobForEditAction(jobId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("created_by", user.id) // Security check
    .single()

  if (error) return { success: false, error: "Job not found" }
  return { success: true, data }
}

export async function updateJobAction(jobId: string, formData: FormData, logoUrl?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Unauthorized" }

  const title = formData.get("title") as string
  const location = formData.get("location") as string
  const department = formData.get("category") as string
  const type = formData.get("type") as string
  const salary_range = formData.get("salary") as string
  const description = formData.get("description") as string
  const requirements = formData.get("requirements") as string

  // Logic to merge requirements if they were split in the UI
  // Note: If you want to keep them separate in the UI but stored together, handle it here.
  // For editing, we usually just update the description field directly if the user edited the big text block.
  // Assuming the UI fills 'description' with the full html/text.

  try {
    const updateData: any = {
      title,
      department,
      type,
      location,
      salary_range,
      description, // The UI should send the full description
      updated_at: new Date().toISOString()
    }

    if (logoUrl) {
      updateData.company_logo_url = logoUrl
    }

    const { error } = await supabaseAdmin
      .from("jobs")
      .update(updateData)
      .eq("id", jobId)
      .eq("created_by", user.id)

    if (error) throw error

    revalidatePath("/dashboard/poster/my-jobs")
    revalidatePath(`/dashboard/poster/edit-job/${jobId}`)
    return { success: true }

  } catch (err: any) {
    return { success: false, error: err.message }
  }
}