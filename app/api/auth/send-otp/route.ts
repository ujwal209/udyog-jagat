import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { sendOTPEmail } from '@/lib/mail';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

    // Upsert the OTP in otp_verifications
    const { error: dbError } = await supabaseAdmin
      .from('otp_verifications')
      .upsert({
        email,
        otp_code: otp,
        expires_at: expiresAt,
        is_verified: false,
        created_at: new Date().toISOString()
      }, { onConflict: 'email' }); // Assuming email is unique or we can just insert and select the latest during verification

    // If upsert fails because email is not unique constraint, we can just insert
    if (dbError) {
      console.error('Error inserting OTP:', dbError);
      // Fallback to simple insert if upsert fails
      await supabaseAdmin.from('otp_verifications').insert({
        email,
        otp_code: otp,
        expires_at: expiresAt,
        is_verified: false
      });
    }

    // Send the email
    const emailResult = await sendOTPEmail(email, otp);
    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
