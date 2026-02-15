"use server"

import { createClient } from "@/utils/supabase/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function createPosterJobAction(formData: FormData, logoUrl: string) {
  console.log("🚀 [POSTER-JOB-ACTION] Initializing Create...");
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Authentication required" }
    }

    // 1. Extract Form Data
    const title = formData.get("title") as string
    const location = formData.get("location") as string
    const department = formData.get("category") as string // Maps to 'department' in DB
    const type = formData.get("type") as string
    const salary_range = formData.get("salary") as string
    
    // 2. Merge Description & Requirements (Since DB only has description)
    const rawDesc = formData.get("description") as string
    const rawReqs = formData.get("requirements") as string
    
    let finalDescription = rawDesc;
    if (rawReqs) {
      finalDescription = `${rawDesc}\n\n<h3>Key Requirements</h3>\n${rawReqs}`
    }

    console.log(`📝 [POSTER-JOB-ACTION] User: ${user.id} | Job: ${title}`);

    // 3. Insert strictly according to Schema
    const { data, error } = await supabaseAdmin
      .from("jobs")
      .insert({
        created_by: user.id,
        title: title,
        department: department,      // Fixed: Mapped to department
        type: type,
        location: location,
        salary_range: salary_range,  // Fixed: Mapped to salary_range
        company_logo_url: logoUrl,   // Fixed: Mapped to company_logo_url
        description: finalDescription, 
        status: 'active'
        // Note: 'city', 'state', 'hiring_manager', 'contact_email' are nullable and left empty for now
      })
      .select()

    if (error) {
      console.error("❌ [POSTER-JOB-ACTION] DB Error:", error.message)
      return { success: false, error: `Database Error: ${error.message}` }
    }

    console.log("✅ [POSTER-JOB-ACTION] Success. Job ID:", data[0].id)
    
    revalidatePath("/dashboard/poster/my-jobs")
    return { success: true }

  } catch (err: any) {
    console.error("🔥 [POSTER-JOB-ACTION] Critical Failure:", err.message)
    return { success: false, error: "An internal server error occurred" }
  }
}