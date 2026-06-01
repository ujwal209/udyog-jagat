import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OnboardingForm from './OnboardingForm';
import { supabaseAdmin } from '@/lib/supabase-admin';

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check role and onboarding status
  const { data: admin } = await supabaseAdmin.from('admins').select('id').eq('id', user.id).maybeSingle();
  if (admin) redirect('/dashboard/admin');

  const { data: referrer } = await supabaseAdmin.from('referrers').select('id').eq('id', user.id).maybeSingle();
  if (referrer) redirect('/dashboard/referrer');

  const { data: candidate } = await supabaseAdmin.from('candidates').select('first_login').eq('id', user.id).maybeSingle();
  const { data: poster } = await supabaseAdmin.from('job_posters').select('first_login').eq('id', user.id).maybeSingle();

  const role = candidate ? 'job_seeker' : poster ? 'job_poster' : null;

  if (!role) {
    // Edge case
    return <OnboardingForm role="job_seeker" />;
  }

  // If already onboarded
  if (candidate && !candidate.first_login) {
    redirect('/dashboard/candidate');
  }
  if (poster && !poster.first_login) {
    redirect('/dashboard/poster');
  }

  return <OnboardingForm role={role} />;
}
