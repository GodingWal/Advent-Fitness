import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'For gyms' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>For gyms</h1>
        <div className="volt-card"><p style={{color:'var(--volt-text-mute)'}}>VOLT gives members one account for training and access. This release is member-facing only; there is no operator dashboard yet. Contact us to pilot memberships, locations and door onboarding.</p></div>
      </main>
      <SiteFooter />
    </>
  );
}
