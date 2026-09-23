import { SiteHeader, SiteFooter } from '@/components/nav';

export const metadata = { title: 'Features' };

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="volt-wrap" style={{ padding: '40px 22px' }}>
        <p className="volt-caps">VOLT</p>
        <h1>Features</h1>
        <div className="volt-grid-2"><div className="volt-card"><h2>Track</h2><p style={{color:'var(--volt-text-mute)'}}>Manual entry, history, filters, weekly and monthly summaries, pace / distance / time / calories / elevation.</p></div><div className="volt-card"><h2>Access</h2><p style={{color:'var(--volt-text-mute)'}}>Memberships, locations, door status, 60-second QR, access history with clear denial reasons.</p></div><div className="volt-card"><h2>Discover</h2><p style={{color:'var(--volt-text-mute)'}}>Map plus accessible list, category and radius filters, saved spots, backend Places proxy.</p></div><div className="volt-card"><h2>Community</h2><p style={{color:'var(--volt-text-mute)'}}>Posts, reactions, comments, meetups, messaging with privacy-aware visibility.</p></div></div>
      </main>
      <SiteFooter />
    </>
  );
}
