import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password, role, referralCode } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure they verified OTP recently
    const { data: otpRecords } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!otpRecords || otpRecords.length === 0) {
       return NextResponse.json({ error: 'Email not verified via OTP' }, { status: 400 });
    }

    // Try to create the user in Supabase Auth
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role }
    });

    if (createError) {
       return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    const userId = newUser.user.id;

    // Initialize profile
    if (role === 'job_poster') {
      await supabaseAdmin.from('job_posters').insert({
        id: userId,
        email,
        first_login: true
      });
    } else if (role === 'job_seeker') {
      await supabaseAdmin.from('candidates').insert({
        id: userId,
        email,
        first_login: true,
        referral_code_used: referralCode || null
      });
    }

    // Process referral code
    if (referralCode) {
      await supabaseAdmin.from('referral_codes').update({ is_used: true }).eq('code', referralCode);
    }

    // Sign them in
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Account created, but failed to log in automatically.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Finalize Signup Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
