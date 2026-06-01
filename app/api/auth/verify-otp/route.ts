import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, otp, role, referralCode } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    // Verify OTP in DB
    const { data: otpRecords, error: otpError } = await supabaseAdmin
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .eq('is_verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (otpError || !otpRecords || otpRecords.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark as verified
    await supabaseAdmin
      .from('otp_verifications')
      .update({ is_verified: true })
      .eq('id', otpRecords[0].id);

    // Now we must log the user in.
    // We generate a random strong password for the session
    const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10) + '!A1';
    
    let userId = null;

    // Try to create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role }
    });

    if (createError) {
      // If user exists, we need to find their ID to update their password
      if (createError.message.includes('already registered') || createError.message.includes('already exists')) {
        const tables = ['candidates', 'job_posters', 'admins', 'referrers'];
        for (const table of tables) {
          const { data } = await supabaseAdmin.from(table).select('id').eq('email', email).maybeSingle();
          if (data?.id) {
            userId = data.id;
            break;
          }
        }
        
        if (userId) {
          await supabaseAdmin.auth.admin.updateUserById(userId, { password: tempPassword });
        } else {
          // If for some reason they exist in auth but not in our tables
          return NextResponse.json({ error: 'Account exists but profile not found. Please contact support.' }, { status: 400 });
        }
      } else {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    } else {
      userId = newUser.user.id;
      // Initialize profile if new
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
    }
    
    // If user existed but they just used a referral code (rare but possible)
    if (createError && userId && role === 'job_seeker' && referralCode) {
      await supabaseAdmin.from('candidates').update({ referral_code_used: referralCode }).eq('id', userId);
    }

    // Process referral code
    if (referralCode) {
      await supabaseAdmin.from('referral_codes').update({ is_used: true }).eq('code', referralCode);
    }

    // Now sign them in to set the cookie session using @supabase/ssr
    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: tempPassword,
    });

    if (signInError) {
      return NextResponse.json({ error: 'Failed to establish session' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
