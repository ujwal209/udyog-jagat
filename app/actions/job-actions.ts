"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- 1. POST JOB (Create) ---
export async function postJobAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Construct Salary Range
  const salaryMin = formData.get("salary_min");
  const salaryMax = formData.get("salary"); // Note: Input name was 'salary' in Post page
  const salary_range = (salaryMin || salaryMax) ? `${salaryMin || '0'} - ${salaryMax || '0'} LPA` : null;

  try {
    const { error } = await supabaseAdmin.from("jobs").insert({
      title: formData.get("title"),
      department: formData.get("department"),
      type: formData.get("type"),
      description: formData.get("description"),
      
      // Location
      location: formData.get("location"), // Address field
      city: formData.get("city"),
      state: formData.get("state"),
      
      // Contact & Branding
      hiring_manager: formData.get("hiring_manager"), // If you added this to Post Page
      contact_email: formData.get("contact_email"),   // If you added this to Post Page
      company_logo_url: formData.get("company_logo_url"), // New Field
      
      salary_range,
      status: "active",
      created_by: user.id
    });

    if (error) throw error;

    revalidatePath("/dashboard/admin/posted-jobs");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- 2. UPDATE JOB (Edit) ---
export async function updateJobAction(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Construct Salary Range
  const salaryMin = formData.get("salary_min");
  const salaryMax = formData.get("salary_max");
  let salary_range = null;
  if (salaryMin || salaryMax) {
    salary_range = `${salaryMin || '0'} - ${salaryMax || '0'} LPA`;
  }

  try {
    const { error } = await supabaseAdmin
      .from("jobs")
      .update({
        title: formData.get("title"),
        department: formData.get("department"),
        type: formData.get("type"),
        description: formData.get("description"),
        
        // Location
        location: formData.get("location"),
        city: formData.get("city"),
        state: formData.get("state"),
        
        // Contact & Branding
        hiring_manager: formData.get("hiring_manager"),
        contact_email: formData.get("contact_email"),
        company_logo_url: formData.get("company_logo_url"), // New Field
        
        status: formData.get("status"),
        
        // Only update salary if new values are provided
        ...(salary_range && { salary_range }),
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("created_by", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/admin/posted-jobs");
    revalidatePath(`/dashboard/admin/edit-job/${id}`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ... keep getJobById and deleteJobAction as they were ...
export async function getJobById(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();
    
  return data;
}

export async function deleteJobAction(jobId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  await supabaseAdmin.from("jobs").delete().eq("id", jobId).eq("created_by", user.id);
  revalidatePath("/dashboard/admin/posted-jobs");
  return { success: true };
}

// ... keep getMyPostedJobs as is ...
export async function getMyPostedJobs() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  
  const { data } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });
    
  return data || [];
}