"use server";

import { supabaseAdmin } from "@/lib/supabase-admin"
import { sendOTPEmail } from "@/lib/mail"

/**
 * STEP 1: REQUEST OTP
 * Generates a 6-digit code, stores it in DB, and sends via email.
 */
export async function requestOTPAction(emailAddress: string) {
  const email = emailAddress.trim().toLowerCase();
  console.log(`🚀 [FORGOT_PASSWORD] Starting OTP request for: ${email}`);

  try {
    // 1. Verify user existence across all potential role tables
    console.log("🔍 Checking user registry...");
    let userId = null;
    let foundRole = null;
    const tables = ['admins', 'candidates', 'referrers', 'job_posters'];
    
    for (const table of tables) {
      console.log(`   - Scanning table: ${table}`);
      const { data, error } = await supabaseAdmin
        .from(table)
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (error) {
        console.error(`   ❌ Error scanning ${table}:`, error.message);
        continue; 
      }

      if (data) {
        userId = data.id;
        foundRole = table;
        console.log(`   ✅ Found user in ${table} (ID: ${userId})`);
        break;
      }
    }

    // Fallback: Check auth.users directly if not found in specific tables
    if (!userId) {
      console.log("🔍 User not found in role tables. Checking auth.users directly...");
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) {
        console.error("   ❌ Error listing users:", authError.message);
      } else {
        const authUser = authData.users.find(u => u.email?.toLowerCase() === email);
        if (authUser) {
          userId = authUser.id;
          console.log(`   ✅ Found user in auth.users (ID: ${userId})`);
        }
      }
    }

    if (!userId) {
      console.warn(`⚠️ [FORGOT_PASSWORD] Access Denied: ${email} is not registered.`);
      return { success: false, error: "This email address is not registered in our system." };
    }

    // 2. Security: Invalidate any old OTPs for this email to prevent reuse
    console.log("🧹 Invalidating old OTP tokens...");
    const { error: delError } = await supabaseAdmin
      .from('otp_verifications')
      .delete()
      .eq('email', email);
    
    if (delError) {
      console.error("   ❌ Failed to clear old OTPs:", delError.message);
      // We continue anyway, as this shouldn't block the new request
    }

    // 3. Generate 6-digit OTP and Expiration (10 mins)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString();
    console.log(`🎲 Generated OTP: ${otp} (Expires: ${expiresAt})`);

    // 4. Persistence: Log OTP to Database
    console.log("💾 Persisting OTP to database...");
    const { error: insertError } = await supabaseAdmin
      .from('otp_verifications')
      .insert({
        email: email,
        otp_code: otp,
        expires_at: expiresAt,
        is_verified: false
      });

    if (insertError) {
      console.error("   ❌ Database insertion failed:", insertError.message);
      throw new Error(`Database Error: ${insertError.message}`);
    }

    // 5. Transmission: Send Email via NodeMailer
    console.log("📧 Dispatching OTP email...");
    const mailResult = await sendOTPEmail(email, otp);
    
    if (!mailResult.success) {
      console.error("   ❌ Email dispatch failed:", mailResult.error);
      throw new Error("Unable to send recovery email. Please try again later.");
    }

    console.log("✨ [FORGOT_PASSWORD] OTP Request Successful");
    return { success: true };

  } catch (error: any) {
    console.error("🔥 [FORGOT_PASSWORD] CRITICAL FAILURE:", error.message);
    return { 
      success: false, 
      error: error.message || "An unexpected security error occurred. Please contact support." 
    };
  }
}

/**
 * STEP 2: VERIFY OTP
 * Validates the provided code against the database.
 */
export async function verifyOTPAction(emailAddress: string, otpCode: string) {
  const email = emailAddress.trim().toLowerCase();
  console.log(`🔐 [FORGOT_PASSWORD] Verifying OTP for: ${email}`);

  try {
    const { data, error } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .maybeSingle();

    if (error) {
      console.error("   ❌ Database query error:", error.message);
      return { success: false, error: "Internal verification error" };
    }

    if (!data) {
      console.warn("   ⚠️ Invalid OTP provided");
      return { success: false, error: "The provided token is invalid" };
    }

    // Check expiration
    if (new Date(data.expires_at) < new Date()) {
      console.warn("   ⚠️ OTP has expired");
      return { success: false, error: "This token has expired. Please request a new one." };
    }

    if (data.is_verified) {
      console.warn("   ⚠️ OTP already used");
      return { success: false, error: "This token has already been consumed" };
    }

    // Mark as verified in the DB for the next step
    console.log("✅ OTP Verified. Updating status...");
    const { error: updateError } = await supabaseAdmin
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', data.id);

    if (updateError) {
      console.error("   ❌ Failed to mark OTP as verified:", updateError.message);
      return { success: false, error: "Session synchronization failed" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("🔥 [FORGOT_PASSWORD] Verification Error:", err.message);
    return { success: false, error: "Unexpected verification failure" };
  }
}

/**
 * STEP 3: RESET PASSWORD
 * Finalizes the password change using Auth Admin API.
 */
export async function resetPasswordAction(emailAddress: string, otpCode: string, newPassword: string) {
  const email = emailAddress.trim().toLowerCase();
  console.log(`♻️ [FORGOT_PASSWORD] Resetting password for: ${email}`);

  try {
    // 1. Final security check: Verify the verified OTP again
    console.log("🔍 Performing final security handshake...");
    const { data: otpData, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otpCode)
      .maybeSingle();

    if (otpError || !otpData || !otpData.is_verified) {
      console.error("   ❌ Security Handshake Failed: OTP not verified or invalid session");
      return { success: false, error: "Security session expired. Please start over." };
    }

    // 2. Identify the user ID from auth via listing (most reliable)
    console.log("🔍 Fetching Auth UID...");
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) throw authError;

    const targetUser = authData.users.find(u => u.email?.toLowerCase() === email);
    
    if (!targetUser) {
      console.error("   ❌ User identity not found in Auth system");
      return { success: false, error: "User identity validation failed" };
    }

    // 3. Execute Password Update
    console.log("🏗️ Updating encrypted password...");
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
      password: newPassword
    });

    if (updateError) {
      console.error("   ❌ Auth update failed:", updateError.message);
      return { success: false, error: updateError.message };
    }

    // 4. Cleanup: Purge used OTP
    console.log("🧹 Cleaning up recovery session...");
    await supabaseAdmin.from('otp_verifications').delete().eq('id', otpData.id);

    console.log("🎉 [FORGOT_PASSWORD] Password changed successfully");
    return { success: true };

  } catch (error: any) {
    console.error("🔥 [FORGOT_PASSWORD] Reset Error:", error.message);
    return { success: false, error: "Failed to finalize password rotation" };
  }
}
