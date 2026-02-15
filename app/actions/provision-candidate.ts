"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import nodemailer from "nodemailer";

export async function provisionCandidateAction(formData: FormData) {
  const email = formData.get("email") as string;
  const fullName = formData.get("fullName") as string;
  const duration = parseInt(formData.get("duration") as string); // in hours
  
  // 1. Generate Referral Code (This will be their temporary password)
  const refCode = "UJ-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + duration);

  try {
    // 2. Create the Referral Record
    await supabaseAdmin.from("referral_codes").insert({
      code: refCode,
      candidate_email: email,
      expires_at: expiresAt.toISOString()
    });

    // 3. Create Auth User (Password = Referral Code)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: refCode,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: "candidate", first_login: true }
    });

    if (authError) throw authError;

    // 4. Create Candidate Profile
    await supabaseAdmin.from("candidates").insert({
      id: authUser.user.id,
      full_name: fullName,
      email: email,
      referral_code_used: refCode,
      first_login: true
    });

    // 5. Send the Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD }
    });

    await transporter.sendMail({
      from: '"Udyog Jagat Systems" <security@udyogjagat.com>',
      to: email,
      subject: "Your Access Portal is Ready",
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #1C3FA4;">Access Provisioned</h2>
          <p>Hello ${fullName}, your referral access is active until <b>${expiresAt.toLocaleString()}</b>.</p>
          <p>Use the following Referral Code as your <b>temporary password</b> to login:</p>
          <div style="background: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; border-radius: 5px; color: #1C3FA4; letter-spacing: 2px;">
            ${refCode}
          </div>
          <p style="margin-top: 20px; font-size: 12px; color: #666;">Note: You will be required to set a permanent password upon first entry.</p>
        </div>
      `
    });

    return { success: true, code: refCode };
  } catch (error: any) {
    return { error: error.message };
  }
}