"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Authenticate User
  const supabase = await createClient(); 
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.error("Login Error:", authError.message);
    redirect("/login?error=Invalid credentials");
  }

  const userId = authData.user.id;

  // 2. Determine Role (Check all tables)
  
  // A. Check Admin Table
  const { data: admin } = await supabaseAdmin
    .from("admins")
    .select("id")
    .eq("id", userId)
    .single();

  if (admin) {
    redirect("/dashboard/admin");
  }

  // B. Check Job Poster Table (NEW)
  const { data: poster } = await supabaseAdmin
    .from("job_posters")
    .select("id")
    .eq("id", userId)
    .single();

  if (poster) {
    redirect("/dashboard/poster");
  }

  // C. Check Referrer Table
  const { data: referrer } = await supabaseAdmin
    .from("referrers")
    .select("id")
    .eq("id", userId)
    .single();

  if (referrer) {
    redirect("/dashboard/referrer");
  }

  // D. Check Candidate Table
  const { data: candidate } = await supabaseAdmin
    .from("candidates")
    .select("id")
    .eq("id", userId)
    .single();

  if (candidate) {
    redirect("/dashboard/candidate");
  }

  // Fallback
  console.error("User authenticated but has no role profile");
  redirect("/login?error=Access Denied: No role assigned");
}