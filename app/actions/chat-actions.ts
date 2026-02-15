"use server";

import { createClient } from "@/utils/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";

// --- DEBUG LOGGER ---
function log(step: string, data?: any) {
  console.log(`\n🟢 [SERVER ACTION] ${step}:`, data ? JSON.stringify(data, null, 2) : "OK");
}

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// --- DATA FETCHING (EXPANDED) ---
async function fetchDatabaseContext() {
  try {
    // 1. Get Stats
    const { count: candidateCount } = await supabaseAdmin.from("candidates").select("*", { count: 'exact', head: true });
    const { count: jobCount } = await supabaseAdmin.from("jobs").select("*", { count: 'exact', head: true });

    // 2. Get Recent Jobs (INCREASED TO 20)
    // We only select specific columns to keep it fast and lightweight for the AI token limit
    const { data: recentJobs } = await supabaseAdmin
      .from("jobs")
      .select("title, department, location, status, salary_range, created_at")
      .order('created_at', { ascending: false })
      .limit(20); 

    // 3. Get Recent Candidates (INCREASED TO 20)
    const { data: recentCandidates } = await supabaseAdmin
      .from("candidates")
      .select("name, position, status, skills, created_at")
      .order('created_at', { ascending: false })
      .limit(20);

    return `
    === LIVE DATABASE CONTEXT (LAST 20 RECORDS) ===
    - Total Jobs in System: ${jobCount}
    - Total Candidates in System: ${candidateCount}
    
    ### RECENT JOBS LIST:
    ${JSON.stringify(recentJobs, null, 2)}

    ### RECENT CANDIDATES LIST:
    ${JSON.stringify(recentCandidates, null, 2)}
    ===============================================
    `;
  } catch (err: any) {
    console.error("Context Fetch Error:", err);
    return "Error fetching database context.";
  }
}

export async function sendMessageAction(sessionId: string, userContent: string) {
  log("1. Request Received", { sessionId, userContent });

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    // 1. Save User Message
    await supabase.from("chat_messages").insert({ session_id: sessionId, role: "user", content: userContent });

    // 2. PRE-FETCH EXPANDED DATA
    log("2. Fetching Expanded Context...");
    const dbContext = await fetchDatabaseContext();
    log("3. Context Loaded"); 

    // 3. Fetch Chat History
    const { data: history } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(10);

    // 4. System Prompt with DATA INJECTION
    const systemPrompt = `
      You are the Udyog Neural Admin.
      
      You have been provided with a **LIVE SNAPSHOT** of the latest 20 database records below.
      You do not need to search. The data is right here.
      
      ${dbContext}
      
      ### RULES:
      1. Answer questions based ONLY on the context above.
      2. If the user asks "How many...", use the Total counts provided.
      3. If the user asks for a specific job/person, check the JSON lists above.
      4. **YOU CANNOT CREATE OR EDIT DATA.** You are a read-only viewer.
      
      User ID: ${user.id}
    `;

    // 5. One-Shot Call (No Loops = No Crashes)
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history?.map(m => ({ 
          role: m.role === "user" ? "user" : "assistant", 
          content: m.content || "" 
        })) || []),
        { role: "user", content: userContent }
      ],
      temperature: 0, 
    });

    const responseText = completion.choices[0].message.content || "System operational.";

    // 6. Save & Return
    await supabase.from("chat_messages").insert({ session_id: sessionId, role: "assistant", content: responseText });
    
    if (history && history.length === 0) {
      await supabase.from("chat_sessions").update({ title: userContent.slice(0, 30) }).eq("id", sessionId);
    }

    revalidatePath("/dashboard/admin/ai-assistant");
    return { success: true, message: responseText };

  } catch (err: any) {
    console.error("🔴 FATAL ERROR:", err);
    return { success: false, error: "System Error. Please check server logs." };
  }
}

// --- HELPERS (Unchanged) ---
export async function getChatSessions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase.from("chat_sessions").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
  return data || [];
}

export async function getChatMessages(sessionId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("chat_messages").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
  return data || [];
}

export async function createChatSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("chat_sessions").insert({ user_id: user.id, title: "New Chat" }).select().single();
  revalidatePath("/dashboard/admin/ai-assistant");
  return data;
}

export async function renameSessionAction(sessionId: string, newTitle: string) {
  const supabase = await createClient();
  await supabase.from("chat_sessions").update({ title: newTitle }).eq("id", sessionId);
  revalidatePath("/dashboard/admin/ai-assistant");
}

export async function deleteSessionAction(sessionId: string) {
  const supabase = await createClient();
  await supabase.from("chat_sessions").delete().eq("id", sessionId);
  revalidatePath("/dashboard/admin/ai-assistant");
}