import { redirect } from 'next/navigation';
import { getAccessToken, apiBase } from '@/lib/auth/session';
export default async function Layout({ children }: { children: React.ReactNode }) {
  const at = await getAccessToken();
  if (!at) redirect('/login?next=/onboarding/profile');
  try {
    const res = await fetch(apiBase() + '/v1/profile', { headers: { Authorization: 'Bearer ' + at }, cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data?.profile?.onboardingCompleted) redirect('/app');
    }
  } catch {}
  return (<main id="main" className="volt-wrap" style={{ padding: '40px 22px', maxWidth: 640 }}><p className="volt-caps">Onboarding</p>{children}</main>);
}
