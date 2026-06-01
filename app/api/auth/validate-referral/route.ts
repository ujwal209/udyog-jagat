import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Check referral code in DB
    const { data: referralRecord, error } = await supabaseAdmin
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .maybeSingle();

    if (error || !referralRecord) {
      return NextResponse.json({ error: 'Invalid or already used referral code' }, { status: 400 });
    }

    // Check expiration if applicable (expires_at)
    if (referralRecord.expires_at && new Date(referralRecord.expires_at) < new Date()) {
       return NextResponse.json({ error: 'Referral code has expired' }, { status: 400 });
    }

    return NextResponse.json({ success: true, email: referralRecord.candidate_email });
  } catch (error) {
    console.error('Validate Referral Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
