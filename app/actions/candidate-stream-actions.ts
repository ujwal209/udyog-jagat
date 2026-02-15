"use server"

import { StreamChat } from 'stream-chat';
import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

const serverClient = StreamChat.getInstance(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_API_SECRET!
);

export async function getChattableReferrersAction() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // FIX: Select ALL needed fields
    const { data: referrers, error } = await supabaseAdmin
      .from("referrers")
      .select("id, full_name, avatar_url, email, company_name, linkedin_url, phone") 
      .order("full_name", { ascending: true });

    if (error) {
      console.error("❌ Error fetching referrers:", error.message);
      return [];
    }

    // Map for frontend
    return referrers?.map(r => ({
      ...r,
      company: r.company_name, // Map company_name to company
      linkedin: r.linkedin_url // Map linkedin_url to linkedin
    })) || [];
  } catch (err: any) {
    console.error("❌ Critical Error:", err.message);
    return [];
  }
}

export async function syncReferrerToStreamAction(referrerId: string) {
  try {
    const { data: referrer, error } = await supabaseAdmin
      .from("referrers")
      .select("id, full_name, avatar_url, company_name, email, linkedin_url, phone") 
      .eq("id", referrerId)
      .single();
  
    if (error || !referrer) throw new Error("Referrer not found");
  
    // Upsert with FULL details
    await serverClient.upsertUser({
      id: referrer.id,
      name: referrer.full_name,
      image: referrer.avatar_url || "",
      // Custom fields
      company: referrer.company_name || "",
      email: referrer.email || "",
      linkedin: referrer.linkedin_url || "",
      phone: referrer.phone || ""
    });
  
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}