"use server";

import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendOTPEmail } from "@/lib/mail"
import crypto from "crypto"

// Step 1: Request OTP
export async function requestOTPAction(email: string) {
  try {
    // 1. Verify user exists in any of our role tables
    let userId = null;
    const tables = ['admins', 'candidates', 'referrers', 'job_posters'];
    for (const table of tables) {
      const { data } = await supabaseAdmin.from(table).select('id').eq('email', email).single();
      if (data) {
        userId = data.id;
        break;
      }
    }

    if (!userId) {
      // Return a generic success to prevent email enumeration, or return error
      return { success: false, error: "No account found with this email" };
    }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 3. Set expiration (10 mins)
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();

    // 4. Invalidate any existing OTPs for this email by marking them expired or deleting them
    await supabaseAdmin.from('otp_verifications').delete().eq('email', email);

    // 5. Insert new OTP
    const { error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        email: email,
        otp_code: otp,
        expires_at: expiresAt,
        is_verified: false
      });

    if (dbError) throw dbError;

    // 6. Send Email
    const mailResult = await sendOTPEmail(email, otp);
    if (!mailResult.success) {
      throw mailResult.error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("OTP Request Error:", error);
    return { success: false, error: error.message || "Failed to process request" };
  }
}

// Step 2: Verify OTP
export async function verifyOTPAction(email: string, otp: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .single();

    if (error || !data) {
      return { success: false, error: "Invalid OTP" };
    }

    if (new Date(data.expires_at) < new Date()) {
      return { success: false, error: "OTP has expired" };
    }

    if (data.is_verified) {
      return { success: false, error: "OTP already used" };
    }

    // Mark as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', data.id);

    return { success: true };
  } catch (error: any) {
    console.error("OTP Verification Error:", error);
    return { success: false, error: "Failed to verify OTP" };
  }
}

// Step 3: Reset Password
export async function resetPasswordAction(email: string, otp: string, newPassword: string) {
  try {
    // 1. Verify the OTP again to ensure security
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .single();

    if (otpError || !otpData) {
      return { success: false, error: "Invalid session" };
    }

    if (!otpData.is_verified) {
      return { success: false, error: "OTP not verified" };
    }

    // 2. Find user ID
    let userId = null;
    const tables = ['admins', 'candidates', 'referrers', 'job_posters'];
    for (const table of tables) {
      const { data } = await supabaseAdmin.from(table).select('id').eq('email', email).single();
      if (data) {
        userId = data.id;
        break;
      }
    }

    if (!userId) {
      return { success: false, error: "User account no longer exists" };
    }

    // 3. Update Password via Admin API
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (updateError) throw updateError;

    // 4. Delete the OTP record so it can't be reused
    await supabaseAdmin.from('otp_verifications').delete().eq('id', otpData.id);

    return { success: true };
  } catch (error: any) {
    console.error("Password Update Error:", error);
    return { success: false, error: "Failed to change password" };
  }
}
