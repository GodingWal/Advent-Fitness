import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'Terms' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>Terms</h1>
        <div className="volt-card"><p style={{color:'var(--volt-text-mute)'}}>Use VOLT for lawful fitness activity. Memberships and access decisions are enforced server-side. Abuse, credential sharing or tampering with access hardware may suspend your account.</p></div>
      </main>
      <SiteFooter />
    </>
  );
}
