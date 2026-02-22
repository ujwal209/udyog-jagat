"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import nodemailer from "nodemailer";

export async function createUserAction(formData: FormData, creatorRole: string) {
  console.log("🚀 [Provisioning] Process Started");
  
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const targetRole = formData.get("role") as string;
  
  // Org Fields
  const vibhaaga = formData.get("vibhaaga") as string;
  const khanda = formData.get("khanda") as string;
  const valaya = formData.get("valaya") as string;
  const milan = formData.get("milan") as string;

  console.log(`📝 [Target]: ${email} | Role: ${targetRole}`);

  if (targetRole === "super_admin" && creatorRole !== "super_admin") {
    console.error("❌ [Security] Unauthorized Hierarchy Access");
    return { success: false, error: "Forbidden: Only Super Admins can provision System Root access." };
  }

  const tempPassword = Math.random().toString(36).slice(-10) + "UJ!";

  try {
    // 1. Create Auth User
    console.log("☁️ [Supabase] Creating Auth Identity...");
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: fullName, 
        role: targetRole,
        org_details: { vibhaaga, khanda, valaya, milan },
        is_onboarding_complete: false 
      }
    });

    if (authError) {
      console.error("❌ [Auth Error]:", authError.message);
      return { success: false, error: authError.message };
    }

    console.log("✅ [Supabase] Auth ID created:", authUser.user.id);

    // 2. Prepare DB Insert
    let table = "";
    let insertData: any = {
      id: authUser.user.id,
      email: email,
      full_name: fullName,
      status: "active",
      vibhaaga, khanda, valaya, milan
    };

    if (targetRole.includes("admin")) {
      table = "admins";
      insertData.role = targetRole; 
    } else if (targetRole === "referrer") {
      table = "referrers";
    } else if (targetRole === "job_poster") {
      table = "job_posters";
    } else {
      table = "candidates";
    }

    // 3. Insert into Specific Table
    console.log(`🗄️ [Database] Syncing to table '${table}'...`);
    const { error: dbError } = await supabaseAdmin.from(table).insert(insertData);

    if (dbError) {
      console.error("❌ [DB Error]:", dbError.message);
      // Rollback Auth User
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      return { success: false, error: `Database Sync Failed: ${dbError.message}` };
    }

    // 4. Send Email
    console.log("📧 [Email] Dispatching credentials...");
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
      });

      // Simple, Clean Email HTML
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1C3FA4;">Welcome to Udyog Jagat</h2>
          <p>Hello ${fullName},</p>
          <p>Your account has been created successfully. Below are your login details:</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Username:</strong> ${email}</p>
            <p><strong>Password:</strong> ${tempPassword}</p>
            <p><strong>Role:</strong> ${targetRole}</p>
          </div>
          <p>Please login and change your password immediately.</p>
          <a href="https://udyog-jagat.itmilanblr.co.in/login" style="background: #1C3FA4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login Now</a>
        </div>
      `;

      await transporter.sendMail({
        from: '"Udyog Jagat Admin" <no-reply@udyogjagat.com>',
        to: email,
        subject: "Your New Account Credentials",
        html: emailHtml
      });
      console.log("✅ [Email] Sent successfully");
    } catch (mailError) {
      console.error("⚠️ [Email Warning]:", mailError);
      // Don't fail the whole process if email fails, just warn
    }

    return { success: true };

  } catch (error: any) {
    console.error("🔥 [Critical Error]:", error.message);
    return { success: false, error: error.message };
  }
}