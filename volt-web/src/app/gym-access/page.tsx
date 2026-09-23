import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'Gym access' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>Gym access</h1>
        <div className="volt-card"><p style={{color:'var(--volt-text-mute)'}}>Members can view memberships, locations and door status, see access history, and display a short-lived membership QR. Remote browser-based door unlocking is disabled by default: unlocking stays on the registered mobile app unless the backend implements device verification, proximity checks, reauthentication, rate limiting and full auditing.</p></div>
      </main>
      <SiteFooter />
    </>
  );
}
