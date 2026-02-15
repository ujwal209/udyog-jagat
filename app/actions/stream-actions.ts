"use server"

import { StreamChat } from 'stream-chat';
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export async function getStreamTokenAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    let name = "User";
    let image = "";
    let role = "user";
    let company = "";
    let email = user.email || "";

    // 1. Try finding user in CANDIDATES table
    const { data: candidate } = await supabaseAdmin
      .from("candidates")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (candidate) {
      name = candidate.full_name;
      image = candidate.avatar_url || "";
      role = "candidate";
    } else {
      // 2. If not candidate, try REFERRERS table
      // FIX: Use 'company_name' and 'email'
      const { data: referrer } = await supabaseAdmin
        .from("referrers")
        .select("full_name, avatar_url, company_name, email")
        .eq("id", user.id)
        .single();
      
      if (referrer) {
        name = referrer.full_name;
        image = referrer.avatar_url || "";
        role = "referrer";
        company = referrer.company_name || "";
        email = referrer.email || email;
      } else {
        name = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
        image = user.user_metadata?.avatar_url || "";
      }
    }

    // 4. Upsert with extra fields
    await serverClient.upsertUser({
      id: user.id,
      name: name,
      image: image,
      role: 'user', 
      custom: {
        app_role: role,
        company: company,
        email: email
      }
    });

    return { 
      token: serverClient.createToken(user.id), 
      userId: user.id, 
      userName: name, 
      userImage: image 
    };

  } catch (err) {
    console.error("❌ [SERVER] Token Error:", err);
    return null;
  }
}

// Keep existing getChattableCandidatesAction and syncCandidateToStreamAction...
export async function getChattableCandidatesAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabaseAdmin
      .from("applications")
      .select(`
        candidate_id,
        candidate:candidates!inner (id, full_name, avatar_url, email, phone, address, resume_url),
        jobs!inner (created_by)
      `)
      .eq("jobs.created_by", user.id);

    if (error) throw error;

    const uniqueMap = new Map();
    data.forEach((item: any) => {
      if (item.candidate) uniqueMap.set(item.candidate.id, item.candidate);
    });

    return Array.from(uniqueMap.values());
  } catch (err) {
    console.error("❌ [SERVER] Fetch Candidates Error:", err);
    return [];
  }
}

export async function syncCandidateToStreamAction(candidateId: string) {
  try {
    // FIX: Select extra fields
    const { data: candidate, error } = await supabaseAdmin
      .from("candidates")
      .select("id, full_name, avatar_url, email, phone, address, resume_url")
      .eq("id", candidateId)
      .single();

    if (error || !candidate) throw new Error("Candidate not found in DB");

    // Upsert with custom fields
    await serverClient.upsertUser({
      id: candidate.id,
      name: candidate.full_name,
      image: candidate.avatar_url || "",
      // Custom data
      email: candidate.email || "",
      phone: candidate.phone || "",
      address: candidate.address || "",
      resume_url: candidate.resume_url || ""
    });

    return { success: true };
  } catch (err: any) {
    console.error("❌ [SERVER] Sync Error:", err.message);
    return { success: false, error: err.message };
  }
}