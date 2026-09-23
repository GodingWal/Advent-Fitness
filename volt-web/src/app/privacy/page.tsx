import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'Privacy' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>Privacy</h1>
        <div className="volt-card"><p style={{color:'var(--volt-text-mute)'}}>Profile visibility, units, notifications and session controls live under Profile and Settings. Tokens are stored in secure HTTP-only cookies, never localStorage. No lock-provider credentials ship to the browser.</p></div>
      </main>
      <SiteFooter />
    </>
  );
}
