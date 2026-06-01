import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    // Verify it's a valid cron request from Vercel
    const authHeader = request.headers.get('authorization');
    if (
      process.env.VERCEL_CRON_SECRET &&
      authHeader !== `Bearer ${process.env.VERCEL_CRON_SECRET}`
    ) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Ping Supabase to keep it awake by querying auth users 
    // (requires no specific table to exist)
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    if (error) {
      console.error('Error pinging Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Supabase pinged successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
